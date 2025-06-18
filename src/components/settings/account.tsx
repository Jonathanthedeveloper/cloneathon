"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    User,
    Mail,
    Calendar,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"


const formatDate = (dateString: string | number) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export default function AccountSettings() {
    const profile = useQuery(api.functions.users.getCurrentUser)
        const { signOut } = useAuthActions();
    




    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">Account</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Separator />

            {/* Profile Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Profile Information</h3>

                </div>

                <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.image} />
                        <AvatarFallback className="text-lg">
                            {profile?.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{profile?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{profile?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Joined {profile?._creationTime ? formatDate(profile._creationTime!) : "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Subscription Section */}
            <div className="space-y-4">
                <h3 className="text-base font-medium">Subscription</h3>
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{profile?.plan || "N/A"} Plan</h4>
                            <p className="text-sm text-muted-foreground">
                                Access to premium features and higher usage limits
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Manage Subscription
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />
            <div className="space-y-4">
                <h3 className="text-base font-medium">Log out</h3>
                <div className="space-y-3">
                    <p>Log out of your account.</p>
                    <Button
                        variant="destructive"
                        onClick={()=> void signOut() }
                    >
                        Log Out
                    </Button>

                </div>
            </div>
            <Separator/>

           
            {/* Danger Zone */}
            <div className="space-y-4">
                <h3 className="text-base font-medium">Danger Zone</h3>
                <div className="space-y-3">
                    <p>Permanently delete your account and all associated data.</p>
                    <Button
                        variant="destructive"
                        onClick={()=> {}}
                    >
                        
                        Delete Account
                    </Button>

                </div>
            </div>
        </div>
    )
}