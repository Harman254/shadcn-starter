import 'dotenv/config';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';

async function main() {
    const chatFlow = getOrchestratedChatFlow();

    console.log('Testing Orchestrated Chat Flow...');

    // Test 1: Meal Plan Generation
    console.log('\n--- Test 1: Generate Meal Plan ---');
    const input1 = {
        message: "Plan a vegetarian meal for 2 days",
        conversationHistory: [],
        userPreferences: { dietary: "vegetarian" },
    };

    try {
        const result1 = await chatFlow.processMessage(input1);
        console.log('Response:', result1.response);
        console.log('Confidence:', result1.confidence);
        if (result1.structuredData?.mealPlan) {
            console.log('✅ Meal Plan generated successfully');
            console.log('Meal Plan ID:', result1.structuredData.mealPlan.id);
        } else {
            console.error('❌ Meal Plan NOT generated');
        }
    } catch (error) {
        console.error('Test 1 Failed:', error);
    }

    // Test 2: Nutrition Analysis (simulating follow-up)
    console.log('\n--- Test 2: Analyze Nutrition ---');
    // We need a valid ID for this to work fully, but let's see if the model calls the tool
    const input2 = {
        message: "What is the nutrition for that plan?",
        conversationHistory: [
            { role: 'user', content: "Plan a vegetarian meal for 2 days" },
            { role: 'assistant', content: "I've created a meal plan for you." } // Mock context
        ],
    };

    try {
        const result2 = await chatFlow.processMessage(input2 as any);
        console.log('Response:', result2.response);
        if (result2.toolResults?.analyzeNutrition) {
            console.log('✅ Analyze Nutrition tool called');
        } else {
            console.log('ℹ️ Analyze Nutrition tool might not have been called (expected if no ID in context)');
        }
    } catch (error) {
        console.error('Test 2 Failed:', error);
    }
}

main().catch(console.error);
