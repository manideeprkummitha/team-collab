import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import EmojiPicker from "emoji-picker-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface EmojiPopoverProps {
    children: React.ReactNode;
    hint?: string;
    onEmojiSelect: (emoji: any) => void;
}

export const EmojiPopover = ({ 
    children, 
    hint = "Emoji", 
    onEmojiSelect 
}: EmojiPopoverProps) => {

    
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const  onSelect = (emoji:any) => {
        console.log(emoji);
        onEmojiSelect(emoji);
        setPopoverOpen(false);

        setTimeout(() => {
            setTooltipOpen(false);
        },500)
    };
 
    return (
        <TooltipProvider>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Tooltip
                  open={tooltipOpen}
                  onOpenChange={setTooltipOpen}
                  delayDuration={50}
                > 
                    <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                            {children}
                        </TooltipTrigger>
                    </PopoverTrigger>

                    <TooltipContent className="bg-black text-white border border-white/30">
                        <p className="font-medium text-xs">{hint}</p>
                    </TooltipContent>
                </Tooltip>

                <PopoverContent className="p-0 w-full border-none shadow-none">
                    {/* Ensure the Picker renders correctly */}
                    <Picker 
                        data={data} 
                        onEmojiSelect={onSelect}
                        // onEmojiClick={onSelect}
                    />
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
};
