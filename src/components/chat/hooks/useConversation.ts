import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export function useConversationActions() {
    const updateConversation = useMutation(api.functions.conversations.update)
    const deleteConversation = useMutation(api.functions.conversations.remove)
    const togglePin = useMutation(api.functions.conversations.togglePin)

    function pinConversation(id: Id<"conversations">) {
        return togglePin({ id })
    }

    function renameConversation(id: Id<"conversations">, title: string) {
        return updateConversation({ id, title })
    }

    function deleteConversationById(id: Id<"conversations">) {
        return deleteConversation({ id })
    }

    return {
        pinConversation,
        renameConversation,
        deleteConversationById,
    }

}