'use client';

import React, { useEffect, useState } from 'react';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation';
import { AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Doc } from '../../../../../../convex/_generated/dataModel';
import { Conversation } from './conversation';
import { Id } from '../../../../../../convex/_generated/dataModel';

const MemberIdPage = () => {
    const memberId = useMemberId();
    const workspaceId = useWorkspaceId();

    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);  // Maintaining conversationId state

    const { data, mutate, isPending } = useCreateOrGetConversation(); // Hook to create or get conversation

    useEffect(() => {
        mutate({ memberId, workspaceId }, {
            onSuccess(data: any) {  // Add type for `data`
                // toast.success("Conversation created successfully");
                // console.log({ data });
                setConversationId(data);
                console.log(data);
            },
            onError() {  // Add type for `error` and use `_` if not needed
                toast.error("Failed to create or get conversation");
                // console.log("Error occurred:", _error);
            }
        });
    }, [memberId, workspaceId, mutate]);

    if (isPending) {
        return (
            <div className="h-full items-center justify-center flex">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!conversationId) {
        return (
            <div className="h-full items-center justify-center flex">
                <AlertTriangle className="size-6 text-muted-foreground" />
                <span className='text-sm text-muted-foreground'>
                    Conversation not found
                </span>
            </div>
        );
    }

    return (
        <Conversation id={conversationId} />
    );
};

export default MemberIdPage;
