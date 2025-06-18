"use client";
import { cn, getConvexSiteUrl } from "@/lib/utils";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { CopyIcon, RefreshCcwIcon, SplitIcon, SquarePenIcon } from "lucide-react";
import { TooltipButton } from "../tooltip-button";
import { Markdown } from "./markdown";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../../convex/_generated/api";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { useMemo, useEffect } from "react";
import { useChatStore } from "@/stores/chat";

export function ChatMessage({ message, onBranch, onRegenerate, onStreamingStatusChange }: {
    message: Doc<"messages">,
    onBranch?: (messageId: Id<"messages">) => void,
    onRegenerate?: (data: {
        messageId: Id<"messages">;
        modelId?: Id<"models">;
    }) => void,
    isLastUserMessage?: boolean,
    onStreamingStatusChange?: (status: string) => void
}) {

    const driven = useChatStore((state) => state.isDriven)(message._id);

    const { text, status } = useStream(api.functions.chat.getStreamBody, new URL(`${getConvexSiteUrl()}chat/stream`), driven, message.streamId as StreamId)

    // Notify parent of streaming status
    useEffect(() => {
        if (onStreamingStatusChange) onStreamingStatusChange(status);
    }, [status, onStreamingStatusChange]);

    // const isStreaming = useMemo(() => {
    //     if (!driven) return false;
    //     return status === "streaming" || status === "pending";
    // }, [status, driven]);

    const displayMessage = useMemo(() => {
        if (message.role === "assistant") {
            return {
                ...message,
                content: text,
            };
        }
        return message;
    }, [message, text]);

    return <Message message={displayMessage} onBranch={onBranch} onRegenerate={onRegenerate} />;
}

function Message({ message, onBranch, onRegenerate }: { message: Doc<"messages">, onBranch?: (messageId: Id<"messages">) => void, onRegenerate?: (data: { messageId: Id<"messages">, modelId?: Id<"models"> }) => void }) {
    // Render attachments if present
    const attachments = (message.attachments || []) as Array<{
        url: string;
        type: string;
        mimeType?: string;
        name?: string;
    }>;

    return (
        <div className={cn("space-y-1 group/message mb-4")}>
            <div key={message._id} className={cn(
                "px-4 rounded-lg",
                message.role === "user"
                && "bg-secondary/50  border border-secondary/50 text-secondary-foreground max-w-[80%] ml-auto",
                message.role === "assistant" && ""
            )}>
                <div className="whitespace-pre-wrap max-w-none">
                    <Markdown>{message.content || ""}</Markdown>
                </div>
                {/* Attachments rendering */}
                {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-3">
                        {attachments.map((att, i) => {
                            if (att.type === "image" && att.url) {
                                return (
                                    <a
                                        key={i}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block border rounded overflow-hidden max-w-[160px] max-h-[160px] bg-muted"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={att.url}
                                            alt={att.name || `attachment-${i}`}
                                            className="object-cover w-full h-full"
                                            style={{ maxWidth: 160, maxHeight: 160 }}
                                        />
                                    </a>
                                );
                            } else if (att.url) {
                                return (
                                    <a
                                        key={i}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 border rounded bg-muted hover:bg-accent transition"
                                        download={att.name}
                                    >
                                        <span className="truncate max-w-[120px] text-xs font-medium">{att.name || `File ${i + 1}`}</span>
                                        <span className="text-[10px] text-muted-foreground">{att.mimeType || att.type}</span>
                                        <span className="text-primary underline ml-2">Download</span>
                                    </a>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>
            <div className={cn("opacity-0 group-hover/message:opacity-100 transition duration-700 flex items-center", message.role === "user" ? "justify-end" : "justify-start")}>
                <TooltipButton
                    icon={CopyIcon}
                    tooltip="Copy message"
                />
                {message.role === "assistant" && <TooltipButton
                    icon={RefreshCcwIcon}
                    tooltip="Regenerate response"
                    onClick={() => onRegenerate?.({
                        messageId: message.responseTo as Id<"messages">,
                    })}
                />}
                {message.role === "assistant" && <TooltipButton
                    icon={SplitIcon}
                    tooltip="Branch conversation"
                    onClick={() => onBranch?.(message._id)}
                />}
                {message.role === "user" && <TooltipButton
                    icon={SquarePenIcon}
                    tooltip="Edit message"
                />}
            </div>
        </div>
    );
}