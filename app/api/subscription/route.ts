import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { 
  getSubscriptionByUserId, 
  createOrUpdateSubscription, 
  updateSubscriptionPlan,
  updateSubscriptionFeatures 
} from "@/data/index";

export async function GET(request: NextRequest) {
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

    // Get user's subscription from database
    let subscription = await getSubscriptionByUserId(session.user.id);

    // If no subscription exists, create a default free subscription
    if (!subscription) {
      subscription = await createOrUpdateSubscription(session.user.id, {
        plan: "free",
        status: "active",
        customerId: `free_${session.user.id}`,
        features: [],
      });
    }

    // Return subscription
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
      },
    });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { plan, status, customerId, features } = body;

    // Validate required fields
    if (!plan || !customerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or update subscription
    const subscription = await createOrUpdateSubscription(session.user.id, {
      plan,
      status,
      customerId,
      features,
    });

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
      },
    });

  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { plan, status, features } = body;

    let subscription;

    // Update specific fields
    if (plan) {
      subscription = await updateSubscriptionPlan(session.user.id, plan);
    } else if (features) {
      subscription = await updateSubscriptionFeatures(session.user.id, features);
    } else {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
      },
    });

  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 