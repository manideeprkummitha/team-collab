'use client'
import React, { Children } from 'react';
import { Toolbar } from './toolbar';
import { Sidebar } from './sidebar';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceSidebar } from './workspace-sidebar';
import { usePanel } from '@/hooks/use-panel';
import { Loader } from 'lucide-react';
import { Thread } from '@/features/messages/components/thread';
import { Id } from '../../../../convex/_generated/dataModel';
import { Profile } from '@/features/members/components/profile';

interface WorkspaceIdLayoutProps {
    children: React.ReactNode
}

const WorkspaceLayout = ({children}: WorkspaceIdLayoutProps) => {
  const {parentMessageId,profileMemberId, onClose} = usePanel();

  console.log("profileMemberId", profileMemberId);
  const showPanel = !!parentMessageId || !!profileMemberId;

  return (
    <div className='h-full'>
        <Toolbar/>
        <div className='flex h-[calc(100vh-40px)]'>
            <Sidebar/>
            <ResizablePanelGroup
                direction='horizontal'
                autoSaveId='ca-workspace-layout'
            >
                <ResizablePanel
                  defaultSize={20}
                  minSize={11}
                  className='bg-[#5E2C5F]'
                >
                    <WorkspaceSidebar/>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel 
                  minSize={20}
                >
                    {children}
                </ResizablePanel>
                {showPanel && (
                  <>
                    <ResizableHandle withHandle/>
                    <ResizablePanel minSize={20} defaultSize={80}>
                      {parentMessageId ? (
                        <Thread
                          messageId={parentMessageId as Id<"messages">}
                          onClose={onClose}
                        />
                      ):profileMemberId ? (
                        <Profile
                          memberId={profileMemberId as Id<"members">}
                          onClose={onClose}
                        />
                      ):(
                        <div className='flex h0full items-center justify-center'>
                          <Loader className='size-5 animate-spin text-muted-foreground'/>
                        </div>
                    )}

                    </ResizablePanel>
                  </>
                )}
            </ResizablePanelGroup>
        </div>
    </div>
  );
};

export default WorkspaceLayout