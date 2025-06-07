'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Calendar, Users, Zap, ArrowRight, Download, Mail } from "lucide-react"
import Link from "next/link"

const   SuccessPage =() => {
   

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <div className="absolute -top-2 -right-2">
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Meal Wise Pro!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your purchase was successful. You now have access to all premium features.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Crown className="h-4 w-4 mr-2" />
            Pro Plan Activated
          </Badge>
          
        </div>

        {/* Pro Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Unlimited Meal Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Create unlimited personalized meal plans for any dietary preference or goal.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Family Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Share meal plans with up to 5 family members and sync across all devices.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Nutrition Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Get personalized nutrition advice and meal suggestions powered by AI.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Offline Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Download meal plans and recipes for offline access anywhere, anytime.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Get priority email support and access to exclusive pro-only features.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Track your nutrition goals with detailed analytics and progress reports.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="bg-white/90 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What&apos;s Next?</CardTitle>
            <CardDescription className="text-center text-lg">
              Get started with your pro features right away
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                <ArrowRight className="h-5 w-5 mr-2" />
                Start Creating Meal Plans
              </Button>
              <Button size="lg" variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                <Download className="h-5 w-5 mr-2" />
                Download Mobile App
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Need help getting started? Check out our quick start guide or contact support.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="#" className="text-green-600 hover:underline">
                  Quick Start Guide
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="#" className="text-green-600 hover:underline">
                  Contact Support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                A confirmation email with your receipt has been sent to your email address.
              </p>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default SuccessPage;
