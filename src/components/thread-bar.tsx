import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";

interface ThreadBarProps {
    count?: number;
    image?: string;
    timestamp?: number;
    name?: string;
    onClick?: () => void;
}

export const ThreadBar = ({
    count = 0, // default to 0 if undefined
    image,
    timestamp,
    name="Member",
    onClick
}: ThreadBarProps) => {
    const avatarFallback = name?.charAt(0).toUpperCase() ;

    // Early return if all relevant props are missing
    if (!count && !timestamp) return null;

    // Ensure timestamp is valid
    const formattedTimestamp = timestamp ? `Last reply ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}` : "";

    console.log( " formattedTimestamp",formattedTimestamp );

    return (
        <button
            onClick={onClick}
            className="p-2 rounded-md hover:bg-white border border-transparent hover:border-border flex items-center justify-start group transition max-w-[600px]" 
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="size-6 shrink-0">
                    <AvatarImage src={image} />
                    <AvatarFallback>
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <span className="text-xs text-sky-700 hover:underline font-bold truncate">
                    {count} {count === 1 ? "reply" : "replies"}
                </span>
                    <span className="text-xs text-muted-foreground truncate group-hover:hidden block">
                        Last reply {formattedTimestamp}
                    </span>
                <span className="text-xs text-muted-foreground truncate group-hover:block hidden">
                    View Thread
                </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition shrink-0" />
        </button>
    );
}
