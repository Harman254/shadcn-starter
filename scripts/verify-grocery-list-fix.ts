
import { ResponseGenerator } from '../lib/orchestration/response-generator';
import { OrchestrationResult } from '../lib/orchestration/tool-orchestrator';

async function verifyGroceryListFix() {
    console.log('🧪 Verifying Grocery List Fix...\n');

    const generator = new ResponseGenerator();

    // Mock orchestration result with CORRECT tool names as keys
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
                groceryList: [
                    { name: 'Apples', category: 'Produce', quantity: '5', estimatedPrice: 2.5 },
                    { name: 'Bananas', category: 'Produce', quantity: '1 bunch', estimatedPrice: 1.5 }
                ],
                locationInfo: {
                    name: 'Test Store',
                    address: '123 Test St'
                },
                totalEstimatedCost: 4.0
            }
        },
        errors: {},
        aggregatedData: {},
        success: true,
        executionTime: 100,
        toolCalls: []
    };

    const context = {
        userMessage: 'Make a meal plan and grocery list',
        conversationHistory: []
    };

    try {
        const response = await generator.generateResponse(mockResult, context);

        console.log('Response Text Preview:', response.text.substring(0, 100) + '...');

        if (response.structuredData && response.structuredData.groceryList) {
            console.log('✅ Structured Data contains groceryList');
            const list = response.structuredData.groceryList;

            if (list.items && Array.isArray(list.items) && list.items.length === 2) {
                console.log('✅ Grocery list items correctly mapped');
                console.log('Items:', JSON.stringify(list.items, null, 2));
            } else {
                console.error('❌ Grocery list items missing or incorrect format');
                console.log('Received:', JSON.stringify(list, null, 2));
            }

            if (list.locationInfo && list.locationInfo.name === 'Test Store') {
                console.log('✅ Location info correctly mapped');
            } else {
                console.error('❌ Location info missing or incorrect');
            }

        } else {
            console.error('❌ Structured Data MISSING groceryList');
            console.log('Structured Data:', JSON.stringify(response.structuredData, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyGroceryListFix().catch(console.error);
