"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Search,
    Eye,
    Bot,
    Image,
    FileText,
    Filter,
    Check
} from "lucide-react"
import { Switch } from "../ui/switch"

export default function ModelsSettings() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [enabledModels, setEnabledModels] = useState<Set<string>>(new Set())

    const models = useQuery(api.functions.models.list)
    const providers = useQuery(api.functions.providers.list)

    const features = [
        { id: "vision", label: "Vision", icon: Eye },
        { id: "image", label: "Image Generation", icon: Image },
        { id: "reasoning", label: "Reasoning", icon: Bot },
        { id: "file", label: "Documents", icon: FileText },
    ]

    // Filter models based on search and features
    const filteredModels = models?.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFeatures = selectedFeatures.length === 0 ||
            selectedFeatures.some(feature => model.features?.includes(feature))

        return matchesSearch && matchesFeatures
    })

    const getProviderInfo = (providerId: string) => {
        return providers?.find(p => p._id === providerId)
    }

    const toggleModel = (modelSlug: string) => {
        const newEnabled = new Set(enabledModels)
        if (newEnabled.has(modelSlug)) {
            newEnabled.delete(modelSlug)
        } else {
            newEnabled.add(modelSlug)
        }
        setEnabledModels(newEnabled)
    }

    const toggleFeature = (featureId: string) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(f => f !== featureId)
                : [...prev, featureId]
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">Models</h2>
                <p className="text-sm text-muted-foreground">
                    Manage which AI models are available in the model switcher
                </p>
            </div>

            <Separator />

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filter by Features</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            const isSelected = selectedFeatures.includes(feature.id)

                            return (
                                <Button
                                    key={feature.id}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleFeature(feature.id)}
                                    className="h-8"
                                >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {feature.label}
                                    {isSelected && <Check className="h-3 w-3 ml-1" />}
                                </Button>
                            )
                        })}
                    </div>
                    {selectedFeatures.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFeatures([])}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <Separator />

            {/* Models List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Available Models</h3>
                    <div className="text-sm text-muted-foreground">
                        {enabledModels.size} of {filteredModels?.length || 0} enabled
                    </div>
                </div>

                {filteredModels && filteredModels.length > 0 ? (
                    <div className="space-y-2">
                        {filteredModels.map((model) => {
                            const provider = getProviderInfo(model.providerId)
                            const isEnabled = enabledModels.has(model.slug)

                            return (
                                <div
                                    key={model._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={provider?.logoUrl} />
                                            <AvatarFallback>
                                                {provider?.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{model.name}</span>
                                                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                                    {provider?.name}
                                                </span>
                                            </div>
                                            {model.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {model.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {model.features.map((feature) => {
                                                    const featureInfo = features.find(f => f.id === feature)
                                                    const Icon = featureInfo?.icon || Bot

                                                    return (
                                                        <span
                                                            key={feature}
                                                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                                                        >
                                                            <Icon className="h-3 w-3" />
                                                            {featureInfo?.label || feature}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>


                                    <Switch className="ml-8" checked={isEnabled} onCheckedChange={() => toggleModel(model.slug)} />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No models found matching your criteria</p>
                    </div>
                )}
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEnabledModels(new Set())}>
                    Disable All
                </Button>
                <Button variant="outline" onClick={() => {
                    const allSlugs = new Set(filteredModels?.map(m => m.slug) || [])
                    setEnabledModels(allSlugs)
                }}>
                    Enable All
                </Button>
                <Button>
                    Save Changes
                </Button>
            </div>
        </div>
    )
}