import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/contact-submissions')
        const data = await res.json()
        if (res.ok) {
          setSubmissions(data.submissions)
        } else {
          setError(data.error || 'Failed to fetch contact submissions')
        }
      } catch (err) {
        setError('Failed to fetch contact submissions')
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Contact Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : submissions.length === 0 ? (
          <div>No contact submissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Email</th>
                  <th className="px-2 py-1 text-left">Subject</th>
                  <th className="px-2 py-1 text-left">Message</th>
                  <th className="px-2 py-1 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-2 py-1 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-2 py-1">{s.email}</td>
                    <td className="px-2 py-1">{s.subject}</td>
                    <td className="px-2 py-1 max-w-xs truncate" title={s.message}>{s.message}</td>
                    <td className="px-2 py-1">{new Date(s.submittedAt).toLocaleString()}</td>
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