import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"

import AnalyticsDashboard from "./analyticsdashboard"
import Footer from "@/components/footer"

const AnalyticsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user 
  const analytics = user
    ? await prisma.userAnalytics.findUnique({ where: { userId: user.id } })
    : null;
  const account = user
    ? await prisma.account.findFirst({ where: { userId: user.id }, select: { isPro: true } })
    : null;

  return (
    <>
      <AnalyticsDashboard user={user} analytics={analytics} account={account} />
      <Footer />
    </>
  )
}

export default AnalyticsPage