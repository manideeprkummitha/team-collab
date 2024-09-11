import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";
import { useCreateWorkSpace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
export const CreateWorkspaceModal = () => {
    const router = useRouter()
    const [open, setOpen] = useCreateWorkspaceModal();
    const [name, setName] = useState("");

    const { mutate, isPending } = useCreateWorkSpace();

    const handleClose = () => {
        setOpen(false);
        setName("");
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ name }, {
            onSuccess(id) {
                console.log(id);
                toast.success("Workspace created successfully")
                router.push(`/workspace/${id}`)
                handleClose();
                // Optional: Handle success (e.g., reset form or show a success message)
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={name}  // Bind to the `name` state
                      onChange={(e) => setName(e.target.value)} // Update state on change
                      disabled={isPending}
                      required
                      autoFocus
                      minLength={3}
                      placeholder="Workspace name e.g. 'Word', 'Personal', 'Home'"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateWorkspaceModal;
