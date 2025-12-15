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
    details: {
        story: string
        healthBenefits: string[]
        funFact: string
        chefTips: string
    }
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
        details: {
            story: "The Mediterranean diet has long been celebrated for its focus on heart-healthy fats and fresh ingredients. This bowl is a modern homage to the coastal tavernas of Greece, where simple, fresh catch is paired with earth's bounty. By combining nutrient-dense quinoa with the classic flavors of lemon, dill, and olive oil, we've created a dish that transports you to Santorini with every bite. It's not just a meal; it's a lifestyle choice embraced by centenarians in the Blue Zones.",
            healthBenefits: [
                "Rich in Omega-3 fatty acids for heart and brain health",
                "Quinoa provides a complete protein source containing all nine essential amino acids",
                "High in antioxidants from the variety of colorful vegetables",
                "Probiotics in the yogurt-based tzatziki support gut health"
            ],
            funFact: "Salmon acquire their pink color from eating krill and shrimp. In the wild, their diet affects their distinct hue!",
            chefTips: "For the crispiest skin, pat the salmon completely dry before searing. Don't crowd the pan, and let it release naturally from the grill grates."
        }
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
        details: {
            story: "The Korean taco movement started on the streets of Los Angeles, accidentally sparking a global food truck revolution. It represents the beautiful collision of cultures—savory, umami-rich Korean marinades meeting the humble, versatile Mexican tortilla. This dish captures that spirit of innovation, proving that boundaries in cuisine are meant to be broken. It's sweet, spicy, tangy, and crunchy all at once.",
            healthBenefits: [
                "Kimchi provides excellent probiotics for digestive health",
                "Beef offers bioavailable iron and zinc",
                "Capsaicin in the chili peppers can boost metabolism",
                "Corn tortillas are a good source of fiber and naturally gluten-free"
            ],
            funFact: "Kimchi was traditionally stored in underground jars to keep cool during summer and unfrozen during winter before modern refrigeration.",
            chefTips: "Marinate the beef for at least 30 minutes with grated pear or kiwi enzyme to tenderize the meat naturally. Char the tortillas directly on the gas burner for authentic flavor."
        }
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
        details: {
            story: "Sometimes the simplest ingredients create the most memorable meals. This dish is a testament to the power of the 'holy trinity' of quick cooking: butter, garlic, and citrus. Originating from coastal kitchens where the catch is day-fresh, this recipe respects the delicate nature of shrimp by cooking it fast and hot. It's a weeknight savior that feels like a weekend treat.",
            healthBenefits: [
                "Shrimp is a low-calorie, high-protein lean meat",
                "Garlic contains allicin, known for its immune-boosting properties",
                "Parsley is rich in Vitamin K and bone-supporting nutrients",
                "Lemon juice aids in iron absorption"
            ],
            funFact: "Shrimp hearts are located in their heads! They are also swimming decathletes, able to swim backwards quickly to escape predators.",
            chefTips: "Have all your ingredients prepped (mise en place) before you turn on the heat. Shrimp cooks in a flash—literally 2-3 minutes. As soon as they turn pink and opaque, pull them off to prevent rubbery texture."
        }
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
        details: {
            story: "The term 'Buddha Bowl' refers to the rounded shape of the bowl resembling a belly, packed with wholesome goodness. It's a celebration of abundance and balance, rooted in the macrobiotic tradition of eating essentially balanced meals. This colorful arrangement isn't just for Instagram; eating the rainbow ensures you're getting a diverse spectrum of phytonutrients, vitamins, and minerals.",
            healthBenefits: [
                "Chickpeas regulate blood sugar and provide sustained energy",
                "Avocado offers healthy monounsaturated fats for brain health",
                "Purple cabbage is packed with anthocyanins, powerful antioxidants",
                "Tahini is an excellent source of calcium and healthy fats"
            ],
            funFact: "Chickpeas are also known as Garbanzo beans. The liquid from the can, aquafaba, can be whipped into a vegan meringue!",
            chefTips: "Massage the kale or cabbage with a little olive oil and salt before adding to the bowl to break down tough fibers and make it more palatable."
        }
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
        details: {
            story: "As the leaves turn and the air chills, our bodies naturally crave warming, grounding foods. This soup captures the essence of harvest season. Roasting the squash before simmering caramelizes its natural sugars, creating a depth of flavor that boiling simply can't match. Paired with warming spices like nutmeg and cinnamon, it's like a warm hug in a bowl.",
            healthBenefits: [
                "Rich in Vitamin A (beta-carotene) for eye health and immunity",
                "High fiber content aids digestion",
                "Coconut milk provides MCTs for quick energy",
                "Sage has been used historically to improve cognition and memory"
            ],
            funFact: "Butternut squash is technically a fruit, not a vegetable, because it contains seeds! It's botanically a berry.",
            chefTips: "Don't peel the squash before roasting! Slice it in half, roast it face down, and the skin will peel off effortlessly once it's cooked."
        }
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
        details: {
            story: "The 'Arroz con Pollo' concept exists in almost every culture for a reason—it's economical, comforting, and delicious. This one-pan wonder minimizes cleanup while maximizing flavor, as the rice absorbs the savory juices from the chicken as it cooks. It's a humble dish that proves you don't need fancy equipment to cook a nutritious family meal.",
            healthBenefits: [
                "Chicken thighs offer more iron and zinc than breast meat",
                "Rice provides easily digestible energy",
                "Peas are a surprising source of plant-based protein and vitamins",
                "Cooking with bone-in chicken releases collagen and minerals into the rice"
            ],
            funFact: "Rice is the staple food for more than half of the world's population. There are over 40,000 varieties of cultivated rice!",
            chefTips: "Sear the chicken skin-side down first until golden brown to render the fat. Use that flavorful fat to toast the rice grains before adding liquid for a nuttier flavor."
        }
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
        details: {
            story: "Inspired by the sun-drenched hills of Tuscany, this dish brings together the rustic flavors of the Italian countryside. While 'Tuscan Chicken' is more of an American-Italian invention than a traditional recipe from Florence, it captures the spirit of the region with its reliance on sun-dried tomatoes, spinach, and cream. It's indulgence done right—rich, savory, and satisfying.",
            healthBenefits: [
                "Spinach is a nutrient powerhouse loaded with iron and vitamins",
                "Tomatoes contain lycopene, a powerful antioxidant associated with heart health",
                "Chicken provides high-quality lean protein for muscle repair",
                "Dairy in moderation supports bone health via calcium"
            ],
            funFact: "It takes about 14 kilos of fresh tomatoes to produce just 1 kilo of sun-dried tomatoes, concentrating their flavor intensely.",
            chefTips: "Reserve a half-cup of 'liquid gold' (pasta water) before draining. adding a splash to your sauce helps emulsify the cream and cheese for a silky, glossy finish."
        }
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
        details: {
            story: "Known as Pad Krapow via street vendors in Bangkok, this is arguably the most popular Thai lunchtime dish. The star is 'Holy Basil' (Krapow), which has a distinct peppery, clove-like flavor different from sweet Italian basil. It's fast, fiery, and fragrant—the ultimate fast food that doesn't compromise on freshness or flavor depth.",
            healthBenefits: [
                "Chilies release endorphins and can boost metabolism",
                "Fresh herbs like basil have anti-inflammatory properties",
                "High-heat stir-frying retains more nutrients in vegetables than boiling",
                "Garlic and shallots support immune function"
            ],
            funFact: "In Thailand, Pad Krapow is often topped with a 'kai dao'—a crispy fried egg with a runny yolk to temper the chili heat.",
            chefTips: "If you can't find Holy Basil, Thai Basil is a good substitute. Add the basil at the very last second and turn off the heat immediately to preserve its delicate aroma."
        }
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
