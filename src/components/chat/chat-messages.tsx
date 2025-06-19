"use client";
import { useMutation, usePaginatedQuery, } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { ChatMessage } from "./chat-message";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../providers/chat-provider";
import { useChatStore } from "@/stores/chat";
import { handleMutationError } from "@/lib/utils";



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



    return <div className="flex-1 overflow-y-auto overflow-x-hidden pt-10">
        <div className="max-w-2xl w-full mx-auto mb-32 flex flex-col gap-3 scroll-mb-32" ref={messageContainerRef}>
            <div>
                {messages?.map((msg) => (
                    <ChatMessage
                        key={msg._id}
                        message={msg}
                        onBranch={handleBranchMessage}
                        onRegenerate={handleRegenerate}
                    />
                ))}
            </div>
            <div id="messages-end" ref={messagesEndRef} />
        </div>
    </div>
}

