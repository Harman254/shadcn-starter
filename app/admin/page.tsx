'use client'
import React, { useState } from 'react'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import AdminContactList from '@/components/AdminContactList'
import { Button } from '@/components/ui/button'
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react'

const AdminPage = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [userIdOrEmail, setUserIdOrEmail] = useState('')
  const [resetResult, setResetResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<any>(null)
  const [testingDb, setTestingDb] = useState(false)

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-zinc-900 dark:to-blue-950 py-12 px-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center drop-shadow">Admin Dashboard</h1>
        
        {/* Database Test Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
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

        <section className="mb-8">
          <CloudinaryUpload
            uploadPreset="mealwise"
            onUpload={setUploadedUrl}
            label="Upload an Image to Cloudinary"
            helperText="Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB."
            buttonText="Upload Image"
          />
          {uploadedUrl && (
            <div className="mt-6 text-center">
              <p className="text-zinc-700 dark:text-zinc-200 font-medium">Uploaded Image URL:</p>
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline break-all">{uploadedUrl}</a>
            </div>
          )}
        </section>
        
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 mt-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Reset Generation Count</h2>
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              className="w-full max-w-xs px-3 py-2 border rounded-md text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              placeholder="User email or ID"
              value={userIdOrEmail}
              onChange={e => setUserIdOrEmail(e.target.value)}
              disabled={loading}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50"
              onClick={handleResetGenerationCount}
              disabled={loading || !userIdOrEmail}
            >
              {loading ? 'Resetting...' : 'Reset Generation Count'}
            </button>
            {resetResult && <div className="mt-2 text-sm">{resetResult}</div>}
          </div>
        </section>
        
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 mt-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Coming Soon</h2>
          <p className="text-zinc-500 dark:text-zinc-400">More admin features will be available here soon.</p>
        </section>
        
        <AdminContactList />
      </div>
    </main>
  )
}

export default AdminPage