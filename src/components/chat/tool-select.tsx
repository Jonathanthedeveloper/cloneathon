import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AudioLinesIcon, CheckIcon, GlobeIcon, LightbulbIcon, Settings2Icon, VideoIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { toast } from "sonner"


type ToolSelectProps = {
  value?: string;
  onToolChange?: (tool: string | null) => void;
};

export const tools = [
  { label: "Search the web", shortLabel: "Search", icon: GlobeIcon, value: "search", description: "Use web search to answer questions with up-to-date information." },
  { label: "Think for longer", icon: LightbulbIcon, value: "think", shortLabel: "Think", description: "Let the AI spend more time reasoning before answering." },
  { label: "Create Image", icon: LightbulbIcon, value: "image", shortLabel: "Image", description: "Generate images from text prompts." },
  { label: "Generate Audio", icon: AudioLinesIcon, value: "audio", shortLabel: "Audio", description: "Generate audio from text or prompts." },
  { label: "Generate Video", icon: VideoIcon, value: "video", shortLabel: "Video", description: "Generate videos from text or prompts." },
];

export function ToolSelect({ value, onToolChange }: ToolSelectProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(value ?? null);
  const [isOpen, setIsOpen] = useState(false);


  const handleToolChange = (tool: string | null) => {

    toast.info("Coming soon! This feature is not yet implemented.")
    return;

    if (tool === selectedTool) {
      onToolChange?.(null);
      setSelectedTool(null);
    }
    else {
      setSelectedTool(tool);
      onToolChange?.(tool);
    }


    setIsOpen(false);
  };


  return <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-9 md:size-auto"> <Settings2Icon /> <span className="hidden md:inline-block">{!selectedTool && "Tools"}</span></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background">
        <DropdownMenuLabel>Tools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tools.map((tool) => (
          <DropdownMenuItem key={tool.value} onSelect={() => handleToolChange(tool.value)} className="min-w-[15rem]" title={tool.description}>
            <div className="flex items-center gap-2"><tool.icon /> {tool.label}</div>
            {selectedTool === tool.value && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <Separator orientation="vertical" />

    {selectedTool && <Button className="rounded-full mr-1 md:mr-2" size="sm" variant="ghost" onClick={() => handleToolChange(null)}>
      {selectedTool && (() => {
        const tool = tools.find(t => t.value === selectedTool);
        if (!tool) return null;
        const Icon = tool.icon;
        return (
          <>
            <Icon className="md:mr-2" />
            <span className="hidden md:inline-block"> {tool.shortLabel}</span>
          </>
        );
      })()}
      <XIcon size={2} />
    </Button>}
  </>
}