import { useCreateMessage } from '@/features/messages/api/use-create-messages';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import dynamic from 'next/dynamic';
import Quill from 'quill';
import React, { useRef, useState } from 'react';
import { toast } from "sonner";
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-uplaod';
import { Id } from '../../../../../../convex/_generated/dataModel';

// Dynamically import the Editor component without server-side rendering
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
    placeholder: string;
    conversationId: Id<"conversations">;
}

type createMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined; 
}

const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
    
    // Use useRef to create a reference for the Quill editor instance
    const editorRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();
    console.log("Workspace ID:", workspaceId);
    console.log("Conversation ID:", conversationId);

    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();

    const handleSubmit = async (
        { body, image }: { body: string, image: File | null }) => {

        try {
            console.log("Submit initiated. Body:", body, "Image:", image);
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: createMessageValues = {
                conversationId,
                workspaceId,
                body,
                image: undefined,
            };

            console.log("Initial message values:", values);

            // If image exists, handle image upload
            if (image) {
                console.log("Attempting to upload image:", image);
                
                const url = await generateUploadUrl({}, { throwError: true });

                if (!url) {
                    throw new Error("Upload URL not found");
                }

                console.log("Generated upload URL:", url);

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Image upload failed");
                }

                const { storageId } = await result.json();
                console.log("Uploaded image storage ID:", storageId);

                values.image = storageId;

                console.log("Updated message values with image:", values);

                // Create message with image
                await createMessage(values, { throwError: true });
                console.log("Message with image created successfully");
            }

            // Create message without image
            await createMessage({
                workspaceId,
                conversationId,
                body,
            }, { throwError: true });

            console.log("Message created successfully");

            setEditorKey((prevKey) => prevKey + 1);
            console.log("Editor reset, new editorKey:", editorKey);

        } catch (error) {
            console.error("Error while submitting message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    };

    return (
        <div className='px-5 w-full'>
            <Editor
                key={editorKey}
                placeholder={placeholder} // Using the placeholder prop here
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef} // Pass the ref to the Editor component
            />
        </div>
    );
}

export default ChatInput;
