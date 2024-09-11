import { mutation, query,QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server"; // Import the correct function
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const populateUser = (ctx:QueryCtx, id: Id<"users">) => {
    return ctx.db.get(id);
}

export const getById = query({
    args: { id: v.id("members") },
    handler:async(ctx,args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId) {
            return null;
        }
        

        const member = await ctx.db.get(args.id);

        if(!member) {
            return null;
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId",member.workspaceId).eq("userId", userId),  // Use a composite index on 'workspaceId' and 'userId'
            )
            .unique();

        if(!currentMember) {
            return null;
            }

        const user = await populateUser(ctx, member.userId);

        if(!user) {
            return null;
        }

        return { ...member, user };
    }
})

export const get = query({
    args: { workspaceId: v.id("workspaces") },
    handler:async(ctx,args) => {
        console.log("Fetching current workspace details for user...");

        // Use the correct function to get the authenticated user ID
        const userId = await getAuthUserId(ctx);
        console.log("Retrieved user ID:", userId);

        // Check if the user is authenticated
        if (!userId) {
            return []; // Return null if the user is not authenticated
        }

        // Query the 'members' table to find the user membership for the specified workspace
        const member = await ctx.db.query("members")
            .withIndex('by_workspace_id_user_id', (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique();
        console.log("Membership check result:", member);

        if(!member) {
            return [];
        }

        const data = await ctx.db
            .query("members")
            .withIndex('by_workspace_id', (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const members = []

        for (const member of data) {
            const user = await populateUser(ctx, member.userId);

            if(user){
                members.push({
                    ...member,
                    user,
                });
            }
        }

        return members;
    }
});

export const current = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        console.log("Fetching current workspace details for user...");

        // Use the correct function to get the authenticated user ID
        const userId = await getAuthUserId(ctx);
        console.log("Retrieved user ID:", userId);

        // Check if the user is authenticated
        if (!userId) {
            console.error("Unauthorized access attempt: User ID not found");
            return null; // Return null if the user is not authenticated
        }

        // Query the 'members' table to find the user membership for the specified workspace
        const member = await ctx.db.query("members")
            .withIndex('by_workspace_id_user_id', (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique();
        console.log("Membership check result:", member);

        // Check if the user is a member of the workspace
        // if (member.length === 0) {
        //     console.error(`Unauthorized access: User ${userId} is not a member of workspace ${args.workspaceId}`);
        //     return null; // Return null if the user is not a member
        // }

        if(!member) {
            console.error(`Unauthorized access: User ${userId} is not a member of workspace ${args.workspaceId}`);
            return null;
        }

        // Additional logic can be added here if needed
        console.log("User is a member of the workspace.");
        return member; // Return the member details or adjust as needed
    },
});

export const update = mutation({
    args:{
        id:v.id("members"),
        role:v.union(v.literal("admin"),v.literal("member")),
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if(!member){
            throw new Error("Member not found");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId",member.workspaceId)
                .eq("userId", userId))
                .unique(); // Use a composite index on 'workspaceId' and 'userId'
                
        
        if(!currentMember || currentMember.role !== "admin"){
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id,{
            role:args.role,
        })

        return args.id;
    }
});

export const remove = mutation({
    args:{
        id:v.id("members"),
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if(!member){
            throw new Error("Member not found");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId",member.workspaceId)
                .eq("userId", userId))
                .unique(); // Use a composite index on 'workspaceId' and 'userId'
                
        
        if(!currentMember){
            throw new Error("Unauthorized");
        }

        if(member.role === "admin"){
            throw new Error("Admin cannot remove admin");
        }

        if(currentMember._id === args.id && currentMember.role === "admin"){
            throw new Error("Cannot remove self if self is an admin");
        }

        const [messages, reactions, conversations] = await Promise.all([
            ctx.db
                .query("messages")
                .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
                .collect(),
            ctx.db
                .query("reactions")
                .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
                .collect(),
            ctx.db
                .query("conversations")
                .filter((q) => q.or(
                    q.eq(q.field("memberOneId"), member._id),
                    q.eq(q.field("memberTwoId"), member._id)
                ))
                .collect(),
        ]);

        for(const message of messages){
            await ctx.db.delete(message._id);
        }

        for(const reaction of reactions){
            await ctx.db.delete(reaction._id);
        }

        for(const conversation of conversations){
            await ctx.db.delete(conversation._id);
        }


        await ctx.db.delete(member._id);

        return args.id;
    }
})