"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ProfileForm } from "./ProfileForm"
import {
  CreditCard,
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Calendar,
  Activity,
  TrendingUp,
  Mail,
  CheckCircle,
  XCircle,
  Crown,
  Globe,
  Banknote,
} from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) throw new Error("Failed to fetch user profile")
        const data = await res.json()
        setUser(data.user)
        setSubscription(data.user?.Subscription || null)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-cyan-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-pink-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-red-300 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="h-12 w-12 text-gray-600 mx-auto" />
          <p className="text-gray-300">You must be signed in to view your profile.</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Projects", value: "12", icon: Activity, color: "from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-700" },
    { label: "Storage Used", value: "2.4 GB", icon: Download, color: "from-green-500 to-green-600 dark:from-green-400 dark:to-green-700" },
    { label: "API Calls", value: "1,247", icon: TrendingUp, color: "from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-700" },
    { label: "Team Members", value: "3", icon: User, color: "from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-700" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-cyan-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-800 to-cyan-800 p-8 mb-8 text-white dark:text-white">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white backdrop-blur-sm">
                {user.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/90 text-lg mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {user.Subscription?.status || "Active"}
                </Badge>
                <span className="text-white/80 text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${stat.color} mb-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Your account details and verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Email Status</p>
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{user.emailVerified ? "Verified" : "Not Verified"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Two-Factor Auth</p>
                        <div className="flex items-center gap-2">
                          {user.twoFactorEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{user.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    </div>

                    {user.Account?.isPro !== undefined && (
                      <div className="flex items-center gap-3">
                        <Crown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Pro Account</p>
                          <div className="flex items-center gap-2">
                            {user.Account.isPro ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{user.Account.isPro ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {user.country && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</p>
                          <p className="text-sm">{user.city ? `${user.city}, ${user.country}` : user.country}</p>
                        </div>
                      </div>
                    )}

                    {user.currencyCode && (
                      <div className="flex items-center gap-3">
                        <Banknote className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency</p>
                          <p className="text-sm">
                            {user.currencySymbol} {user.currencyCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.Account?.isOnboardingComplete !== undefined && (
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Onboarding</p>
                          <div className="flex items-center gap-2">
                            {user.Account.isOnboardingComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {user.Account.isOnboardingComplete ? "Complete" : "Incomplete"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Account Settings
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates about your account</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Extra security for your account</p>
                    </div>
                  </div>
                  <Switch defaultChecked={user.twoFactorEnabled} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export Your Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription */}
          <div className="space-y-6">
            {subscription && (
              <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Subscription
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Your current plan and billing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-xl">
                    <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-700 mb-4">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{subscription.plan}</h3>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{subscription.price}</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Plan Features</h4>
                    <div className="space-y-2">
                      {subscription.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Next Billing</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{subscription.nextBilling}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-700 hover:from-indigo-700 hover:to-purple-700">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setShowEditModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2>
              <ProfileForm user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
