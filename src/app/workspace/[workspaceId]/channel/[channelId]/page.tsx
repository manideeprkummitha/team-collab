'use client';

import React from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { Loader, TriangleAlert } from 'lucide-react';
import Header from './header';
import ChatInput from './ChatInput';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { MessageList } from '@/components/message-list';

const ChannelIdPage = () => {
    const channelId = useChannelId();

    const {results, status, loadMore}  = useGetMessages({ channelId });
    console.log("results", results);

    const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });

    if (channelLoading || status === "LoadingFirstPage") {
        return (
            <div className='h-full flex-1 flex flex-col items-center justify-center'>
                <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!channel) {
        return (
            <div className='h-full flex-1 flex flex-col gap-y-2 items-center justify-center'>
                <TriangleAlert className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    Channel not found
                </span>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <Header title={channel.name} />
            {/* <div className='flex-1 overflow-y-auto'>
                {JSON.stringify(results)}
            </div> */}
            <MessageList
                channelName = {channel.name}
                channelCreationTime = {channel._creationTime}
                data = {results}
                loadMore = {loadMore}
                isLoadingMore = {status === "LoadingMore"}
                canLoadMore = {status === "CanLoadMore"}
            />
            <div className='border-t mb-5'>
                <ChatInput  placeholder={`Message #${channel.name}`}
                />
            </div>
        </div>
    );
};

export default ChannelIdPage;
