import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import * as functions from "@/lib/inngest/functions";

// Serve all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: Object.values(functions),
});

