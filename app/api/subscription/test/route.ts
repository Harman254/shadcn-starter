import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { upgradeUserToPro, downgradeUserToFree } from "@/data/index";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || (action !== "upgrade" && action !== "downgrade")) {
      return NextResponse.json(
        { error: "Action must be 'upgrade' or 'downgrade'" },
        { status: 400 }
      );
    }

    let subscription;
    if (action === "upgrade") {
      subscription = await upgradeUserToPro(session.user.id);
    } else {
      subscription = await downgradeUserToFree(session.user.id);
    }

    return NextResponse.json({
      success: true,
      action,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
      },
    });

  } catch (error) {
    console.error("Error in test subscription action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 