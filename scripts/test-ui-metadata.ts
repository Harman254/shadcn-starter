
import { ResponseGenerator } from '../lib/orchestration/response-generator';
import { OrchestrationResult } from '../lib/orchestration/tool-orchestrator';

async function testUIMetadata() {
    console.log('🧪 Testing UI Metadata Injection...\n');

    const generator = new ResponseGenerator();

    // Mock orchestration result with structured data
    const mockResult: OrchestrationResult = {
        results: {
            generateMealPlan: {
                mealPlan: {
                    duration: 3,
                    mealsPerDay: 3,
                    days: []
                }
            },
            generateGroceryList: {
                groceryList: ['Apples', 'Bananas'],
                locationInfo: { name: 'Test Store' },
                totalEstimatedCost: 10
            }
        },
        errors: {},
        aggregatedData: {},
        success: true,
        executionTime: 100,
        toolCalls: []
    };

    const context = {
        userMessage: 'Make a meal plan',
        conversationHistory: []
    };

    try {
        const response = await generator.generateResponse(mockResult, context);

        console.log('Response Text Preview:', response.text.substring(0, 100) + '...');

        // Check for the tag
        const tagMatch = response.text.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);

        if (tagMatch) {
            console.log('✅ UI_METADATA tag found!');

            const base64String = tagMatch[1];
            const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
            const decodedData = JSON.parse(decodedString);

            console.log('Decoded Data:', JSON.stringify(decodedData, null, 2));

            if (decodedData.mealPlan && decodedData.groceryList) {
                console.log('✅ Data integrity verified: Meal Plan and Grocery List present.');
            } else {
                console.error('❌ Data integrity failed: Missing fields.');
            }
        } else {
            console.error('❌ UI_METADATA tag NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testUIMetadata().catch(console.error);
