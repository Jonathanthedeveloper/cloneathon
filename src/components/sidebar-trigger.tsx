"use client";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export default function SidebarTrigger() {
    const { toggleSidebar } = useSidebar()
    return <Button onClick={toggleSidebar} variant="ghost" size="icon">
        <PanelLeftIcon />
        <span className="sr-only">Toggle Sidebar</span>
    </Button>
}