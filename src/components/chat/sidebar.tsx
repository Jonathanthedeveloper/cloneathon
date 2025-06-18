"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { LoaderCircleIcon, LogInIcon, PinIcon, PinOffIcon, PlusIcon, SearchIcon, SplitIcon, TextCursorIcon, XIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Logo from "../logo"
import { Input } from "../ui/input"
import { useConvexAuth, usePaginatedQuery, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import Link from "next/link"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu"
import type { Doc, Id } from "../../../convex/_generated/dataModel"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { TooltipButton } from "../tooltip-button"
import { cn } from "@/lib/utils"
import { useConversationActions } from "./hooks/useConversation"
import { SettingsModal } from "../settings/settings-modal"
import { useAuthActions } from "@convex-dev/auth/react"


type ConversationGroup = {
  label: string;
  conversations: Doc<"conversations">[];
}

export function UnMemoizedChatSidebar() {
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()
  const [search, setSearch] = useState("")
  const conversationsEndRef = useRef<HTMLDivElement>(null)
  const params = useParams();
  const { signIn } = useAuthActions();





  const currentUser = useQuery(api.functions.users.getCurrentUser)
  const { results: conversations, loadMore, isLoading, status } = usePaginatedQuery(api.functions.conversations.list, { search, }, {
    initialNumItems: 10,
  })



  // Group and sort conversations
  const groupedConversations = useMemo<ConversationGroup[]>(() => {
    if (!conversations) return []

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const groups: ConversationGroup[] = []
    const monthlyGroups: { [key: string]: Doc<"conversations">[] } = {}

    // Sort conversations by updatedAt descending first
    const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)

    const pinned: Doc<"conversations">[] = []
    const todayConvs: Doc<"conversations">[] = []
    const last7Days: Doc<"conversations">[] = []
    const last30Days: Doc<"conversations">[] = []

    sortedConversations?.forEach(conversation => {
      const conversationDate = new Date(conversation.updatedAt)
      const conversationDay = new Date(conversationDate.getFullYear(), conversationDate.getMonth(), conversationDate.getDate())

      // Pinned conversations go to pinned group regardless of date
      if (conversation.isPinned) {
        pinned.push(conversation)
        return
      }

      // Today (exact date match)
      if (conversationDay.getTime() === today.getTime()) {
        todayConvs.push(conversation)
      }
      // Last 7 days (excluding today)
      else if (conversationDay.getTime() >= sevenDaysAgo.getTime() && conversationDay.getTime() < today.getTime()) {
        last7Days.push(conversation)
      }
      // Last 30 days (excluding last 7 days and today)
      else if (conversationDay.getTime() >= thirtyDaysAgo.getTime() && conversationDay.getTime() < sevenDaysAgo.getTime()) {
        last30Days.push(conversation)
      }
      // Monthly grouping (older than 30 days)
      else if (conversationDay.getTime() < thirtyDaysAgo.getTime()) {
        const monthKey = conversationDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = []
        }
        monthlyGroups[monthKey].push(conversation)
      }
    })

    // Add groups in order if they have conversations
    if (pinned.length > 0) {
      groups.push({ label: "Pinned", conversations: pinned })
    }
    if (todayConvs.length > 0) {
      groups.push({ label: "Today", conversations: todayConvs })
    }
    if (last7Days.length > 0) {
      groups.push({ label: "Last 7 days", conversations: last7Days })
    }
    if (last30Days.length > 0) {
      groups.push({ label: "Last 30 days", conversations: last30Days })
    }

    // Add monthly groups (sorted newest first)
    Object.entries(monthlyGroups)
      .sort(([a], [b]) => new Date(b + " 1").getTime() - new Date(a + " 1").getTime())
      .forEach(([monthKey, monthConversations]) => {
        groups.push({ label: `${monthKey}`, conversations: monthConversations })
      })

    return groups
  }, [conversations])

  const { pinConversation, renameConversation, deleteConversationById } = useConversationActions()

  async function handleDeleteConversation(id: Id<"conversations">) {
    await deleteConversationById(id)
    if (id === params?.id?.[1])
      router.replace("/")
  }


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && status === "CanLoadMore") {
          loadMore(10)
        }
      })
    })

    if (conversationsEndRef.current) {
      observer.observe(conversationsEndRef.current)
    }

    return () => observer.disconnect()


  }, [isLoading, loadMore, status])




  return (
    <Sidebar className="border-none border-r-0">
      <SidebarHeader>
        <div className="flex flex-row gap-4 items-center">
          <Logo />
          <TooltipButton
            onClick={() => router.push("/")}
            icon={PlusIcon}
            tooltip="New Conversation"
          />
        </div>
        <div className="flex items-center border-b">
          <SearchIcon className="size-5" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Search..." className="border-none shadow-none focus-visible:ring-0 bg-transparent!" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groupedConversations.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation._id} className="cursor-pointer">
                    <SidebarMenuButton asChild>
                      <ConversationItem
                        onPin={pinConversation}
                        onRename={renameConversation}
                        onDelete={handleDeleteConversation}
                        conversation={conversation}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {isLoading && <div className="flex justify-center mt-2">
          <LoaderCircleIcon className="animate-spin stroke-accent" />
        </div>}
        <div ref={conversationsEndRef} />
      </SidebarContent>
      <SidebarFooter className="border-t">
        {!isAuthenticated && <Button variant="ghost" size="lg" className="justify-start" onClick={() => void signIn("google")}><LogInIcon /> Login With Google</Button>}
        {isAuthenticated && (
          <div className="flex justify-between gap-2">
            <div className="flex text-sm items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {currentUser?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
                <AvatarImage
                  src={currentUser?.image}
                  alt={currentUser?.name || "User Avatar"}
                />
              </Avatar>

              {currentUser?.name || ""}
            </div>
            <SettingsModal />
          </div>
        )}


      </SidebarFooter>
    </Sidebar>
  )
}

export const ChatSidebar = memo(UnMemoizedChatSidebar)


function ConversationItem({ conversation, onPin, onRename, onDelete }: {
  conversation: Doc<"conversations">;
  onPin: (id: Id<"conversations">) => void;
  onRename: (id: Id<"conversations">, title: string) => void;
  onDelete: (id: Id<"conversations">) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [newTitle, setNewTitle] = useState(conversation.title || "")
  const router = useRouter()
  // const params = useParams();


  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleDoubleClick = () => {
    if (isRenaming) return;
    setIsRenaming(true)
  }


  function handleRename() {
    if (!newTitle.trim()) {
      setIsRenaming(false)
      return
    }
    if (newTitle.trim() === conversation.title) {
      setIsRenaming(false)
      return
    }
    onRename(conversation._id, newTitle.trim())
    setIsRenaming(false)
  }



  return <ContextMenu>
    <ContextMenuTrigger asChild>
      {isRenaming ? <Input ref={inputRef} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={handleRename} /> :

        <div role="button" className={cn("flex items-center gap-1 py-1 px-2 hover:bg-secondary/50 rounded-md cursor-pointer h-9",)}
          onDoubleClick={handleDoubleClick}>
          {conversation.conversationId && <Button variant="ghost" size="icon" className="size-7" onClick={() => router.push(`/chat/${conversation.conversationId}`, { scroll: false })}>
            <SplitIcon className="size-3" />
          </Button>
          }
          <Link prefetch href={`/chat/${conversation._id}`} className="w-full truncate" shallow>
            {conversation.title}
          </Link>
        </div>
      }
    </ContextMenuTrigger>
    <ContextMenuContent className="bg-background">
      <ContextMenuItem onSelect={() => onPin(conversation._id)}>
        {conversation.isPinned ? <><PinOffIcon /> Unpin</> : <><PinIcon /> Pin</>}
      </ContextMenuItem>
      <ContextMenuItem onSelect={handleDoubleClick}><TextCursorIcon /> Rename</ContextMenuItem>
      <ContextMenuItem onSelect={() => onDelete(conversation._id)}><XIcon /> Delete</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
}