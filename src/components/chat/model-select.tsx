"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { BrainIcon, ChevronDownIcon, EyeIcon, FileTextIcon, GlobeIcon, ImagePlusIcon, LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes, useEffect, useState, useMemo, useCallback } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { cn } from "@/lib/utils"
import { FixedSizeList as List } from 'react-window';
import { Input } from "../ui/input"



type ModelSelectProps = {
  modelId?: string | null
  onSetModelId?: (id: string | null) => void
}

const modelFeatureIcons: Record<string, {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  description: string
  className: string
}> = {
  "file": {
    icon: FileTextIcon,
    description: "Supports file uploads and analysis",
    className: "",
  },
  "vision": {
    icon: EyeIcon,
    description: "Supports image uploads and analysis",
    className: "",
  },
  "search": {
    icon: GlobeIcon,
    description: "Uses search to answer questions",
    className: "",
  },
  "reasoning": {
    icon: BrainIcon,
    description: "Has reasoning capabilities",
    className: "",
  },
  "image": {
    icon: ImagePlusIcon,
    description: "Can generate images",
    className: "",
  },
}


export function ModelFeatureIcon({ feature }: { feature: string }) {
  const { icon: Icon, description, className } = modelFeatureIcons[feature] || {};
  if (!Icon) return null;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={1200}>
        <TooltipTrigger className={cn("p-1 rounded-md", className)}>
          {Icon && <Icon size={3} />}
        </TooltipTrigger>
        <TooltipContent>
          {description || "No description available"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ModelSelect({
  modelId,
  onSetModelId,
}: ModelSelectProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = true
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    modelId || null
  )

  const models = useQuery(api.functions.models.list)
  const defaultModels = useQuery(api.functions.models.listDefault)


  const handleModelChange = useCallback((id: string | null) => {
    setSelectedModelId(id)
    onSetModelId?.(id)
  }, [onSetModelId])



  useEffect(() => {
    if (!selectedModelId) {
      handleModelChange(defaultModels?.[0]?._id || null)
    }
  }, [defaultModels, handleModelChange, selectedModelId])

  const selectedModel = models?.find(
    (model) => model._id === selectedModelId
  )?.name





  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="md:max-w-full w-max justify-start truncate text-xs sm:text-sm md:text-base">

            <span>{selectedModel ? <>{selectedModel}</> : <>Select Model</>}</span>
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <ModelList setOpen={setOpen} setSelectedModelId={handleModelChange} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="md:max-w-full w-max justify-start truncate text-xs sm:text-sm md:text-base">
          <span>{selectedModel ? <>{selectedModel}</> : <>Select Model</>}</span>
          <ChevronDownIcon className="ml-auto h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <ModelList setOpen={setOpen} setSelectedModelId={handleModelChange} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function ModelList({
  setOpen,
  setSelectedModelId,
}: {
  setOpen: (open: boolean) => void
  setSelectedModelId: (id: string | null) => void
}) {
  const [filterValue, setFilterValue] = useState("")

  const providers = useQuery(api.functions.providers.listWithModels)?.filter(
    (provider) => provider.models.length > 0
  )
  // Flatten all models into a single array for virtualization
  const allModels = useMemo(() => {
    if (!providers) return []

    const flattened: Array<{
      type: 'provider' | 'model'
      providerId: string
      providerName: string
      model?: {
        _id: string
        name: string
        features?: string[]
        [key: string]: unknown
      }
      _id: string
    }> = []

    providers.forEach((provider) => {
      // Add provider header
      flattened.push({
        type: 'provider',
        providerId: provider._id,
        providerName: provider.name,
        _id: `provider-${provider._id}`
      })

      // Add models for this provider
      provider.models?.forEach((model) => {
        flattened.push({
          type: 'model',
          providerId: provider._id,
          providerName: provider.name,
          model,
          _id: model._id
        })
      })
    })

    return flattened
  }, [providers])

  // Filter models based on search input
  const filteredModels = useMemo(() => {
    if (!filterValue) return allModels

    const filtered: typeof allModels = []
    let currentProvider: string | null = null

    allModels.forEach((item) => {
      if (item.type === 'model' && item.model?.name.toLowerCase().includes(filterValue.toLowerCase())) {
        // If we haven't added the provider header for this group yet, add it
        if (currentProvider !== item.providerId) {
          const providerItem = allModels.find(p => p.type === 'provider' && p.providerId === item.providerId)
          if (providerItem) {
            filtered.push(providerItem)
            currentProvider = item.providerId
          }
        }
        filtered.push(item)
      }
    })

    return filtered
  }, [allModels, filterValue])

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredModels[index]

    if (item.type === 'provider') {
      return (
        <div style={style} className="px-2 py-1.5">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            {item.providerName}
          </div>
        </div>
      )
    }
    return (
      <div style={style} className="px-2">
        <div
          role="button"
          className="flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground truncate"
          onClick={() => {
            if (item.model) {
              setSelectedModelId(item.model._id)
              setOpen(false)
            }
          }}
        >
          <span>{item.model?.name}</span>
          <div className="flex items-center gap-1">
            {item.model?.features?.map((feature: string) => (
              <ModelFeatureIcon key={feature} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-lg p-2 space-y-2">
      <Input
        placeholder="Filter models..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />

      {
        filteredModels.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        ) : (
          <List
            height={300} // Fixed height for the virtualized list
            itemCount={filteredModels.length}
            itemSize={40} // Height of each row
            width="100%"
          >
            {Row}
          </List>
        )
      }
    </div >
  )
}


