'use client'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { Loader, LogOutIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
export const UserButton = () => {
    const { signOut } = useAuthActions();

    const {data,isLoading} = useCurrentUser();
    if(isLoading){
        return <Loader className="size-4 animate-spin text-muted-foreground"/>
    }
    if(!data){
        return null;
    }

    console.log("data",data);
    const {name, image} = data;

    const avatarFallback = name!.charAt(0).toUpperCase();
    console.log("AvatarFallback", avatarFallback);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="size-10 hover:opacity-75 transition">
                    <AvatarImage alt={name} src={image}/>
                    <AvatarFallback className="rounded-md bg-sky-500 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right" className="w-60">
                <DropdownMenuItem onClick={() => signOut()} className="h-10">
                    <LogOutIcon className="size-4 mr-2"/>
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};