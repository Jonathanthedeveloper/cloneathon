"use client";
import { GhostIcon } from "lucide-react";
import SidebarTrigger from "../sidebar-trigger";
import { Button } from "../ui/button";
import { ModeToggle } from "../mode-toggle";
import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";

export function ChatHeader() {
    const anonymousMode = useChatStore(store => store.anonymousMode);
    const toggleAnonymousMode = useChatStore(store => store.toggleAnonymousMode);


    return <div className="flex items-center justify-between absolute top-0 z-10 bg-transparent w-full">
        <SidebarTrigger />

        <div>
            <Button variant="ghost" size="icon" onClick={toggleAnonymousMode} className={cn("transition-all", anonymousMode && "bg-secondary")}>
                <GhostIcon />
            </Button>
            <ModeToggle />
        </div>
    </div>
}