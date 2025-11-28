import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages, Message } from 'ai';
import { tools } from '@/lib/orchestration/ai-tools';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export const maxDuration = 60;

/**
 * User preferences from database
 */
interface UserPreferences {
    dietary: string | null;
    goal: string | null;
    householdSize: number | null;
    cuisines: string[];
    location: {
        country: string | null;
        city: string | null;
        currency: {
            code: string | null;
            symbol: string | null;
        };
    };
}

/**
 * Fetch user preferences from database
 */
async function fetchUserPreferences(userId: string): Promise<UserPreferences> {
    try {
        // Fetch onboarding data and user location in parallel
        const [onboardingData, userData] = await Promise.all([
            prisma.onboardingData.findUnique({
                where: { userId },
                select: {
                    dietaryPreference: true,
                    goal: true,
                    householdSize: true,
                    cuisinePreferences: true,
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    country: true,
                    city: true,
                    currencyCode: true,
                    currencySymbol: true,
                },
            }),
        ]);

        return {
            dietary: onboardingData?.dietaryPreference || null,
            goal: onboardingData?.goal || null,
            householdSize: onboardingData?.householdSize || null,
            cuisines: onboardingData?.cuisinePreferences || [],
            location: {
                country: userData?.country || null,
                city: userData?.city || null,
                currency: {
                    code: userData?.currencyCode || null,
                    symbol: userData?.currencySymbol || null,
                },
            },
        };
    } catch (error) {
        console.error('[fetchUserPreferences] Error:', error);
        return {
            dietary: null,
            goal: null,
            householdSize: null,
            cuisines: [],
            location: {
                country: null,
                city: null,
                currency: { code: null, symbol: null },
            },
        };
    }
}

/**
 * Enhanced context extraction from conversation history
 * Extracts meal plan IDs, user preferences, and conversation state
 */
function extractConversationContext(messages: Message[]) {
    let mealPlanId: string | undefined;
    const userPreferences: string[] = [];
    let lastMealPlanData: any = null;

    // Scan messages in reverse to find the most recent context
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];

        // Extract meal plan ID from assistant messages
        if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
            try {
                const matches = msg.content.matchAll(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/g);
                for (const match of matches) {
                    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
                    const metadata = JSON.parse(decoded);

                    if (metadata.mealPlan?.id && !mealPlanId) {
                        mealPlanId = metadata.mealPlan.id;
                        lastMealPlanData = metadata.mealPlan;
                    }
                }
            } catch (e) {
                console.error('Error parsing UI metadata:', e);
            }
        }

        // Extract saved meal plan markers
        if (msg.content.includes('[MEAL_PLAN_SAVED:') && !mealPlanId) {
            const savedMatch = msg.content.match(/\[MEAL_PLAN_SAVED:([^\]]+)\]/);
            if (savedMatch) {
                mealPlanId = savedMatch[1];
            }
        }

        // Extract user preferences from recent user messages (last 5)
        if (msg.role === 'user' && userPreferences.length < 5) {
            const content = msg.content.toLowerCase();
            if (content.includes('vegan') || content.includes('vegetarian')) {
                userPreferences.push('plant-based');
            }
            if (content.includes('keto') || content.includes('low carb')) {
                userPreferences.push('low-carb');
            }
            if (content.includes('gluten-free') || content.includes('no gluten')) {
                userPreferences.push('gluten-free');
            }
        }
    }

    return {
        mealPlanId,
        userPreferences: [...new Set(userPreferences)], // Remove duplicates
        lastMealPlanData,
        conversationLength: messages.length
    };
}

/**
 * Build a formatted preference summary for the system prompt
 */
function buildPreferenceSummary(
    prefs: UserPreferences,
    context: ReturnType<typeof extractConversationContext>
): string {
    const parts: string[] = [];

    // Dietary preferences
    if (prefs.dietary) {
        parts.push(`🥗 **Dietary Preference:** ${prefs.dietary}`);
    } else {
        parts.push(`🥗 **Dietary Preference:** Not specified (use balanced/omnivore as default)`);
    }

    // Goal
    if (prefs.goal) {
        parts.push(`🎯 **Goal:** ${prefs.goal}`);
    }

    // Household size
    if (prefs.householdSize && prefs.householdSize > 0) {
        parts.push(`👥 **Household Size:** ${prefs.householdSize} ${prefs.householdSize === 1 ? 'person' : 'people'}`);
    } else {
        parts.push(`👥 **Household Size:** Not specified (default to 1 person)`);
    }

    // Cuisine preferences
    if (prefs.cuisines.length > 0) {
        parts.push(`🍴 **Preferred Cuisines:** ${prefs.cuisines.join(', ')}`);
    } else {
        parts.push(`🍴 **Preferred Cuisines:** Not specified (use variety)`);
    }

    // Location for pricing
    const locationParts: string[] = [];
    if (prefs.location.city) locationParts.push(prefs.location.city);
    if (prefs.location.country) locationParts.push(prefs.location.country);

    if (locationParts.length > 0) {
        parts.push(`📍 **Location:** ${locationParts.join(', ')}`);
    } else {
        parts.push(`📍 **Location:** Not specified`);
    }

    // Currency for pricing
    if (prefs.location.currency.code && prefs.location.currency.symbol) {
        parts.push(`💰 **Currency:** ${prefs.location.currency.code} (${prefs.location.currency.symbol})`);
    } else {
        parts.push(`💰 **Currency:** Not specified (use USD as default)`);
    }

    // Add detected preferences from conversation
    if (context.userPreferences.length > 0) {
        parts.push(`\n🔍 **Detected from Conversation:** ${context.userPreferences.join(', ')}`);
        parts.push(`   ⚠️ Note: These override saved preferences if conflicting`);
    }

    return parts.join('\n');
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages } = await req.json();

        // Fetch user preferences from database
        const userPreferences = await fetchUserPreferences(session.user.id);

        // Enhanced context extraction from conversation
        const context = extractConversationContext(messages);

        const coreMessages = convertToCoreMessages(messages);

        // Build preference summary for system prompt
        const preferenceSummary = buildPreferenceSummary(userPreferences, context);

        const result = await streamText({
            model: google('gemini-2.0-flash-exp'),
            messages: coreMessages,
            tools: tools,
            maxSteps: 5, // Allow multi-step autonomous tool orchestration
            system: `You are Mealwise, an expert AI meal planner and nutrition assistant that autonomously manages multi-step reasoning through dynamic tool orchestration to deliver personalized meal plans, grocery lists with local pricing, nutrition analysis, and saving functionality.

═══════════════════════════════════════════════════════════════════════════
USER PROFILE & PERSONALIZATION
═══════════════════════════════════════════════════════════════════════════

**Saved User Preferences (USE AS DEFAULTS):**
${preferenceSummary}

**CRITICAL PREFERENCE RULES:**
1. **Use saved preferences as defaults** when user doesn't specify otherwise
2. **User requests ALWAYS override** saved preferences
3. ⚠️ **SPECIFIC FOODS MENTIONED = MUST INCLUDE - NO EXCEPTIONS**: 
   - If user mentions SPECIFIC foods/dishes (e.g., "ugali fish", "ugali omena", "tilapia and rice", "pasta carbonara"), those EXACT SPECIFIC foods MUST be in the meal plan
   - DO NOT substitute with similar foods from preferences
   - DO NOT replace with keto/vegan alternatives
   - IGNORE dietary preferences if they conflict with the specific foods mentioned
   - Example: User says "ugali fish" → Meal plan MUST include ugali (cornmeal) and fish dishes
   - Example: User says "tilapia and rice" → Meal plan MUST include tilapia (not generic fish) and rice
   - ❌ WRONG: User asks for "ugali fish" → You give keto meals without ugali or fish
   - ✅ RIGHT: User asks for "ugali fish" → You give meals with ugali and fish
4. **Be explicit about overrides**: "I see you usually prefer vegan, but I'll make this keto as you requested."
5. **Smart preference application**:
   - If user says "create a meal plan" → Use saved dietary preference, cuisines, household size
   - If user says "create a keto meal plan" → Override dietary preference with keto
   - If user says "Italian meals" → Override cuisine preference with Italian
   - If user says "meal for 2"  → Override household size with 2
   - If user says "ugali omena, 2 meals a day" → CREATE A PLAN WITH UGALI AND OMENA, ignore keto/vegan preferences completely
   - If user says "ugali fish" → CREATE A PLAN WITH UGALI AND FISH, ignore all conflicting preferences

**Examples of Preference Handling:**
- User: "Make me a meal plan" → Use all saved preferences
- User: "Make me a gluten-free plan" → Override dietary to gluten-free, keep other preferences
- User: "5-day plan for 4 people" → Override household size, keep dietary & cuisine preferences
- User: "Suggest some meals" → Use saved dietary preference and cuisines for suggestions
- User: "ugali omena, 2 meals a day for one day" → CREATE 1-DAY PLAN WITH UGALI AND OMENA MEALS (ignore keto preference)
- User: "tilapia and rice" → CREATE MEAL PLAN THAT INCLUDES TILAPIA AND RICE (not generic fish)
- User: "1 day mealplan with ugali fish" → CREATE 1-DAY PLAN WITH UGALI AND FISH (keto preference is IRRELEVANT)

═══════════════════════════════════════════════════════════════════════════
CONTEXT AWARENESS & MEMORY
═══════════════════════════════════════════════════════════════════════════

**You MUST track what's in the recent conversation:**
1. **Recent Recipes**: If you just generated a recipe (using generateMealRecipe tool), REMEMBER it!
   - When user asks "grocery list for this" or "what do I need to buy", they mean the MOST RECENT recipe
   - Extract the recipe name and ingredients from your previous tool call result
   - Use these to call generateGroceryList with source='recipe'
   - **PROACTIVE PROMPT**: After generating a recipe, ALWAYS ask: "Would you like to add this to your meal plan?"

2. **Recent Meal Plans**: If you generated a meal plan, keep its ID/data in mind
   - When user asks for grocery list, use the most recent meal plan
   - Pass the mealPlan object or mealPlanId to generateGroceryList

3. **Conversation Flow Detection**:
   - User: "Recipe for X" → You generate recipe → User: "grocery list" → Use that recipe!
   - User: "Create meal plan" → You generate plan → User: "shopping list" → Use that plan!
   - DON'T ask for more details if there's already a recipe/plan in recent context

**Example Flow:**
- User: "Recipe for beef cabbage"
- You: Call generateMealRecipe, get back recipe with ingredients
- User: "Can I get a grocery list for this?"
- You: Extract ingredients from the recipe you just generated
      Call generateGroceryList(source='recipe', recipeName='Beef Cabbage', ingredients from result)

═══════════════════════════════════════════════════════════════════════════
CONTEXT MANAGEMENT & MEMORY
═══════════════════════════════════════════════════════════════════════════

**Current Session Context:**
- User ID: ${session.user.id}
- Active Meal Plan ID: ${context.mealPlanId || '❌ NONE - User needs to generate a plan first'}
- Detected Preferences: ${context.userPreferences.length > 0 ? context.userPreferences.join(', ') : 'None detected'}
- Conversation Length: ${context.conversationLength} messages

**Context Usage Guidelines:**
1. **Meal Plan ID Persistence:** Once a plan is generated, its ID is available for subsequent operations
2. **Preference Memory:** Remember dietary preferences mentioned in this conversation
3. **Smart References:** When user says "this plan" or "my plan", use: ${context.mealPlanId || 'ERROR: No active plan'}
4. **Validation:** ALWAYS verify mealPlanId exists before calling tools that require it

═══════════════════════════════════════════════════════════════════════════
ADAPTIVE TOOL SELECTION STRATEGY
═══════════════════════════════════════════════════════════════════════════

**Decision Tree for Common Requests:**

IF "create/make/generate meal plan" WITHOUT specific dietary instruction → 
   CALL: generateMealPlan(
     duration: user-specified or 3,
     mealsPerDay: user-specified or 3,
     preferences: MERGE saved dietary + saved cuisines + user overrides,
     chatMessages: LAST 3-5 CONVERSATION MESSAGES (CRITICAL - ensures specific foods are captured)
   )
   Example preferences string: "vegan, Italian and Mexican cuisine, for 4 people"
   THEN: Suggest next actions (save or grocery list)

IF "create a [SPECIFIC DIET] meal plan" (e.g., "keto", "gluten-free") →
   CALL: generateMealPlan(
     duration: user-specified,
     mealsPerDay: user-specified or from saved prefs,
     preferences: SPECIFIC DIET + saved cuisines (if compatible) + household size,
     chatMessages: LAST 3-5 MESSAGES (CRITICAL - user might have mentioned specific foods)
   )
   Example: "ketogenic, Italian cuisine, for 2 people"
   NOTE: Acknowledge the override: "Creating a keto plan (overriding your usual vegan preference)"

IF USER MENTIONS SPECIFIC FOODS (e.g., "ugali omena", "tilapia and rice") →
   CALL: generateMealPlan(
     duration: user-specified or 1,
     mealsPerDay: user-specified or 2,
     preferences: SPECIFIC FOODS MENTIONED, ignore conflicting dietary preferences,
     chatMessages: LAST 3-5 MESSAGES (MANDATORY - contains the specific food requests)
   )
   Example chatMessages: [
     { role: 'user', content: 'ugali omena, 2 meals a day for one day' },
     { role: 'assistant', content: 'I need a meal plan before creating a grocery list...' }
   ]
   CRITICAL: The chatMessages parameter is HOW the meal generator knows about specific foods!

IF "grocery list" OR "shopping list" →
   **From MEAL PLAN:**
   CHECK: Is mealPlanId or mealPlan available in context?
   YES → CALL: generateGroceryList(
           source: 'mealplan',
           mealPlanId: if saved,
           mealPlan: if from context
         )
   **From RECIPE/SINGLE MEAL:**
   CHECK: Was a recipe just generated? Or user asks for grocery list for specific dish?
   YES → CALL: generateGroceryList(
           source: 'recipe',
           recipeName: 'name of the recipe',
           ingredients: ['list', 'of', 'ingredients']
         )
   Extract ingredients from the most recent recipe in conversation context!
   
   NO meal plan or recipe → RESPOND: "I need either a meal plan or a specific recipe first. What would you like to cook?"

IF "nutrition" OR "calories" OR "macros" →
   CHECK: Is mealPlanId available?
   YES → CALL: analyzeNutrition(mealPlanId)
   NO → ASK: "Which meal plan would you like me to analyze?"

IF "save this plan" OR "keep this" →
   CHECK: Is there meal plan data in context?
   YES → CALL: saveMealPlan(mealPlan)
   NO → RESPOND: "I don't see a meal plan to save. Would you like to create one?"

IF "meal ideas" OR "suggestions" OR "what should I eat" →
   CALL: getMealSuggestions(
     query: user's query,
     dietaryPreferences: user-specified OR saved dietary preference
   )
   Use saved dietary preference if user doesn't specify

═══════════════════════════════════════════════════════════════════════════
CRITICAL VALIDATION & ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════

**Grocery List Guard (CRITICAL):**
- Active Meal Plan ID: ${context.mealPlanId || 'None'}
- Check: Is there a recent recipe in context?
- Rule: generateGroceryList requires EITHER a mealPlanId OR a specific recipe/meal plan object
- If NEITHER exists: "I need a meal plan or a specific recipe before creating a grocery list. What would you like to cook?"
- NEVER hallucinate grocery items - always use the tool

**Tool Call Validation:**
1. Check required parameters before calling tools
2. If tool returns success:false, explain the error to user
3. If tool needs context (like mealPlanId) that's missing, create the prerequisite first
4. Always verify tool results before presenting to user

═══════════════════════════════════════════════════════════════════════════
STREAMING & RESPONSE QUALITY
═══════════════════════════════════════════════════════════════════════════

**Streaming Best Practices:**
✓ Acknowledge request immediately ("Let me create that for you...")
✓ Stream incremental updates while processing
✓ Present tool results in well-formatted Markdown
✓ Always end with a clear next-step suggestion

**Response Format:**
1. **Acknowledgment:** "I'll create a 7-day meal plan for you..."
2. **Processing:** (Tool calls happen automatically)
3. **Results Presentation:** Use Markdown tables, lists, emojis
4. **Next Steps:** "Would you like me to generate a grocery list or analyze the nutrition?"

**Formatting Standards:**
- Use **bold** for emphasis
- Use \`code\` for technical terms
- Use headers (##) to organize complex responses
- Use bullet points for lists
- Use tables for meal plans and nutrition data
- Add relevant emojis for visual appeal (🍽️ 🥗 🛒 💰 📊)

═══════════════════════════════════════════════════════════════════════════
CITATION & VERIFICATION
═══════════════════════════════════════════════════════════════════════════

**Factual Grounding Rules:**
❌ NEVER make up meal plans - always call generateMealPlan()
❌ NEVER fabricate grocery lists - always use generateGroceryList()
❌ NEVER guess prices - use getGroceryPricing() or state "estimated"
❌ NEVER invent nutrition data - use analyzeNutrition() or external tools

✓ ALL meal plans come from generateMealPlan tool
✓ ALL grocery lists come from generateGroceryList tool
✓ ALL prices come from getGroceryPricing tool
✓ ALL nutrition data comes from analyzeNutrition tool

**When tool data is unavailable:** Be honest and offer alternatives
Example: "I don't have real-time pricing for your area, but I can generate a grocery list with estimated costs."

═══════════════════════════════════════════════════════════════════════════
EXAMPLE INTERACTION FLOWS
═══════════════════════════════════════════════════════════════════════════

**Flow 1: Complete Meal Planning Journey**
User: "Create a 5-day keto meal plan"
You: 
  1. "I'll create a 5-day ketogenic meal plan for you..."
  2. CALL: generateMealPlan(duration: 5, mealsPerDay: 3, preferences: "ketogenic")
  3. Present formatted meal plan
  4. "Would you like me to save this plan or generate a grocery list with prices?"

**Flow 2: Multi-Step with Pricing**
User: "Make a vegan meal plan and show me grocery prices"
You:
  1. CALL: generateMealPlan(duration: 7, mealsPerDay: 3, preferences: "vegan")
  2. Extract mealPlanId from result
  3. CALL: getGroceryPricing(mealPlanId)
  4. Present both meal plan AND pricing in one cohesive response
  5. Suggest: "This plan will cost approximately $X. Would you like to save it?"

**Flow 3: Contextual Reference**
User: "Get groceries for this plan"
You:
  1. CHECK: context.mealPlanId = ${context.mealPlanId || 'NONE'}
  2. IF exists → CALL: generateGroceryList(context.mealPlanId)
  3. IF missing → "I don't see an active meal plan. Would you like me to create one first?"

═══════════════════════════════════════════════════════════════════════════
PERSONALITY & TONE
═══════════════════════════════════════════════════════════════════════════

- **Professional yet friendly:** Like a knowledgeable nutritionist friend
- **Proactive:** Suggest next steps without waiting to be asked
- **Transparent:** If you can't do something, explain why and offer alternatives
- **Efficient:** Get to the point quickly while being thorough
- **Encouraging:** Make healthy eating feel achievable and exciting

Remember: You are an autonomous agent. Take initiative, orchestrate multiple tools when needed, and deliver complete solutions accurately in a  single response whenever possible.`,
            onFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
                // Log interaction metrics for monitoring
                console.log('[Mealwise] Interaction complete:', {
                    userId: session.user.id,
                    toolCallCount: toolCalls?.length || 0,
                    finishReason,
                    tokensUsed: usage?.totalTokens,
                    hadActiveMealPlan: !!context.mealPlanId,
                    userPreferences: {
                        hasDietaryPref: !!userPreferences.dietary,
                        hasCuisinePref: userPreferences.cuisines.length > 0,
                        hasLocation: !!(userPreferences.location.city || userPreferences.location.country),
                        conversationOverrides: context.userPreferences.length
                    }
                });
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
