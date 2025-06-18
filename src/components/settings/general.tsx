"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, } from "lucide-react"
import { useState, useEffect } from "react"
import { Switch } from "../ui/switch"

export default function GeneralSettings() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [compactMode, setCompactMode] = useState(false)
    const [showTooltips, setShowTooltips] = useState(true)

    useEffect(() => {
        setMounted(true)
        // Load saved preferences from localStorage
        const savedCompactMode = localStorage.getItem('compactMode') === 'true'
        const savedShowTooltips = localStorage.getItem('showTooltips') !== 'false' // default to true

        setCompactMode(savedCompactMode)
        setShowTooltips(savedShowTooltips)

        // Apply compact mode to document root
        if (savedCompactMode) {
            document.documentElement.classList.add('compact-mode')
        }
    }, [])

    const toggleCompactMode = () => {
        const newCompactMode = !compactMode
        setCompactMode(newCompactMode)

        // Save to localStorage
        localStorage.setItem('compactMode', newCompactMode.toString())

        // Apply/remove compact mode class to document root
        if (newCompactMode) {
            document.documentElement.classList.add('compact-mode')
        } else {
            document.documentElement.classList.remove('compact-mode')
        }
    }

    const toggleTooltips = () => {
        const newShowTooltips = !showTooltips
        setShowTooltips(newShowTooltips)

        // Save to localStorage
        localStorage.setItem('showTooltips', newShowTooltips.toString())

        // Apply/remove tooltips disabled class
        if (!newShowTooltips) {
            document.documentElement.classList.add('tooltips-disabled')
        } else {
            document.documentElement.classList.remove('tooltips-disabled')
        }
    }

    if (!mounted) {
        return <div className="p-6">Loading...</div>
    }

    const themeOptions = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">General Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your general application preferences
                </p>
            </div>

            <Separator />

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-medium mb-3">Appearance</h3>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map((option) => {
                                const Icon = option.icon
                                const isSelected = theme === option.value

                                return (
                                    <Button
                                        key={option.value}
                                        variant={isSelected ? "default" : "outline"}
                                        onClick={() => setTheme(option.value)}
                                        className="h-20 flex flex-col gap-2 relative"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs">{option.label}</span>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-medium mb-3">Interface</h3>
                    <div className="space-y-3">                        <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium">Compact Mode</label>
                            <p className="text-xs text-muted-foreground">
                                Reduce spacing and padding for a denser interface
                            </p>
                        </div>

                        <Switch checked={compactMode} onCheckedChange={toggleCompactMode} />
                    </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Show Tooltips</label>
                                <p className="text-xs text-muted-foreground">
                                    Display helpful tooltips on hover
                                </p>
                            </div>
                            <Switch checked={showTooltips} onCheckedChange={toggleTooltips} />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}