"use client"

import {
   
    PaperclipIcon
} from "lucide-react"
import { ComingSoon } from "../coming-soon"


export default function AttachmentsSettings() {
    return <ComingSoon title="File Attachments"
        description="Share files, images, and documents seamlessly with your AI assistant."
        icon={<PaperclipIcon className="h-12 w-12 text-green-500" />}
        estimatedDate="August 2025"
        features={[
            "Image analysis",
            "Document parsing",
            "Code file support",
            "Audio transcription",
            "File management",
            "Cloud storage sync"
        ]}
        showVoting={true} />
}