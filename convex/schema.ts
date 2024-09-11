import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { channel } from "diagnostics_channel";

const schema = defineSchema({
    // Include the authentication-related tables provided by the convex auth package
    ...authTables,

    // Table for storing workspace information, including the name of the workspace,
    // the user ID of the creator, and a unique join code for inviting members.
    workspaces: defineTable({
        name: v.string(),          // The name of the workspace
        userId: v.id("users"),     // References the user who created the workspace
        joinCode: v.string(),      // A unique code to join the workspace
    }),

    // Table for managing members of workspaces, storing relationships between users and workspaces,
    // and defining roles such as "admin" or "member". Includes indexes for efficient querying.
    members: defineTable({
        userId: v.id("users"),     // References the user in the workspace
        workspaceId: v.id("workspaces"), // References the workspace the user is part of
        role: v.union(v.literal("admin"), v.literal("member")) // Defines the user's role within the workspace
    })
    .index("by_user_id", ["userId"]) // Index for querying members by user ID
    .index("by_workspace_id", ["workspaceId"]) // Index for querying members by workspace ID
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]), // Composite index for queries involving both workspace ID and user ID

    channels:defineTable({
        name: v.string(),
        workspaceId: v.id("workspaces"),
    }).index("by_workspace_id", ["workspaceId"]),


    conversations:defineTable({
        workspaceId:v.id("workspaces"),
        memberOneId:v.id("members"),
        memberTwoId:v.id("members"),
    }).index("by_workspace_id", ["workspaceId"]),

    messages:defineTable({
        body:v.string(),
        image:v.optional(v.id("_storage")),
        memberId:v.id("members"),
        workspaceId:v.id("workspaces"),
        channelId:v.optional(v.id("channels")),
        parentMessageId:v.optional(v.id("messages")),
        conversationId:v.optional(v.id("conversations")),
        updatedAt:v.optional(v.number()),
    }).index("by_workspace_id", ["workspaceId"])
    .index("by_member_id", ["memberId"])
    .index("by_channel_id", ["channelId"])
    .index("by_parent_message_id", ["parentMessageId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_channel_id_parent_message_id_conversation_id",["channelId","parentMessageId","conversationId"]),

    reactions:defineTable({
        workspaceId:v.id("workspaces"),
        messageId:v.id("messages"),
        memberId:v.id("members"),
        value:v.string(),
    }).index("by_workspace_id", ["workspaceId"])
    .index("by_member_id", ["memberId"])
    .index("by_message_id", ["messageId"]),
    
});

export default schema;
