'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useCreateChannelModal } from '@/features/channels/store/use-create-workspace-modal';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { Loader, AlertTriangle } from 'lucide-react';
import { UseCurrentMember } from '@/features/members/api/use-current-member';

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();

  const {data:member,isLoading:membersLoading} = UseCurrentMember({workspaceId});

  // Corrected: Fetch workspace and channels data properly
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

  // Corrected: Memoize channel ID
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  const isAdmin = useMemo(() => member?.role === 'admin', [member?.role]);

  // Corrected: Effect to navigate or open modal
  useEffect(() => {
    if (workspaceLoading || channelsLoading || membersLoading || !member  ||!workspace) return;

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [workspaceLoading, channelsLoading, workspace, channelId, router, open, setOpen, workspaceId, member, membersLoading, isAdmin]);

  // Corrected: Loading state rendering
  if (workspaceLoading || channelsLoading  || membersLoading) {
    return (
      <div className='h-full flex items-center justify-center flex-col gap-2'>
        <Loader className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }



  if (!workspace || !member) {
    return (
      <div className='h-full flex items-center justify-center flex-col gap-2'>
        <AlertTriangle className='h-6 w-6 text-muted-foreground' />
        <span className='text-muted-foreground text-sm'>
          Workspace not found
        </span>
      </div>
    );
  }

  // If everything is fine, return null or a component.
  return null;
};

export default WorkspaceIdPage;
