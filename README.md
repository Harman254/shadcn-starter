Mealwise is an AI-powered meal planning app built with the modern web stack — focused on helping users save time, eat healthier, and shop smarter. From personalized meal plans to AI-generated grocery lists, Mealwise is the smart kitchen companion for individuals, families, and fitness-focused users.

🚀 The Journey So Far
Mealwise started with a simple idea: make meal planning effortless. Since then, it's evolved into a powerful platform offering:

🍽️ Personalized meal plans tailored to user preferences, goals, and household size.

🛒 Smart grocery lists with location-aware pricing.

🌍 Local checkout and delivery integrations via partnered stores.

🖼️ AI-generated meal images for a richer experience.

❤️ Liked meals and recipe favorites for easy rediscovery.

🧠 Weekly emails and pro-only features to drive retention and value.

We're just getting started — and the roadmap ahead includes even deeper personalization, recipe customization, and intelligent inventory-aware suggestions.

🛠 Tech Stack
Mealwise is built using:

Next.js 13+ with the App Router

Tailwind CSS + Radix UI

Neon for scalable, serverless PostgreSQL

[BetterAuth (Clerk.js fork)] for authentication

Polar.sh for managing subscriptions and monetization

Genkit for AI task orchestration

Resend for transactional email

Hosted on Vercel

✨ Features
📆 Dynamic Meal Planner with AI

🛍️ Grocery List Generator based on real-time user location

📸 AI-generated images for meals

🔐 Authentication & Magic Link Login (BetterAuth)

🧾 Subscription tiers via Polar

🧠 Caching and reusability of previous plans

🎨 Dark Mode and responsive UI built on ShadCN template

## Blogging with Markdown

1. Create a directory at the root of your project:
   ```
   mkdir -p content/blog
   ```
2. Add markdown files (e.g., `first-post.md`) to `content/blog/` with frontmatter like:
   ```markdown
   ---
   id: 1
   title: "How AI is Revolutionizing Meal Planning for Busy Families"
   excerpt: "Discover how artificial intelligence is transforming the way we approach meal planning, making it more personalized, efficient, and nutritious than ever before."
   author: "Sarah Chen"
   publishDate: "2025-01-15"
   readTime: "5 min read"
   category: "AI & Technology"
   tags:
     - AI
     - Family
     - Efficiency
   image: "https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=800"
   featured: true
   likes: 324
   comments: 28
   ---

   Full article content would go here...
   ```
3. The blog page will automatically load and display posts from this directory.