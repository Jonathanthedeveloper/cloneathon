"use client"
import { PlugIcon } from "lucide-react"
import { ComingSoon } from "../coming-soon"


export default function PluginsSettings() {

    return <ComingSoon
        title="Plugins & Extensions"
        description="Extend T3 Chat with powerful plugins and third-party integrations."
        icon={<PlugIcon className="h-12 w-12 text-purple-500 animate-bounce" />}
        estimatedDate="Q4 2025"
        features={[
            "Custom plugins",
            "API integrations",
            "Workflow automation",
            "Third-party apps",
            "Plugin marketplace",
            "Developer SDK"
        ]}
        variant="interactive"
    />
}