'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaChevronDown } from 'react-icons/fa6'; // Ensure this import works for your icon library
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
    memberName?: string;
    memberImage?: string;
    onClick?: () => void;
}

const Header = ({
     memberName = "Member", 
     memberImage, 
     onClick 
    }: HeaderProps) => {
    // Fallback to use the first letter of the memberName if the avatar image is not available
    const avatarFallback = memberName.charAt(0).toUpperCase();

    return (
        <div className='bg-white border-b h-[49px] flex items-center px-4 overflow-hidden'>
            <Button
               variant={"ghost"}
               className='flex items-center text-lg font-semibold px-2 w-auto'
               size="sm"
               onClick={onClick}
            >
                <Avatar className='w-8 h-8 mr-2'>
                    <AvatarImage src={memberImage} alt={memberName} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <span className='truncate'>
                    {memberName}
                </span>
                <FaChevronDown className='ml-2 size-2.5' />
            </Button>
        </div>
    );
};

export default Header;
