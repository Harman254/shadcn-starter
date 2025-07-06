import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface ContactSubmission {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  submittedAt: string
}

const AdminContactList: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSubmissions = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching contact submissions from admin component...')
      const res = await fetch('/api/admin/contact-submissions')
      console.log('Response status:', res.status)
      
      const data = await res.json()
      console.log('Response data:', data)
      
      if (res.ok) {
        setSubmissions(data.submissions || [])
        console.log(`Successfully loaded ${data.submissions?.length || 0} submissions`)
      } else {
        setError(data.error || data.details || 'Failed to fetch contact submissions')
        console.error('API error:', data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contact submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubmissions()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Contact Submissions
          {submissions.length > 0 && (
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              ({submissions.length})
            </span>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading contact submissions...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 py-4">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error loading submissions</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <p>No contact submissions found.</p>
            <p className="text-sm mt-1">Try submitting a contact form to see submissions here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Subject</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Message</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                      <a href={`mailto:${s.email}`} className="hover:underline">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {s.subject}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300 max-w-xs">
                      <div className="truncate" title={s.message}>
                        {s.message}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                      {new Date(s.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminContactList 