"use client";
import { BotIcon, ChevronRightIcon, KeyRoundIcon, LibraryBigIcon, LucideProps, PaperclipIcon, Settings2Icon, SettingsIcon, SpeechIcon, UserIcon } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, useEffect } from "react";
import { Button } from "../ui/button";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import GeneralSettings from "./general";
import CustomisationSettings from "./customisation";
import ModelsSettings from "./models";
import ApiKeysSettings from "./api-keys";
import AccountSettings from "./account";
import SpeechSettings from "./speech";
import PluginsSettings from "./plugins";
import AttachmentsSettings from "./attachments";
import KnowledgeBaseSettings from "./knowledge-base";
import AgentSettings from "./agents";

type TabType = {
    value: string;
    label: string;
    icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    content?: React.ReactNode;
}

export const tabs: TabType[] = [
    { value: "general", label: "General", icon: SettingsIcon, content: <GeneralSettings /> },
    { value: "customisation", label: "Customisation", icon: Settings2Icon, content: <CustomisationSettings /> },
    { value: "models", label: "Models", icon: BotIcon, content: <ModelsSettings /> },
    { value: "api-keys", label: "API Keys", icon: KeyRoundIcon, content: <ApiKeysSettings /> },
    { value: "account", label: "Account", icon: UserIcon, content: <AccountSettings /> },
    { value: "knowledge-base", label: "Knowledge Base", icon: LibraryBigIcon, content: <KnowledgeBaseSettings /> },
    { value: "plugins", label: "Plugins", icon: SpeechIcon, content: <PluginsSettings /> },
    { value: "attachments", label: "Attachments", icon: PaperclipIcon, content: <AttachmentsSettings /> },
    { value: "speech", label: "Speech", icon: SpeechIcon, content: <SpeechSettings /> },
    {value: "agents", label: "Agents", icon: BotIcon, content: <AgentSettings/> }

]


export default function Settings({ activeTab,
    setActiveTab }: {
        activeTab: string | null;
        setActiveTab: (tab: string | null) => void;
    }) {
    const isDesktop = useMediaQuery("(min-width: 768px)")


    useEffect(() => {
        if (isDesktop) {
            setActiveTab(tabs[0].value);
        }
    }, [isDesktop, setActiveTab]);

    if (isDesktop) {
        return <div className="flex overflow-hidden h-full">
            <div className="w-1/4">
                {tabs.map(tab => (
                    <Button
                        variant={activeTab === tab.value ? "secondary" : "ghost"}
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className="w-full justify-start shadow-none text-left"
                    >
                        {tab.icon && <tab.icon />}
                        {tab.label}
                    </Button>
                ))}
            </div>
            <div className="w-3/4 px-4 overflow-y-auto">
                {
                    tabs.find(tab => tab.value === activeTab)?.content || <div>Select a tab to view content</div>
                }
            </div>
        </div>
    }

    return <div className="p-4 overflow-hidden">
        <ul className={cn(activeTab && "hidden")}>
            {tabs.map(tab => (
                <li key={tab.value}>
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab(tab.value)}>
                        {tab.icon && <tab.icon />}
                        {tab.label}
                        <ChevronRightIcon className="ml-auto" />
                    </Button>
                </li>
            ))}
        </ul>
        <div className={cn("overflow-y-auto h-full",!activeTab && "hidden")}>
            {
                tabs.find(tab => tab.value === activeTab)?.content || <div>Select a tab to view content</div>
            }
        </div>
    </div>
}