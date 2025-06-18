import { DatabaseIcon } from "lucide-react";
import { ComingSoon } from "../coming-soon";

export default function KnowledgeBaseSettings() {
    return <ComingSoon
      title="Knowledge Base"
      description="Upload documents, connect databases, and build a personalized knowledge base for your AI assistant."
      icon={<DatabaseIcon className="h-12 w-12 text-blue-500 animate-pulse" />}
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
    />
}