import { useCreateMessage } from '@/features/messages/api/use-create-messages';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import dynamic from 'next/dynamic';
import Quill from 'quill';
import React, { useRef,useState } from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import {toast} from "sonner";
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-uplaod';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { create } from 'domain';
// Dynamically import the Editor component without server-side rendering
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
    placeholder: string;
}

type createMessageValues = {
    channelId:Id<"channels">;
    workspaceId:Id<"workspaces">;
    body:string;
    image: Id<"_storage"> | undefined; 
}

const ChatInput = ({ placeholder }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
        // Use useRef to create a reference for the Quill editor instance
    const editorRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();

    const {mutate:generateUploadUrl} = useGenerateUploadUrl();
    const {mutate:createMessage} = useCreateMessage();

    const handleSubmit = async (
        {body, image}
        :{body:string, image:File | null}) => {

        try{
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values : createMessageValues = {
                channelId,
                workspaceId,
                body,
                image:undefined,
            }

            if(image){
                const url = await generateUploadUrl({},{throwError:true});

                if(!url){
                    throw new Error("Url not found");
                }

                const result = await fetch(url,{
                    method:"POST",
                    headers:{"Content-Type":image.type},
                    body:image,
                })

                if(!result.ok){
                    throw new Error("Failed to upload image");
                }

                const {storageId} = await result.json();

                values.image = storageId;

                await createMessage(values,{throwError:true});

            }
            
            await createMessage({
                    workspaceId,
                    channelId,
                    body,
                },{throwError:true});
        
            setEditorKey((prevKey) => prevKey + 1);
            // editorRef.current?.setContents([]);
    
        }catch(error){
            toast.error("Failed to send message");
        }finally {
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
                // imageElementRef = {}
            />
        </div>
    );
}

export default ChatInput;
