"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  CreditCard,
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
} from "lucide-react"

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  // Mock user data - in real app this would come from better-auth
  const user = {
    id: "user_123",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/placeholder.svg?height=80&width=80",
    joinDate: "March 2024",
    plan: "Pro",
    status: "active",
  }

  // Mock subscription data - in real app this would come from Polar
  const subscription = {
    plan: "Pro Plan",
    price: "$29/month",
    nextBilling: "January 15, 2025",
    status: "active",
    features: ["Unlimited projects", "Priority support", "Advanced analytics"],
  }

  const stats = [
    { label: "Projects", value: "12", icon: Activity },
    { label: "Storage Used", value: "2.4 GB", icon: Download },
    { label: "API Calls", value: "1,247", icon: TrendingUp },
    { label: "Team Members", value: "3", icon: User },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-slate-800 shadow-lg">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  {subscription.status}
                </Badge>
                <span className="text-sm text-slate-500">Member since {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself..." />
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{subscription.price}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Plan Features</h4>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Next billing date</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {subscription.nextBilling}
                    </p>
                  </div>
                  <Button variant="outline">Manage Subscription</Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Update Payment Method
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Danger Zone</Label>
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
