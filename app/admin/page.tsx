'use client'
import React, { useState } from 'react'
import CloudinaryUpload from '@/components/CloudinaryUpload'

const AdminPage = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [userIdOrEmail, setUserIdOrEmail] = useState('')
  const [resetResult, setResetResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-zinc-900 dark:to-blue-950 py-12 px-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center drop-shadow">Admin Dashboard</h1>
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
      </div>
    </main>
  )
}

export default AdminPage