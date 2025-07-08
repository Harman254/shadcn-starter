import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import AnalyticsDashboard from "./analyticsdashboard"

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user || null
  const analytics = user
    ? await prisma.userAnalytics.findUnique({ where: { userId: user.id } })
    : null
  const account = user
    ? await prisma.account.findFirst({ where: { userId: user.id }, select: { isPro: true } })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <AnalyticsDashboard user={user} analytics={analytics} account={account} />
    </div>
  )
}