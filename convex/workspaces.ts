import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const generateCode = () => {
    const code = Array.from(
        { length: 6 },
        () => 
            "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");
    return code;
};

export const join = mutation({
    args:{
        joinCode: v.string(),
        workspaceId: v.id("workspaces"),
    },
    handler:async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const workspace = await ctx.db.get(args.workspaceId);

        if(!workspace) {
            throw new Error("Workspace not found");
        }

        if(workspace.joinCode !== args.joinCode.toLowerCase()) {
            throw new Error("Invalid join code");
        }

        const existingMember = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
            q.eq("workspaceId", args.workspaceId).eq("userId", userId))
        .unique();

        if(existingMember) {
            throw new Error("Already a member");
        }

        await ctx.db.insert("members", {
            userId,
            workspaceId:workspace._id,
            role:"member",
        })

        return workspace._id;
    }
});

export const newJoinCode = mutation({
    args:{
        workspaceId: v.id("workspaces"),
    },
    handler:async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
            q.eq("workspaceId", args.workspaceId).eq("userId", userId))
        .unique();

        if(!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const joinCode = generateCode();
        
        await ctx.db.patch(args.workspaceId,{
            joinCode,
        })

        return args.workspaceId;
    }
})

// Mutation to create a new workspace
export const create = mutation({
    args: {
        name: v.string(),  // The name of the workspace is required as an argument
    },
    handler: async (ctx, args) => {
        // Retrieve the user ID from the authentication context
        const userId = await getAuthUserId(ctx);

        // Check if the user is authenticated
        if (!userId) {
            throw new Error("Unauthorized");  // Throw an error if the user is not authenticated
        }

        // Generate a join code
        const joinCode = generateCode();

        try {
            // Insert a new workspace into the 'workspaces' table
            const workspaceId = await ctx.db.insert("workspaces", {
                name: args.name,  // Use the name provided in the arguments
                userId,           // Associate the workspace with the authenticated user
                joinCode,         // Include the generated join code
            });

            // Insert the user as a member of the new workspace with the role 'admin'
            await ctx.db.insert("members", {
                userId,          // Link the member to the authenticated user
                workspaceId,     // Link the member to the newly created workspace
                role: "admin"    // Set the role of the user as 'admin'
            });

            await ctx.db.insert("channels", {
                name:"general",
                workspaceId,
            })

            // Return the ID of the newly created workspace
            return workspaceId;
        } catch (error) {
            // Log any errors that occur during the workspace or member insertion
            console.error("Error during workspace or member insertion:", error);
            throw new Error("Failed to create workspace and add member.");  // Throw a general error message
        }
    }
});

// Query to get all workspaces that the authenticated user is a member of
export const get = query({
    args: {},
    handler: async (ctx) => {
        // Retrieve the user ID from the authentication context
        const userId = await getAuthUserId(ctx);

        // Return an empty array if the user is not authenticated
        if (!userId) {
            return [];
        }

        // Query the 'members' table to find all memberships for the authenticated user
        const members = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))  // Use an index on 'userId' to efficiently find memberships
            .collect();

        // Extract the IDs of the workspaces the user is a member of
        const workspaceIds = members.map((member) => member.workspaceId);

        const workspaces = [];

        // Loop through the workspace IDs to fetch each workspace's details
        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId);  // Fetch the workspace by its ID

            // Only add the workspace to the list if it exists
            if (workspace) {
                workspaces.push(workspace);
            }
        }

        // Return the list of workspaces the user is a member of
        return workspaces;
    },
});

export const getInfoById = query({
    args: {
        // Defining the arguments that the query will accept. 
        // Here, we expect an 'id' for the workspace, which is validated to be of type 'workspaces'
        id: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // Log the arguments received for the query
        console.log("Query called with arguments:", args);

        // Get the user ID from the context, typically through authentication information
        const userId = await getAuthUserId(ctx);
        console.log("Authenticated User ID:", userId); // Log the user ID obtained for debugging

        // If no user ID is found, the user is not authenticated, so return null
        if (!userId) {
            console.log("No authenticated user found. Returning null.");
            return null;
        }

        // Check if the user is a member of the workspace by querying the "members" table
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                // Using an index to search by both workspace ID and user ID to ensure unique membership
                q.eq("workspaceId", args.id).eq("userId", userId)
            )
            .unique();
        console.log("Membership status (if found):", member); // Log the membership status (should be non-null if the user is a member)

        // Retrieve the workspace information using the workspace ID
        const workspace = await ctx.db.get(args.id);
        console.log("Workspace data retrieved:", workspace); // Log the workspace data retrieved for validation

        // Construct and log the final result object
        const result = {
            name: workspace?.name, // Name of the workspace, if available
            isMember: !!member,    // Boolean indicating if the user is a member of the workspace
        };
        console.log("Final result:", result); // Log the final result being returned

        // Return the final result
        return result;
    },
});


// Query to get a specific workspace by its ID, but only if the authenticated user is a member
export const getById = query({
    args: { id: v.id("workspaces") },  // Requires the workspace ID as an argument
    handler: async (ctx, args) => {
        // Retrieve the user ID from the authentication context
        const userId = await getAuthUserId(ctx);

        // Throw an error if the user is not authenticated
        if (!userId) {
            console.error("Unauthorized access attempt: User ID not found");
            throw new Error("Unauthorized");
        }

        // Check if the user is a member of the specified workspace by querying the 'members' table
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),  // Use a composite index on 'workspaceId' and 'userId'
            )
            .unique();  // Expecting only one member record for the combination of workspace and user

        // If the user is not a member of the workspace, return null
        if (!member) {
            console.error(`Unauthorized access: User ${userId} is not a member of workspace ${args.id}`);
            return null;
        }

        // If the user is a member, fetch and return the workspace details
        return await ctx.db.get(args.id);
    },
});

export const update = mutation({
    args:{
        id: v.id("workspaces"),
        name: v.string(),
    },
    handler:async(ctx, args) => {
        // Retrieve the user ID from the authentication context
        const userId = await getAuthUserId(ctx);

        // Throw an error if the user is not authenticated
        if (!userId) {
            console.error("Unauthorized access attempt: User ID not found");
            throw new Error("Unauthorized");
        }

        // Check if the user is a member of the specified workspace by querying the 'members' table
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),  // Use a composite index on 'workspaceId' and 'userId'
            )
            .unique();  // Expecting only one member record for the combination of workspace and user

        if(!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name
        });

        return args.id;
    }
})

export const remove = mutation({
    args:{
        id:v.id("workspaces"),
    },
    handler:async(ctx, args) => {
        // Retrieve the user ID from the authentication context
        const userId = await getAuthUserId(ctx);

        // Throw an error if the user is not authenticated
        if (!userId) {
            console.error("Unauthorized access attempt: User ID not found");
            throw new Error("Unauthorized");
        }

        // Check if the user is a member of the specified workspace by querying the 'members' table
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),  // Use a composite index on 'workspaceId' and 'userId'
            )
            .unique();  // Expecting only one member record for the combination of workspace and user

        if(!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const [members, channels, conversations, messages, reactions] = await Promise.all([
            ctx.db
                .query("members")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("channels")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("conversations")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("messages")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("reactions")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
        ]);

        for (const member of members) {
            await ctx.db.delete(member._id);
        }

        for (const channel of channels) {
            await ctx.db.delete(channel._id);
        }

        for(const conversation of conversations) {
            await ctx.db.delete(conversation._id);
        }

        for(const message of messages) {
            await ctx.db.delete(message._id);
        }

        for(const reaction of reactions) {
            await ctx.db.delete(reaction._id);
        }


        await ctx.db.delete(args.id);

        return args.id;
    }
})