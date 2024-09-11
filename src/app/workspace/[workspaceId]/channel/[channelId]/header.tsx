'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaChevronDown } from 'react-icons/fa6';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";
import { TrashIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useChannelId } from '@/hooks/use-channel-id';
import { toast } from 'sonner';
import { useRemoveChannel } from '@/features/channels/api/use-remove-channel';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { UseCurrentMember } from '@/features/members/api/use-current-member';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    const router = useRouter();
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete this channel?",
        "This will permanently delete this channel.This action is irreversible."
    );

    const [value, setValue] = useState(title);
    const [editOpen, setEditOpen] = useState(false);

    const {data:member} = UseCurrentMember({workspaceId});
    const {mutate: updateChannel, isPending:isUpdateChannel} = useUpdateChannel();
    const {mutate: removeChannel, isPending:isRemoveChannel} = useRemoveChannel();

    const handleEditOpen = (value:boolean) => {
        if(member?.role !== "admin") return;

        setEditOpen(value);
    };

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateChannel({id: channelId, name: value},{
            onSuccess: () => {
                toast.success("Channel updated successfully");
                setEditOpen(false);
            },
            onError: () => {
                toast.error("Failed to update channel");
            }
        });
        setEditOpen(false);
    }

    const handleDelete = async () => {
         const ok = await confirm();
         
         if(!ok) return;

         removeChannel({id: channelId},{
             onSuccess: () => {
                 router.push(`/workspace/${workspaceId}`)
                 toast.success("Channel deleted successfully");
             },
             onError: () => {
                 toast.error("Failed to remove channel");
             }
         });
    }

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g,"-").toLowerCase();
        setValue(value);
    }


    return (
        <div className='bg-white border-b h-[49px] flex items-center px-4 overflow-hidden'>
            <ConfirmDialog/>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='text-lg font-semibold px-2 overflow-hidden w-auto'
                    >
                        <span className='truncate'>{title}</span>
                        <FaChevronDown className='size-2.5 ml-2' />
                    </Button>
                </DialogTrigger>
                <DialogContent className='p-0 bg-gray-50 overflow-hidden'>
                    <DialogHeader className='p-4 border-b bg-white'>
                        <DialogTitle># {title}</DialogTitle>
                    </DialogHeader>

                    <div className='px-4 pb-4 flex flex-col gap-y-2'>
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <div className='px-5 py-4 rounded-lg border cursor-pointer hover:bg-gray-50'>
                                    <div className='flex items-center justify-between'>
                                        <p className='text-sm font-semibold'>Channel Name</p>
                                        {/* <p className='text-sm text-[#1264a3] hover:underline font-semibold'> */}
                                            {member?.role === "admin" && (
                                                <p className='text-sm text-[#1264a3]'>
                                                    Edit
                                                </p>
                                            )}
                                        {/* </p> */}
                                    </div>
                                    <p className='text-sm'># {title}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Rename this Channel</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    <Input
                                        value={value}
                                        onChange={handleChange}
                                        disabled={isUpdateChannel}
                                        autoFocus
                                        required
                                        minLength={3}
                                        maxLength={80}
                                        placeholder='e.g. plan-for-the-future'
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant={"outline"} disabled={isUpdateChannel}>
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button disabled={isUpdateChannel}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {member?.role === "admin"  && (
                            <button
                                disabled={isRemoveChannel}
                                onClick={handleDelete}
                                className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600'
                            >
                                <TrashIcon className='size-4' />
                                <p className='text-sm font-semibold'>Delete Channel</p>
                            </button>
                        )} 
                        
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Header;