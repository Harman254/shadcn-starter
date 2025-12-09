// Feed data types and static content for the Meal Discovery Feed

export interface FeedItem {
    id: string
    title: string
    description: string
    imageUrl: string
    imagePrompt: string // For AI image generation
    category: FeedCategory
    metadata: {
        prepTime?: string
        calories?: number
        cuisine?: string
        servings?: number
        difficulty?: 'Easy' | 'Medium' | 'Hard'
    }
    author: {
        name: string
        avatar?: string
    }
    createdAt: string
    tags: string[]
}

export type FeedCategory =
    | 'for-you'
    | 'trending'
    | 'quick-meals'
    | 'healthy'
    | 'seasonal'
    | 'budget'

export interface CategoryTab {
    id: FeedCategory
    label: string
    icon?: string
}

export const FEED_CATEGORIES: CategoryTab[] = [
    { id: 'for-you', label: 'For You' },
    { id: 'trending', label: 'Trending' },
    { id: 'quick-meals', label: 'Quick Meals' },
    { id: 'healthy', label: 'Healthy Picks' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'budget', label: 'Budget Friendly' },
]

// Static seed content - will be enhanced with AI-generated images
export const FEED_ITEMS: FeedItem[] = [
    {
        id: '1',
        title: 'Mediterranean Grilled Salmon Bowl',
        description: 'A vibrant bowl featuring herb-crusted salmon, quinoa, roasted vegetables, and a tangy tzatziki drizzle. Perfect for a protein-packed lunch.',
        imageUrl: '/feed-images/salmon-bowl.png',
        imagePrompt: 'A beautifully plated Mediterranean salmon bowl with grilled salmon, colorful vegetables, quinoa, and tzatziki sauce, professional food photography, warm lighting, top-down view',
        category: 'for-you',
        metadata: {
            prepTime: '25 min',
            calories: 485,
            cuisine: 'Mediterranean',
            servings: 2,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['high-protein', 'omega-3', 'gluten-free'],
    },
    {
        id: '2',
        title: 'Spicy Korean Beef Tacos',
        description: 'Fusion at its finest! Tender bulgogi-style beef in crispy corn tortillas with kimchi slaw and sriracha mayo.',
        imageUrl: '/feed-images/korean-tacos.png',
        imagePrompt: 'Korean beef tacos with bulgogi meat, kimchi slaw, and sriracha mayo on corn tortillas, vibrant street food style, professional food photography, dark moody background',
        category: 'trending',
        metadata: {
            prepTime: '30 min',
            calories: 520,
            cuisine: 'Korean-Mexican',
            servings: 4,
            difficulty: 'Medium',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['spicy', 'fusion', 'popular'],
    },
    {
        id: '3',
        title: '10-Minute Garlic Butter Shrimp',
        description: 'Succulent shrimp sautéed in garlic-infused butter with fresh herbs. Ready in minutes, tastes like gourmet.',
        imageUrl: '/feed-images/garlic-shrimp.png',
        imagePrompt: 'Garlic butter shrimp in a cast iron skillet with fresh parsley, lemon wedges, and garlic cloves, sizzling hot, professional food photography, dramatic lighting',
        category: 'quick-meals',
        metadata: {
            prepTime: '10 min',
            calories: 280,
            cuisine: 'American',
            servings: 2,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['quick', 'seafood', 'keto-friendly'],
    },
    {
        id: '4',
        title: 'Rainbow Buddha Bowl',
        description: 'A nourishing plant-based bowl packed with roasted chickpeas, avocado, purple cabbage, and tahini dressing.',
        imageUrl: '/feed-images/buddha-bowl.png',
        imagePrompt: 'Colorful Buddha bowl with roasted chickpeas, avocado slices, purple cabbage, carrots, edamame, and creamy tahini dressing, overhead shot, natural lighting, healthy food photography',
        category: 'healthy',
        metadata: {
            prepTime: '20 min',
            calories: 390,
            cuisine: 'Plant-Based',
            servings: 2,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['vegan', 'high-fiber', 'meal-prep'],
    },
    {
        id: '5',
        title: 'Autumn Butternut Squash Soup',
        description: 'Velvety smooth soup with roasted butternut squash, warming spices, and a swirl of coconut cream.',
        imageUrl: '/feed-images/butternut-soup.png',
        imagePrompt: 'Creamy butternut squash soup in a rustic bowl with coconut cream swirl, roasted pumpkin seeds, and fresh sage leaves, cozy autumn setting, professional food photography',
        category: 'seasonal',
        metadata: {
            prepTime: '35 min',
            calories: 220,
            cuisine: 'American',
            servings: 4,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['comfort-food', 'fall', 'vegan'],
    },
    {
        id: '6',
        title: 'One-Pan Chicken & Rice',
        description: 'A complete meal made in one pan! Juicy chicken thighs with seasoned rice and vegetables.',
        imageUrl: '/feed-images/chicken-rice.png',
        imagePrompt: 'One-pan chicken and rice dish with golden brown chicken thighs, colorful bell peppers, peas, and aromatic rice, rustic pan, professional food photography, warm ambient lighting',
        category: 'budget',
        metadata: {
            prepTime: '40 min',
            calories: 450,
            cuisine: 'American',
            servings: 4,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['family-friendly', 'one-pan', 'affordable'],
    },
    {
        id: '7',
        title: 'Creamy Tuscan Chicken Pasta',
        description: 'Restaurant-quality pasta with creamy sun-dried tomato sauce, spinach, and perfectly seasoned chicken.',
        imageUrl: '/feed-images/salmon-bowl.png', // Placeholder - reusing image
        imagePrompt: 'Creamy Tuscan chicken pasta with sun-dried tomatoes, fresh spinach, and parmesan cheese, twirled on a fork, elegant plating, professional food photography',
        category: 'trending',
        metadata: {
            prepTime: '35 min',
            calories: 650,
            cuisine: 'Italian',
            servings: 4,
            difficulty: 'Medium',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['comfort-food', 'creamy', 'date-night'],
    },
    {
        id: '8',
        title: 'Thai Basil Stir-Fry',
        description: 'Aromatic Thai basil with your choice of protein, fresh vegetables, and authentic Thai seasonings.',
        imageUrl: '/feed-images/garlic-shrimp.png', // Placeholder - reusing image
        imagePrompt: 'Thai basil stir-fry with chicken, fresh Thai basil leaves, red chilies, and colorful vegetables in a wok, steam rising, professional food photography, dramatic lighting',
        category: 'quick-meals',
        metadata: {
            prepTime: '15 min',
            calories: 380,
            cuisine: 'Thai',
            servings: 2,
            difficulty: 'Easy',
        },
        author: { name: 'Chef AI' },
        createdAt: new Date().toISOString(),
        tags: ['spicy', 'asian', 'quick'],
    },
]

// Helper to get items by category
export function getItemsByCategory(category: FeedCategory): FeedItem[] {
    if (category === 'for-you') {
        // Return a personalized mix
        return FEED_ITEMS.slice(0, 4)
    }
    return FEED_ITEMS.filter(item => item.category === category)
}
