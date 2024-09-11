import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";

// Dynamic imports to reduce the load on SSR
const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string;

}

const formatFullTime = (date: Date) => {
  return `${
    isToday(date)
      ? "Today"
      : isYesterday(date)
      ? "Yesterday"
      : format(date, "MMM d, yyyy")
  } at ${format(date, "h:mm:ss a")}`;
};

export const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
  threadName,
}: MessageProps) => {

  const {parentMessageId, onOpenMessage, onOpenProfile, onClose} = usePanel();

  const fallbackLabel = authorName.charAt(0).toUpperCase(); // Define fallback label from author name

  const [ConfirmDialog, confirm] = useConfirm(
      "Delete Message",
      "Are you sure you want to delete this message? This cannot be undone"
  );

  // Hook to handle message update logic
  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemoveMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isToggleReaction } = useToggleReaction();

  const isPending = isUpdatingMessage || isToggleReaction;

  const handleReaction = (value:string) => {
    toggleReaction({messageId: id, value},{
      onError: () => {
        toast.error("Failed to toggle reaction");
      },
    });
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if(!ok) return;

    removeMessage({id},{
        onSuccess: () => {
            toast.success("Message deleted successfully");

            // if(parentMessageId === id){
            //   onClose();
            // }

        },
        onError: () => {
            toast.error("Failed to delete message");
        }
    })
  }

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message updated successfully");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to update message");
        },
      }
    );
  };

  // Memoize parsed body to avoid unnecessary parsing on every render
  const parsedBody = useMemo(() => {
    try {
      // Attempt to parse if body is JSON, fallback to plain text if it fails
      return JSON.parse(body);
    } catch {
      return body;
    }
  }, [body]);

  // Compact message rendering logic
  if (isCompact) {
    return (
    <>
       <ConfirmDialog/>
            <div
            className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433]",
            isRemoveMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
            )}
        >
            {isEditing ? (
            <div>
                <Editor
                onSubmit={handleUpdate}
                disabled={isUpdatingMessage}
                defaultValue={parsedBody}
                onCancel={() => setEditingId(null)}
                variant="update"
                />
            </div>
            ) : (
            <div className="flex items-start gap-2">
                <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                    {format(new Date(createdAt), "HH:mm")}
                </button>
                </Hint>
                <div className="flex flex-col w-full">
                <Renderer value={parsedBody} />
                <Thumbnail url={image} />
                {updatedAt ? (
                    <span className="text-xs text-muted-foreground">(edited)</span>
                ):null}
                <Reactions
                  data={reactions}
                  onChange={handleReaction}
                />

                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  timestamp={threadTimestamp}
                  name={threadName}
                  onClick={() => onOpenMessage(id)}
                />

                </div>
            </div>
            )}

            {!isEditing && (
            <Toolbar
                isAuthor={isAuthor}
                isPending={isUpdatingMessage}
                handleEdit={() => setEditingId(id)}
                handleThread={() => onOpenMessage(id)}
                handleDelete={handleDelete}
                handleReaction={handleReaction}
                hideThreadButton={hideThreadButton}
            />
            )}
        </div>
    </>
     
    );
  }

  // Full message rendering logic
  return (
    <>
       <ConfirmDialog/>
            <div
        className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433]",
            isRemoveMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
        >
        <div className="flex items-start gap-2">
            <button onClick={() => onOpenProfile(memberId)}>
            <Avatar>
                <AvatarImage src={authorImage} />
                <AvatarFallback>{fallbackLabel}</AvatarFallback>
            </Avatar>
            </button>
            {isEditing ? (
            <div className="w-full h-full">
                <Editor
                onSubmit={handleUpdate}
                disabled={isUpdatingMessage}
                defaultValue={parsedBody}
                onCancel={() => setEditingId(null)}
                variant="update"
                />
            </div>
            ) : (
            <div className="flex flex-col w-full overflow-hidden">
                <div className="text-sm">
                <button onClick={() => onOpenProfile(memberId)} className="font-bold text-primary hover:underline">
                    {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                    <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                    </button>
                </Hint>
                </div>
                <Renderer value={parsedBody} />
                <Thumbnail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                ):null}
                <Reactions
                  data={reactions}
                  onChange={handleReaction}
                />

                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  timestamp={threadTimestamp}
                  name={threadName}
                  onClick={() => onOpenMessage(id)}
                />

            </div>
            )}

            {!isEditing && (
            <Toolbar
                isAuthor={isAuthor}
                isPending={isUpdatingMessage}
                handleEdit={() => setEditingId(id)}
                handleThread={() => onOpenMessage(id)}
                handleDelete={handleDelete}
                handleReaction={handleReaction}
                hideThreadButton={hideThreadButton}
            />
            )}
        </div> 
        </div>

    </>
  );
};
