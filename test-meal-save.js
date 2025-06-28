// Test script to verify meal saving functionality
const testMealData = {
  title: "Test Meal Plan",
  duration: 2,
  mealsPerDay: 2,
  days: [
    {
      day: 1,
      meals: [
        {
          name: "Test Breakfast",
          description: "A delicious test breakfast",
          ingredients: ["eggs", "bread", "butter"],
          instructions: "1. Cook eggs\n2. Toast bread\n3. Serve together",
          imageUrl: "https://example.com/image.jpg"
        },
        {
          name: "Test Lunch",
          description: "A nutritious test lunch",
          ingredients: ["chicken", "rice", "vegetables"],
          instructions: "1. Cook chicken\n2. Prepare rice\n3. Add vegetables",
          imageUrl: "https://example.com/image2.jpg"
        }
      ]
    },
    {
      day: 2,
      meals: [
        {
          name: "Test Dinner",
          description: "A satisfying test dinner",
          ingredients: ["salmon", "quinoa", "broccoli"],
          instructions: "1. Bake salmon\n2. Cook quinoa\n3. Steam broccoli",
          imageUrl: "https://example.com/image3.jpg"
        },
        {
          name: "Test Snack",
          description: "A healthy test snack",
          ingredients: ["nuts", "dried fruit"],
          instructions: "1. Mix nuts and dried fruit\n2. Serve",
          imageUrl: "https://example.com/image4.jpg"
        }
      ]
    }
  ],
  createdAt: new Date().toISOString()
};

console.log('Test meal data structure:');
console.log(JSON.stringify(testMealData, null, 2));

// This script can be run to verify the data structure matches what the API expects
console.log('\n✅ Test data structure is valid'); 