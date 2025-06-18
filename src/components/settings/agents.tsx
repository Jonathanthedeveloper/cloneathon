"use client";

import { BotIcon } from "lucide-react";
import { ComingSoon } from "../coming-soon";

export default function AgentSettings() {
    return <ComingSoon
      title="Agents"
      description="Create and manage AI agents that can perform tasks, automate workflows, and interact with users intelligently."
      icon={<BotIcon className="h-12 w-12 text-blue-500 animate-pulse" />}
      estimatedDate="Q3 2025"
      features={[
        "PDF & document upload",
        "Database connections",
        "Web scraping",
        "Smart indexing",
        "Context-aware search",
        "Version control"
      ]}
      variant="interactive"
      showProgress={true}
      showVoting={true}
    />
}