"use client";
import {
    Mic,
} from "lucide-react"
import { ComingSoon } from "../coming-soon";

export default function SpeechSettings() {
    return <ComingSoon
        title="Voice & Speech"
        description="Talk naturally with your AI using advanced voice recognition and synthesis."
        icon={<Mic className="h-12 w-12 text-red-500 animate-pulse" />}
        estimatedDate="September 2025"
        features={[
            "Voice conversations",
            "Multiple languages",
            "Custom voices",
            "Real-time transcription",
            "Voice shortcuts",
            "Audio recording"
        ]}
        variant="interactive"
        showProgress={true}
        showVoting={true}
    />
}