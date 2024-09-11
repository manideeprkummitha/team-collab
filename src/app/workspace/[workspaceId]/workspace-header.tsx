import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Doc } from '../../../../convex/_generated/dataModel';
import { ChevronDown,ListFilter,SquarePen } from 'lucide-react';
import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Hint } from '@/components/hint';
import { PreferencesModal } from './preferences-modal';
import { InviteModal } from './invite-modal';
interface WorkspaceHeaderProps {
    workspace: Doc<"workspaces">;
    isAdmin: boolean;
}

const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {

    console.log("workspace", workspace);
    const [preferencesOpen, setPreferencesOpen] = React.useState(false);    
    const [inviteOpen, setInviteOpen] = React.useState(false);

    return (
        <>
        <InviteModal
          open = {inviteOpen}
          setOpen = {setInviteOpen}
          name={workspace.name}
          joinCode={workspace.joinCode}
        />
        <PreferencesModal 
                open={preferencesOpen} 
                setOpen={setPreferencesOpen} 
                initialValue={workspace.name}/>
        <div className='flex items-center justify-between px-4 h-[49px] gap-0.5'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={'transparent'}
                        size="sm"
                        className='font-semibold text-lg w-auto p-1.5 overflow-hidden'
                    >
                        <span className='truncate'>{workspace.name}</span>
                        <ChevronDown className='size-4 ml-1 shrink-0' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-64' align='start' side='bottom'>
                    <DropdownMenuItem
                        className="cursor-pointer capitalize flex items-center focus:ring-0 border-0 "
                    >
                        <div className='size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-ml rounded-md flex items-center justify-center mr-2'>
                            {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex flex-col items-start'>
                            <p className='font-bold'>{workspace.name}</p>
                            <p className='text-xs text-muted-foreground'>Active Workspace</p>
                        </div>
                    </DropdownMenuItem>
                    {isAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='cursor-pointer py-2 hover:bg-slate-100 focus:outline-none focus:ring-0 border-0'
                                onClick={() => setInviteOpen(true)}
                            >
                                Invite people to this {workspace.name}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='cursor-pointer py-2 hover:bg-slate-100 focus:outline-none focus:ring-0 border-0'
                                onClick={() => setPreferencesOpen(true)}
                            >
                                Preferences
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className='flex items-center gap-0.5'>
                <Hint side="bottom" label="Filter messages">
                    <Button variant={"transparent"} size="iconSm">
                        <ListFilter className='size-4' />
                    </Button>
                </Hint>
                <Hint side="bottom" label="New message">
                    <Button variant={"transparent"} size="iconSm">
                        <SquarePen className='size-4' />
                    </Button>
                </Hint>
            </div>
        </div>

        </>
    )
}

export default WorkspaceHeader;
