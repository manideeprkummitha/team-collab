import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from "@/features/members/store/use-profile-member";
export const usePanel = () => {
    const [parentMessageId, setParentMessageId] = useParentMessageId();
    const [profileMemberId, setProfileMemberId] = useProfileMemberId();

    const onOpenProfile = (messageId : string) => {
        setProfileMemberId(messageId);
        setParentMessageId(null);
    }

    const onOpenMessage = (messageId : string) => {
        setParentMessageId(messageId);
        setProfileMemberId(null);
    };

    const onClose = () =>{
        setParentMessageId(null);
        setProfileMemberId(null);
    };

    return {
        parentMessageId,
        profileMemberId,
        onOpenProfile,
        onOpenMessage,
        onClose,
    }
}