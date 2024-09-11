import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import { useCreateChannelModal } from "../store/use-create-workspace-modal";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
export const CreateChannelModal = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [open, setOpen] = useCreateChannelModal();

    const {mutate, isPending} = useCreateChannel();

    const [name, setName] = useState("");

    const handleClose = () => {
        setName("");
        setOpen(false);
    }

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g,"-").toLowerCase();
        setName(value);
    }

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate({name,workspaceId},
            {
                onSuccess:(id) => {
                    router.push(`/workspace/${workspaceId}/channel/${id}`);
                    handleClose();
                    toast.success("Channel created successfully");
                },
                onError:()  => {
                    toast.error("Failed to create channel");
                }
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add a channel
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={name}
                      disabled={isPending}
                      onChange={handleChange}
                      required
                      autoFocus
                      maxLength={80}
                      minLength={3}
                      placeholder="e.g. plan-budget"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending} type="submit">
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}