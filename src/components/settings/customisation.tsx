"use client"
import { useEffect, } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { User, Briefcase, Heart, Save, MessageCircle } from "lucide-react"
import { AutosizeTextarea } from "../auto-resize-textarea"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

const formSchema = z.object({
    nickName: z.string().optional(),
    occupation: z.string().optional(),
    aiTraits: z.string().optional(),
    bio: z.string().optional(),
})

export default function CustomisationSettings() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nickName: "",
            occupation: "",
            aiTraits: "",
            bio: ""
        }
    })

    const aiTraits = form.watch("aiTraits")


    const preferences = useQuery(api.functions.preferences.getPreference)
    const updatePreferences = useMutation(api.functions.preferences.updatePreference)



    // Update default values when preferences change
    useEffect(() => {
        if (preferences) {
            form.reset(preferences)
        }
    }, [preferences])

    function onSubmit(values: z.infer<typeof formSchema>) {
        updatePreferences(values)
    }

    const isDirty = form.formState.isDirty



    const traitSuggestions = [
        "Friendly and encouraging",
        "Professional and formal",
        "Casual and conversational",
        "Analytical and detailed",
        "Creative and imaginative",
        "Patient and understanding",
        "Enthusiastic and energetic",
        "Calm and measured",
        "Witty and humorous",
        "Supportive and empathetic"
    ]

    const handleTraitSuggestion = (trait: string) => {
        if (aiTraits?.includes(trait)) return

        const newTraits = aiTraits
            ? `${aiTraits}, ${trait.toLowerCase()}`
            : trait.toLowerCase()
        form.setValue("aiTraits", newTraits)
    }



    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">Customisation</h2>
                <p className="text-sm text-muted-foreground">
                    Personalize how the AI responds to you by providing some context about yourself
                </p>
            </div>

            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="nickName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <h3 className="text-base font-medium">What should AI call you?</h3>
                                    </div>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John, Dr. Smith, Alex, etc." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This helps the AI address you personally in conversations
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel><div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-green-600" />
                                    <h3 className="text-base font-medium">What do you do?</h3>
                                </div></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Software Developer, Teacher, Student, Marketing Manager, etc."
                                        {...field} />
                                </FormControl>
                                <FormDescription>
                                    Your profession or main activities help the AI provide more relevant responses
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="aiTraits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel><div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-purple-600" />
                                    <h3 className="text-base font-medium">What traits should AI have?</h3>
                                </div></FormLabel>
                                <FormControl>
                                    <AutosizeTextarea placeholder="e.g., Software Developer, Teacher, Student, Marketing Manager, etc."
                                        {...field} />
                                </FormControl>
                                <FormDescription>
                                    Describe how you&apos;d like the AI to behave and communicate with you

                                </FormDescription>
                                <FormMessage />


                                <div className="space-y-2 my-2">
                                    <p className="text-xs text-muted-foreground">Quick suggestions (click to add):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {traitSuggestions.map((trait) => (
                                            <Button
                                                key={trait}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTraitSuggestion(trait)}
                                                className="h-7 text-xs"
                                                disabled={aiTraits?.includes(trait.toLowerCase())}
                                            >
                                                {trait}
                                            </Button>))}
                                    </div>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel><div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-purple-600" />
                                    <h3 className="text-base font-medium">
                                        Any additional information about you?
                                    </h3>
                                </div></FormLabel>
                                <FormControl>
                                    <AutosizeTextarea
                                        {...field}
                                        placeholder="e.g., Be friendly and encouraging, use simple explanations, be direct and to the point, show enthusiasm for creative projects..."
                                        className="w-full min-h-[100px] p-3 border rounded-md resize-none bg-background"
                                        rows={4}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe how you&apos;d like the AI to behave and communicate with you
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={!isDirty}>
                            <Save />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}