import { useMemberId } from "@/hooks/use-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { UseGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Loader } from "lucide-react";
import Header from "./header";
import ChatInput from "./ChatInput";
import { MessageList } from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";
interface ConversationProps {
    id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
    const memberId = useMemberId();
    console.log("Fetched member ID:", memberId);

    const {onOpenProfile} = usePanel();

    const { data: member, isLoading: memberLoading } = UseGetMember({ id: memberId });
    console.log("Member data:", member);
    console.log("Member loading state:", memberLoading);

    const { results, status, loadMore } = useGetMessages({
        conversationId: id,
    });

    console.log("Fetched messages:", results);
    console.log("Message loading status:", status);

    if (memberLoading || status === "LoadingFirstPage") {
        console.log("Loading member or first page of messages...");
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    console.log("Rendering conversation component...");

    return (
        <div className="flex flex-col h-full">
            <Header
                memberName={member?.user.name}
                memberImage={member?.user.image}
                onClick={() => onOpenProfile(memberId)}
            />
            
            <MessageList
                data={results}
                variant="conversation"
                memberImage={member?.user.image}
                memberName={member?.user.name}
                loadMore={() => {
                    console.log("Loading more messages...");
                    loadMore();
                }}
                isLoadingMore={status === "LoadingMore"}
                canLoadMore={status === "CanLoadMore"}
            />
            
            <ChatInput
                placeholder={`Message ${member?.user.name}`}
                conversationId={id}
            />
        </div>
    );
};
