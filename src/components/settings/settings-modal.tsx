"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@uidotdev/usehooks"
import { useState } from "react"
import Settings, { tabs } from "./settings"
import { ArrowLeftIcon, SettingsIcon } from "lucide-react"



export function SettingsModal() {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [activeTab, setActiveTab] = useState<string | null>(null);


    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <SettingsIcon />
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full sm:max-w-3xl h-full max-h-[70vh] grid-rows-[auto_1fr]">
                    <DialogHeader className="h-max">
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>
                    <Settings activeTab={activeTab} setActiveTab={setActiveTab} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground >
            <DrawerTrigger asChild>
                <Button size="icon" variant="ghost">
                    <SettingsIcon />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="min-h-[70vh]">
                <DrawerHeader >
                    {!activeTab &&
                        <DrawerTitle>Settings</DrawerTitle>}

                    {activeTab && <div className="relative">
                        <Button
                            onClick={() => setActiveTab(null)}
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2"
                        >
                            <ArrowLeftIcon />
                            <span className="sr-only">Back</span>
                        </Button>

                        <DrawerTitle>
                            {tabs.find(tab => tab.value === activeTab)?.label || "Settings"}
                        </DrawerTitle>
                    </div>}
                </DrawerHeader>
                <Settings activeTab={activeTab} setActiveTab={setActiveTab} />
            </DrawerContent>
        </Drawer>
    )
}


