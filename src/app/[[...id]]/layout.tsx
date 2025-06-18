import { ChatSidebar } from "@/components/chat/sidebar";
import { SidebarProvider, } from "@/components/ui/sidebar";

export default function ChatLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <ChatSidebar />
            <div className="flex-grow md:p-2 bg-sidebar h-svh ">
                <div className="bg-background md:rounded-2xl rounded-none h-full flex flex-col p-2 md:border ">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    );
}