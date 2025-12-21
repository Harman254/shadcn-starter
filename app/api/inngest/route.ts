import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import * as functions from "@/lib/inngest/functions";
import { NextRequest, NextResponse } from "next/server";

// Serve all Inngest functions
const handler = serve({
  client: inngest,
  functions: Object.values(functions),
});

// Export GET and POST handlers
export const GET = handler.GET;
export const POST = handler.POST;

// Handle PUT requests separately to avoid body parsing errors
// PUT requests from Inngest are typically for webhook verification and may have empty bodies
// Return success to allow webhook verification to proceed without parsing the body
export async function PUT(req: NextRequest) {
  // PUT requests are used for webhook verification and may have empty bodies
  // Always return success to avoid JSON parsing errors
  // The serve handler tries to parse the body for request signing, but PUT requests
  // from Inngest may have empty bodies, causing "Unexpected end of JSON input" errors
  return NextResponse.json({ success: true }, { status: 200 });
}

