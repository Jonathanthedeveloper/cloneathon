"use client"
import { Button } from "@/components/ui/button"
import {
    Bell,
    Sparkles,
    Rocket,
    Calendar,
    ThumbsUp,
    ChevronUp,
    ChevronDownIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "./ui/switch"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"


interface ComingSoonProps {
    title?: string
    description?: string
    icon?: React.ReactNode
    estimatedDate?: string
    showNotifyMe?: boolean
    showProgress?: boolean
    showVoting?: boolean
    features?: string[]
    variant?: "default" | "minimal" | "interactive"
    className?: string
}

export function ComingSoon({
    title = "Coming Soon",
    description = "We're working hard to bring you this feature. Stay tuned!",
    icon,
    estimatedDate,
    showNotifyMe = true,
    showVoting = true,
    features = [],
    variant = "default",
    className,
}: ComingSoonProps) {
    const upvote = useMutation(api.functions.feature_votes.upvote)
    const downvote = useMutation(api.functions.feature_votes.downvote)
    const toggleSubcription = useMutation(api.functions.feature_votes.toggleSubscription)
    const vote = useQuery(api.functions.feature_votes.getVotes, { feature: title })


    async function handleUpvote() {
        await upvote({ feature: title })
    }
    async function handleDownvote() {
        await downvote({ feature: title })
    }
    async function handleToggleSubscription() {
        await toggleSubcription({ feature: title })
    }




    const defaultIcon = (
        <div className="relative">
            <Rocket className="h-12 w-12 text-primary animate-pulse" />
        </div>
    )

    return (
        <div className={cn(
            "relative overflow-hidden rounded-lg p-8 text-center",
            variant === "interactive" && "hover:shadow-lg transition-all duration-300",
            className
        )}>


            <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {icon || defaultIcon}
                </div>

                {/* Title and Description */}
                <h2 className="text-2xl font-bold mb-3">{title}</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {description}
                </p>



                {/* Features List */}
                {features.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">What to expect:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="size-3 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Estimated Date */}
                {estimatedDate && (
                    <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expected: {estimatedDate}</span>
                    </div>
                )}

                {/* Notify Me Section */}
                {showNotifyMe && (
                    <div className="max-w-sm mx-auto">            <h4 className="font-medium mb-3 flex items-center justify-center gap-2">
                        <Bell className="h-4 w-4" />
                        Get notified when it&apos;s ready
                    </h4>
                        <Switch checked={vote?.user.notify} onCheckedChange={handleToggleSubscription} />
                    </div>
                )}


                {/* Voting Section */}
                {showVoting && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3 flex items-center justify-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            How excited are you for this feature?
                        </h4>

                            <div className="flex items-center justify-center gap-2">
                                <Button className={cn("size-10", vote?.user.vote === 1&& "border-green-600 bg-green-600/20")} variant="outline" onClick={handleUpvote}>
                                    <ChevronUp/>
                                </Button>
                                <span className="font-medium text-lg min-w-5">
                                    {(vote?.vote.upvotes || 0) - (vote?.vote.downvotes || 0)}
                                </span>
                                <Button className={cn("size-10", vote?.user.vote === -1&& "border-red-600 bg-red-600/20")} variant="outline" onClick={handleDownvote}>
                                    <ChevronDownIcon/>
                                </Button>
                            </div>
                    </div>
                )}
            </div>
        </div>
    )
}
