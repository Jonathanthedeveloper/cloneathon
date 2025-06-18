"use client";

import { useWindowSize } from "@/hooks/use-window-size";
import { createContext, useCallback, useContext, useRef, useState } from "react";


type ChatContextType = {
    windowSize: [number, number];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    messageContainerRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    focusInput: () => void;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
    canScroll: boolean;
    setCanScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType>({
    windowSize: [0, 0],
    messagesEndRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    messageContainerRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    inputRef: { current: null } as React.RefObject<HTMLInputElement | null>,
    focusInput: () => { },
    scrollToBottom: () => { },
    canScroll: false,
    setCanScroll: () => { },
})

export default function ChatProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [canScroll, setCanScroll] = useState(true);


    const focusInput = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = "smooth") => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior });
            }
        },
        [messagesEndRef]
    );

    const windowSize = useWindowSize();





    const value = {
        windowSize,
        messagesEndRef,
        messageContainerRef,
        inputRef,
        focusInput,
        scrollToBottom,
        canScroll,
        setCanScroll
    }



    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}