"use client";

import { cn } from "@/lib/utils";
import { AutosizeTextarea, AutosizeTextAreaRef } from "../auto-resize-textarea";
import { Button } from "../ui/button";
import {
    ArrowUpIcon,
    ChevronDownIcon,
    Loader2,
    MicIcon,
    MicOffIcon
} from "lucide-react";
import { ModelSelect } from "./model-select";
import { useChatStore } from "@/stores/chat";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRef, useState, useCallback } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useChatContext } from "../providers/chat-provider";
import { FileUpload } from "./file-upload";
import { AttachmentList } from "./attachment-list";
import { useUploadFile } from "./hooks/useUploadFile";
import { Separator } from "../ui/separator";
import { ToolSelect } from "./tool-select";
import { VoiceInput } from "./voice-input";
import { handleMutationError } from "@/lib/utils";

export function ChatInput() {
    const sendMessage = useMutation(api.functions.chat.create)
    const params = useParams();
    const router = useRouter();

    const textareaRef = useRef<AutosizeTextAreaRef>(null);
    const [dragActive, setDragActive] = useState(false);

    // Get conversation ID from URL params
    const conversationId = params.id?.[1] as Id<"conversations"> | undefined;

    // Store hooks
    const anonymousMode = useChatStore(store => store.anonymousMode);
    const message = useChatStore(store => store.message);
    const modelId = useChatStore(store => store.modelId);
    const setMessage = useChatStore(store => store.setMessage);
    const setModelId = useChatStore(store => store.setModelId);
    const canSendMessage = useChatStore(store => store.canSendMessage());
    const addToDrivenIds = useChatStore(store => store.addToDrivenIds);
    const pathname = usePathname();
    const { scrollToBottom, canScroll } = useChatContext();    // Upload hook
    const { hasUploadingFiles, clearAttachments, handleFileSelect } = useUploadFile();
    const canSend = canSendMessage;
    const attachments = useChatStore(store => store.attachments);
    const setTools = useChatStore(store => store.setTools)
    const tools = useChatStore(store => store.tools)

    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [handleFileSelect]);

    async function handleSendMessage(e?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) {
        e?.preventDefault?.();
        if (!canSend) return;

        try {
            const response = await sendMessage({
                conversationId: conversationId || undefined,
                content: message,
                role: "user",
                modelId: modelId as Id<"models">,
                tools,
                attachments: attachments
                    .filter((a): a is typeof a & { storageId: Id<"_storage"> } => Boolean(a.storageId))
                    .map(a => a.storageId),
                anonymous: anonymousMode,
            });

            addToDrivenIds(response.messageId);

            if (conversationId !== response.conversationId) {
                router.push("/chat/" + response.conversationId);
            }

            // Clear the input and attachments after sending
            setMessage("");
            setTools([])
            clearAttachments();
            textareaRef.current?.textArea.focus();
        } catch (err: unknown) {
            handleMutationError(err, "Send Message");
        }
    }

    const isNew = pathname === "/";

    return (
        <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 max-w-7/8 lg:max-w-2xl xl:max-w-3xl w-full flex flex-col", isNew && "bottom-1/3")}>
            <Button onClick={() => scrollToBottom()} size="sm" variant="outline" className={cn("rounded-full text-xs w-max mx-auto mb-2 backdrop-blur-lg", !canScroll && "hidden")}>
                Scroll to bottom <ChevronDownIcon size={3} />
            </Button>

            <form
                onSubmit={handleSendMessage}
                className={cn(
                    "rounded-2xl border bg-background/50 backdrop-blur-sm transition-colors",
                    anonymousMode && "border-ring bg-ring/10",
                    dragActive && "border-primary bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="p-2">
                    <AutosizeTextarea
                        autoFocus
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxHeight={300}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        className="focus:outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none bg-transparent"
                        placeholder={dragActive ? "Drop files here..." : "Type your message..."}
                    />
                    <div className="flex items-center justify-between ">
                        <div className="display flex items-center gap-2">
                            <ModelSelect modelId={modelId} onSetModelId={setModelId} />
                            <FileUpload />
                            <ToolSelect onToolChange={(tool) => tool !== null && setTools((prev) => [...prev, tool])} />
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Voice input button */}
                            <VoiceInput onTranscript={(transcript) => setMessage(((typeof message === 'string' ? message : '') + ' ' + transcript).trim())} />
                            {hasUploadingFiles && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            )}
                            <Button type="submit" disabled={!canSend} size="icon">
                                <ArrowUpIcon />
                            </Button>
                        </div>
                    </div>
                </div>
                {attachments.length > 0 && <div className="">
                    <Separator />
                    <div className="px-2 pt-2 max-h-30 overflow-y-auto">
                        <AttachmentList />
                    </div>
                </div>}
            </form>

            {isNew && anonymousMode && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                    This chat won&apos;t appear in your history
                </div>
            )}
        </div>
    )
}
