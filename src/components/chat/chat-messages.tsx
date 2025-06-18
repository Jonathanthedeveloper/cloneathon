"use client";
import { useMutation, usePaginatedQuery, } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { ChatMessage } from "./chat-message";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../providers/chat-provider";
import { useChatStore } from "@/stores/chat";
import { handleMutationError } from "@/lib/utils";

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-muted-foreground text-sm">Assistant is typing</span>
            <span className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
            </span>
        </div>
    );
}

export function ChatMessages() {
    const params = useParams();
    const conversationId = params.id?.[1] as Id<"conversations"> | undefined;
    const branchConversation = useMutation(api.functions.chat.branch);
    const router = useRouter();
    const { messageContainerRef, messagesEndRef, scrollToBottom, windowSize, setCanScroll } = useChatContext();
    const addToDrivenIds = useChatStore((state) => state.addToDrivenIds);

    const { results: messages, loadMore, status, isLoading } = usePaginatedQuery(api.functions.messages.list,
        { conversationId },
        {
            initialNumItems: 1,
        }
    );
    const regenerate = useMutation(api.functions.chat.regenerate);

    async function handleRegenerate(data: { messageId: Id<"messages"> }) {
        try {
            const response = await regenerate(data);
            if (response) {
                addToDrivenIds(response.messageId);
            }
        } catch (err) {
            handleMutationError(err, "Regenerate Message");
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setCanScroll(!entry.isIntersecting);

                if (entry.isIntersecting && status === "CanLoadMore" && !isLoading) {
                    loadMore(10);
                }
            });
        });

        if (messagesEndRef.current) {
            observer.observe(messagesEndRef.current);
        }

        return () => observer.disconnect();
    }, [status, messagesEndRef, loadMore, setCanScroll, isLoading]);


    useEffect(() => {
        scrollToBottom();
    }, [windowSize, scrollToBottom]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    async function handleBranchMessage(messageId: Id<"messages">) {
        try {
            const response = await branchConversation({ messageId });
            router.push(`/chat/${response.conversationId}`);
        } catch (err) {
            handleMutationError(err, "Branch Conversation");
        }
    }

    // Find the last assistant message index
    const lastAssistantIndex = useMemo(() => {
        if (!messages || messages.length === 0) return -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant") return i;
        }
        return -1;
    }, [messages]);

    // Track streaming status of the last assistant message
    const [lastAssistantStreamingStatus, setLastAssistantStreamingStatus] = useState<string>("");

    return <div className="flex-1 overflow-y-auto  pt-10">
        <div className="max-w-2xl w-full mx-auto mb-32 flex flex-col gap-3 scroll-mb-32" ref={messageContainerRef}>
            <div>
                {messages?.map((msg, index) => (
                    <ChatMessage
                        key={msg._id}
                        message={msg}
                        onBranch={handleBranchMessage}
                        onRegenerate={handleRegenerate}
                        {...(index === lastAssistantIndex ? { onStreamingStatusChange: setLastAssistantStreamingStatus } : {})}
                    />
                ))}
                {lastAssistantStreamingStatus === "pending" && <TypingIndicator />}
            </div>
            <div id="messages-end" ref={messagesEndRef} />
        </div>
    </div>
}

