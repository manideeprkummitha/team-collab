import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const BATCH_SIZE = 20;

interface UseGetMessagesProps {
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
    parentMessageId?: Id<"messages">;
}

export type GetMessagesReturnType = typeof api.messages.get._returnType["page"];

export const useGetMessages = ({
    channelId,
    conversationId,
    parentMessageId
}: UseGetMessagesProps) => {
    // Log the props passed into this hook
    console.log("useGetMessages called with:", { channelId, conversationId, parentMessageId });

    // Execute the paginated query and log its result
    const { results, status, loadMore } = usePaginatedQuery(
        api.messages.get,
        { channelId, conversationId, parentMessageId },
        { initialNumItems: BATCH_SIZE }
    );

    // Log the returned data from usePaginatedQuery
    console.log("Results from usePaginatedQuery:", results);
    console.log("Query status:", status);

    // Log before returning the values
    console.log("Returning results, status, and loadMore function...");

    return {
        results,
        status,
        loadMore: () => {
            console.log("Loading more messages with batch size:", BATCH_SIZE);
            loadMore(BATCH_SIZE);
        }
    };
};
