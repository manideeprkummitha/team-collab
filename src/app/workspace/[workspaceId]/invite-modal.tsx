import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
interface InviteModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    name: string;
    joinCode: string;
}

export const InviteModal = ({ open, setOpen, name, joinCode }: InviteModalProps) => {
    const workspaceId = useWorkspaceId();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "This will deactivate the current invite code and generate a new one-for this workspace."
    );

    const { mutate, isPending } = useNewJoinCode();

    const handleNewCode = async () => {
        const ok = await confirm();

        if(!ok) return;

        mutate(
            { workspaceId },
            {
                onSuccess: () => {
                    toast.success("Invite code regenerated");
                },
                onError: () => {
                    toast.error("Failed to regenerate invite code");
                },
            }
        );
    };

    const handleCopy = () => {
        const inviteLink = `${window.location.origin}/join/${workspaceId}`;
        navigator.clipboard.writeText(inviteLink).then(() => toast.success("Link copied to clipboard"));
    };

    return (
        <>
        <ConfirmDialog/>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite People to {name}</DialogTitle>
                    <DialogDescription>Use the code below to invite people to your workspace.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 items-center justify-center p-10">
                    <p className="text-4xl font-bold tracking-tight uppercase spacing-wide">{joinCode}</p>
                    <Button variant={"ghost"} size="sm" className="gap-1" onClick={handleCopy}>
                        Copy Link
                        <CopyIcon />
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <Button disabled={isPending} onClick={handleNewCode} variant={"ghost"} size="sm" className="gap-1">
                        New Code
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};
