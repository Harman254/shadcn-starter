'use client'
import React, { useState, useEffect } from 'react'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import AdminContactList from '@/components/AdminContactList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Loader2, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Users, 
  ChefHat, 
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Trash2,
  UserX
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeToday: number
  proSubscriptions: number
  totalMealPlans: number
  totalRecipes: number
  totalChatSessions: number
}

const AdminPage = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [userIdOrEmail, setUserIdOrEmail] = useState('')
  const [resetResult, setResetResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<any>(null)
  const [testingDb, setTestingDb] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [deleteUserEmail, setDeleteUserEmail] = useState('')
  const [deleteResult, setDeleteResult] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch admin stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Handler for resetting generation count
  const handleResetGenerationCount = async () => {
    setLoading(true)
    setResetResult(null)
    try {
      const response = await fetch('/api/admin/reset-generation-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setResetResult(`Success: Generation count reset for user.`)
      } else {
        setResetResult(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setResetResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handler for testing database connection
  const handleTestDatabase = async () => {
    setTestingDb(true)
    setDbTestResult(null)
    try {
      const response = await fetch('/api/admin/test-db')
      const data = await response.json()
      setDbTestResult(data)
    } catch (error) {
      setDbTestResult({
        success: false,
        error: 'Failed to test database',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTestingDb(false)
    }
  }

  // Handler for deleting user data
  const handleDeleteUser = async () => {
    if (!deleteUserEmail || !confirm(`Are you sure you want to delete all data for ${deleteUserEmail}? This cannot be undone.`)) {
      return
    }
    setDeleting(true)
    setDeleteResult(null)
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteUserEmail }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setDeleteResult(`Success: User data deleted.`)
        setDeleteUserEmail('')
        fetchStats() // Refresh stats
      } else {
        setDeleteResult(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setDeleteResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-amber-100 dark:from-zinc-900 dark:to-amber-950 py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loadingStats}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 text-center drop-shadow">
          🛡️ Admin Dashboard
        </h1>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Users"
            value={stats?.totalUsers ?? '-'}
            loading={loadingStats}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Active Today"
            value={stats?.activeToday ?? '-'}
            loading={loadingStats}
            color="green"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Pro Subscribers"
            value={stats?.proSubscriptions ?? '-'}
            loading={loadingStats}
            color="amber"
          />
          <StatCard
            icon={<ChefHat className="h-6 w-6" />}
            label="Meal Plans"
            value={stats?.totalMealPlans ?? '-'}
            loading={loadingStats}
          />
          <StatCard
            icon={<ChefHat className="h-6 w-6" />}
            label="Saved Recipes"
            value={stats?.totalRecipes ?? '-'}
            loading={loadingStats}
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="Chat Sessions"
            value={stats?.totalChatSessions ?? '-'}
            loading={loadingStats}
          />
        </section>
        
        {/* Database Test Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 mb-6">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Test
          </h2>
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleTestDatabase}
              disabled={testingDb}
              className="flex items-center gap-2"
            >
              {testingDb ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {testingDb ? 'Testing...' : 'Test Database Connection'}
            </Button>
            
            {dbTestResult && (
              <div className={`w-full p-4 rounded-lg border ${
                dbTestResult.success 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {dbTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-medium">
                    {dbTestResult.success ? 'Database Test Successful' : 'Database Test Failed'}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                  {dbTestResult.message || dbTestResult.error}
                </p>
                {dbTestResult.details && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Details: {dbTestResult.details}
                  </p>
                )}
                {dbTestResult.success && dbTestResult.recordCount !== undefined && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Contact submissions in database: {dbTestResult.recordCount}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* User Management Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Reset Generation Count */}
          <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reset Generation Count
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                placeholder="User email or ID"
                value={userIdOrEmail}
                onChange={e => setUserIdOrEmail(e.target.value)}
                disabled={loading}
              />
              <Button
                onClick={handleResetGenerationCount}
                disabled={loading || !userIdOrEmail}
                className="w-full"
              >
                {loading ? 'Resetting...' : 'Reset Count'}
              </Button>
              {resetResult && (
                <p className={`text-sm ${resetResult.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                  {resetResult}
                </p>
              )}
            </div>
          </section>

          {/* Delete User Data */}
          <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-red-200 dark:border-red-800/50">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Delete User Data
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-md text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border-red-300 dark:border-red-700"
                placeholder="User email"
                value={deleteUserEmail}
                onChange={e => setDeleteUserEmail(e.target.value)}
                disabled={deleting}
              />
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleting || !deleteUserEmail}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete User Data'}
              </Button>
              {deleteResult && (
                <p className={`text-sm ${deleteResult.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                  {deleteResult}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Cloudinary Upload */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 mb-6">
          <CloudinaryUpload
            uploadPreset="mealwise"
            onUpload={setUploadedUrl}
            label="Upload an Image to Cloudinary"
            helperText="Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB."
            buttonText="Upload Image"
          />
          {uploadedUrl && (
            <div className="mt-4 text-center">
              <p className="text-zinc-700 dark:text-zinc-200 font-medium text-sm">Uploaded URL:</p>
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline break-all text-sm">{uploadedUrl}</a>
            </div>
          )}
        </section>
        
        {/* Contact Submissions */}
        <AdminContactList />
      </div>
    </main>
  )
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  loading, 
  color = 'blue' 
}: { 
  icon: React.ReactNode
  label: string
  value: number | string
  loading: boolean
  color?: 'blue' | 'green' | 'amber'
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800',
    green: 'from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800',
    amber: 'from-amber-500/10 to-amber-600/10 border-amber-200 dark:border-amber-800',
  }
  
  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={iconColors[color]}>{icon}</div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : (
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage