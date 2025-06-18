"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Key,
    Eye,
    EyeOff,
    Trash2,
    Shield,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    Plus
} from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"

// Zod schema for API key validation
const apiKeySchema = z.object({
    key: z.string()
        .min(1, "API key is required")
        .min(10, "API key must be at least 10 characters")
        .regex(/^[a-zA-Z0-9\-_\.]+$/, "API key contains invalid characters")
})

type ApiKeyFormData = z.infer<typeof apiKeySchema>



export default function ApiKeysSettings() {

    const providers = useQuery(api.functions.providers.list)
    const apiKeys = useQuery(api.functions.user_api_keys.list)
    const createUserApiKey = useMutation(api.functions.user_api_keys.create)
    const deleteUserApiKey = useMutation(api.functions.user_api_keys.remove)

    const getUserApiKey = (providerId: string) => {
        return apiKeys?.find(key => key.providerId === providerId)
    }

    async function handleSaveKey(providerId: Id<"modelProviders">, key: string) {
        await createUserApiKey({
            providerId,
            key: key.trim()
        })
    }

    async function handleDeleteKey(keyId: Id<"userApiKeys">) {

        await deleteUserApiKey({ id: keyId })

    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">API Keys</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your API keys for AI model providers
                </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Security Notice
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your API keys are encrypted and stored securely. They are only used to make requests to the respective AI providers on your behalf.
                    </p>
                </div>
            </div>

            <Separator />

            {/* API Keys List */}
            <div className="space-y-4">
                <h3 className="text-base font-medium">Provider API Keys</h3>

                {providers && providers.length > 0 ? (
                    <div className="space-y-4">
                        {providers.map((provider) => {
                            const existingKey = getUserApiKey(provider._id)
                            return (
                                <ApiKeyForm
                                    key={provider._id}
                                    provider={provider}
                                    existingKey={existingKey}
                                    onSave={(key) => handleSaveKey(provider._id, key)}
                                    onDelete={existingKey ? () => handleDeleteKey(existingKey._id) : undefined}
                                />
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No API key providers available</p>
                    </div>
                )}
            </div>

            <Separator />

            {/* Help Section */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Need Help?</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>• API keys allow you to use your own quota with AI providers</p>
                    <p>• Keys are encrypted and never shared with third parties</p>
                    <p>• Remove keys anytime to stop using your own quota</p>
                    <p>• Without API keys, you&apos;ll use our shared quotas (usage limits may apply)</p>
                </div>
            </div>
        </div>
    )
}


type ApiKeyFormProps = {
    provider: {
        _id: Id<"modelProviders">
        name: string
        slug: string
        logoUrl?: string
    }
    existingKey?: {
        _id: Id<"userApiKeys">
        key: string
    }
    onSave: (key: string) => Promise<void>
    onDelete?: () => Promise<void>
}

function ApiKeyForm({
    provider,
    existingKey,
    onSave,
    onDelete,
}: ApiKeyFormProps) {
    const [showKey, setShowKey] = useState(false)

    const form = useForm<ApiKeyFormData>({
        resolver: zodResolver(apiKeySchema),
        defaultValues: {
            key: ""
        }
    })

    const onSubmit = async (data: ApiKeyFormData) => {
        await onSave(data.key)
        form.reset()
    }

    const maskKey = (key: string) => {
        if (key.length <= 8) return "*".repeat(key.length)
        return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4)
    }

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={provider.logoUrl} />
                        <AvatarFallback>
                            {provider.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <div className="flex items-center gap-2">
                            {existingKey ? (
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="text-xs">Configured</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-amber-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-xs">Not configured</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => window.open(`https://${provider.slug}.com/api-keys`, '_blank')}
                            >
                                Get API Key
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {existingKey ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-sm p-2 bg-muted rounded">
                            {showKey ? existingKey.key : maskKey(existingKey.key)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowKey(!showKey)}
                        >
                            {showKey ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onDelete}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showKey ? "text" : "password"}
                                                placeholder={`Enter your ${provider.name} API key`}
                                                {...field}
                                            />
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                                >
                                                    {showKey ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Your API key will be encrypted and stored securely.
                                        This enables you to use {provider.name} models with your own quota.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="div flex justify-end">
                            <Button type="submit" disabled={!form.formState.isValid}>
                                <Plus className="h-4 w-4 mr-2" />
                                Save API Key
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}