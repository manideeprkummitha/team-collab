import React, { useState, useEffect, useLayoutEffect, useRef, MutableRefObject } from 'react';
import Quill, { type QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import { PiTextAa } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Smile, ImageIcon, XIcon } from 'lucide-react';
import { MdSend } from "react-icons/md";
import { Hint } from './hint';
import { Delta, Op } from 'quill/core';
import { cn } from '@/lib/utils';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';

type EditorValue = {
    image: File | null;
    body: string;
}

interface EditorProps {
    onSubmit: ({ image, body }: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
    variant?: "create" | "update";
}

const Editor = ({
    onSubmit,
    onCancel,
    placeholder = "Write Something",
    defaultValue = [],
    disabled = false,
    innerRef,
    variant = "create"
}: EditorProps) => {

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const disabledRef = useRef(disabled);
    const imageElementRef = useRef<HTMLInputElement | null>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        disabledRef.current = disabled;
        defaultValueRef.current = defaultValue;
    }, [onSubmit, placeholder, disabled, defaultValue]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div")
        );

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link"],
                    [{ list: "ordered" }, { list: "bullet" }],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                // Handle submit action on enter
                                handleSubmit();
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quillRef.current?.insertText(quillRef.current.getSelection()?.index || 0, "\n");
                            }
                        }
                    }
                },
            }
        };

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        if (innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        });

        return () => {
            quill.off(Quill.events.TEXT_CHANGE);
            if (container) {
                container.innerHTML = "";
            }
            if (quillRef.current) {
                quillRef.current = null;
            }
            if (innerRef) {
                innerRef.current = null;
            }
        };
    }, [innerRef]);

    const toggleToolbar = () => {
        setIsToolbarVisible((current) => !current);
        const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

        if (toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    };

    const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    const onEmojiSelect = (emoji: any) => {
        const quill = quillRef.current;

        quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
    };

    const handleSubmit = () => {
        try {
            const body = quillRef.current?.getText() || ""; // Get plain text from Quill
            const addedImage = imageElementRef.current?.files?.[0] || null;

            // Debugging logs for validation
            console.log("Submitting Content:", body);
            console.log("Image Selected:", addedImage);

            if (!body.trim() && !addedImage) {
                console.log("Cannot submit: No text or image provided.");
                return;
              }
          
              onSubmit({
                body, // Text content
                image: addedImage, // Image if provided
              });

        } catch (error) {
            console.error("Error during submission:", error);
        }
    };

    const handleImageRemove = () => {
        setImage(null);
        if (imageElementRef.current) {
            imageElementRef.current.value = "";
        }
    };

    return (
        <div className='flex flex-col'>
            <input
                type="file"
                accept='image/*'
                ref={imageElementRef}
                onChange={(event) => setImage(event.target.files![0])}
                className='hidden'
            />
            <div className={cn(
                'flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white',
                disabled && 'opacity-50',
                )}>
                <div ref={containerRef} className='h-full ql-custom' />

                {!!image && (
                    <div className='p-2'>
                        <div className='relative size-[62px] flex items-center justify-center group/image'>
                            <Hint label="Remove image">
                                <button
                                    onClick={handleImageRemove}
                                    className='hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center'
                                >
                                    <XIcon className='size-3.5' />
                                </button>
                            </Hint>
                            <Image
                                src={URL.createObjectURL(image)}
                                alt="Uploaded image"
                                fill
                                className='rounded-xl overflow-hidden border object-cover'
                            />
                        </div>
                    </div>
                )}

                <div className="flex px-2 pb-2 z-[5]">
                    <Hint label={isToolbarVisible ? "Hide formatting" : "Show formatting"}>
                        <Button
                            disabled={disabled}
                            size="iconSm"
                            variant="ghost"
                            onClick={toggleToolbar}
                        >
                            <PiTextAa className='size-4' />
                        </Button>
                    </Hint>

                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                        <Button disabled={disabled} size="iconSm" variant="ghost">
                            <Smile className='size-4' />
                        </Button>
                    </EmojiPopover>

                    {variant === "create" && (
                        <Hint label='Add image'>
                            <Button
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                                onClick={() => imageElementRef.current?.click()}
                            >
                                <ImageIcon className='size-4' />
                            </Button>
                        </Hint>
                    )}

                    {variant === "update" && (
                        <div className='ml-auto flex items-center gap-x-2'>
                            <Button
                                variant={"outline"}
                                size="sm"
                                onClick={onCancel}
                                disabled={disabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={disabled || isEmpty}
                                variant={"outline"}
                                size="sm"
                                onClick={handleSubmit}
                                className='bg-[#007a5a] hover:bg-[#007a5a] text-white'
                            >
                                Save
                            </Button>
                        </div>
                    )}

                    {variant === "create" && (
                        <Hint label='Send'>
                            <Button
                                disabled={disabled || isEmpty}
                                onClick={handleSubmit}
                                size="iconSm"
                                className={cn(
                                    'ml-auto',
                                    isEmpty
                                        ? "bg-white hover:bg-white text-muted-foreground"
                                        : "bg-[#007a5a] hover:bg-[#007a5a] text-white"
                                )}
                            >
                                <MdSend className='size-4' />
                            </Button>
                        </Hint>
                    )}
                </div>
            </div>
            {variant === "create" && (
                <div className={cn(
                    'p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition',
                    !isEmpty && "opacity-100",
                )}>
                    <p>
                        <strong>Shift + Return</strong> to add a new line
                    </p>
                </div>
            )}
        </div>
    );
};

export default Editor;
