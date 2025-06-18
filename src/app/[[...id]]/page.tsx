import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";

export default function Page() {
    return (
        <div className="h-full flex flex-col relative">
            <ChatHeader />
            <ChatMessages />
            <ChatInput />
        </div>
    );
}