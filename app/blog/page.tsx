
'use client'
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ChefHat, 
  
  TrendingUp, 
  Users, 
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  likes: number;
  comments: number;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "How AI is Revolutionizing Meal Planning for Busy Families",
    excerpt: "Discover how artificial intelligence is transforming the way we approach meal planning, making it more personalized, efficient, and nutritious than ever before.",
    content: "Full article content would go here...",
    author: "Sarah Chen",
    publishDate: "2025-01-15",
    readTime: "5 min read",
    category: "AI & Technology",
    tags: ["AI", "Family", "Efficiency"],
    image: "https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: true,
    likes: 324,
    comments: 28
  },
  {
    id: 2,
    title: "10 Time-Saving Meal Prep Strategies That Actually Work",
    excerpt: "Transform your weekly routine with these proven meal prep techniques that will save you hours in the kitchen while keeping your meals fresh and delicious.",
    content: "Full article content would go here...",
    author: "Marcus Rodriguez",
    publishDate: "2025-01-12",
    readTime: "7 min read",
    category: "Meal Prep",
    tags: ["Meal Prep", "Time Management", "Tips"],
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: true,
    likes: 256,
    comments: 19
  },
  {
    id: 3,
    title: "The Science Behind Personalized Nutrition Recommendations",
    excerpt: "Learn how our AI analyzes your dietary preferences, health goals, and lifestyle to create perfectly tailored meal suggestions that work for you.",
    content: "Full article content would go here...",
    author: "Dr. Emily Watson",
    publishDate: "2025-01-10",
    readTime: "6 min read",
    category: "Nutrition",
    tags: ["Nutrition", "Personalization", "Health"],
    image: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: false,
    likes: 189,
    comments: 15
  },
  {
    id: 4,
    title: "Sustainable Eating: How to Reduce Food Waste with Smart Planning",
    excerpt: "Discover practical strategies to minimize food waste while maximizing nutrition and flavor through intelligent meal planning and storage techniques.",
    content: "Full article content would go here...",
    author: "Alex Thompson",
    publishDate: "2025-01-08",
    readTime: "4 min read",
    category: "Sustainability",
    tags: ["Sustainability", "Food Waste", "Environment"],
    image: "https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: false,
    likes: 142,
    comments: 12
  },
  {
    id: 5,
    title: "Building Healthy Habits: The Psychology of Meal Planning",
    excerpt: "Explore the psychological aspects of meal planning and learn how to create sustainable eating habits that stick long-term.",
    content: "Full article content would go here...",
    author: "Dr. Jennifer Kim",
    publishDate: "2025-01-05",
    readTime: "8 min read",
    category: "Psychology",
    tags: ["Psychology", "Habits", "Wellness"],
    image: "https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: false,
    likes: 218,
    comments: 23
  },
  {
    id: 6,
    title: "Budget-Friendly Meal Planning: Eat Well Without Breaking the Bank",
    excerpt: "Learn how to create delicious, nutritious meals on a budget with smart shopping strategies and cost-effective ingredient choices.",
    content: "Full article content would go here...",
    author: "Rachel Green",
    publishDate: "2025-01-03",
    readTime: "5 min read",
    category: "Budget",
    tags: ["Budget", "Savings", "Meal Planning"],
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: false,
    likes: 167,
    comments: 31
  }
];

const categories = ["All", "AI & Technology", "Meal Prep", "Nutrition", "Sustainability", "Psychology", "Budget"];

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br bg-background/95">
     

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            {/* <Sparkles className="h-4 w-4" /> */}
            <span>Latest insights on AI-powered nutrition</span>
          </div>
          <h1 className="text-4xl md:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in">
            The Future of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Meal Planning</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover expert insights, practical tips, and the latest innovations in AI-powered nutrition. 
            Transform the way you plan, prepare, and enjoy your meals.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Articles</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">By {post.author}</span>
                          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                            <span className="text-sm mr-1">Read more</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <BookOpen className="h-6 w-6 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-600">By {post.author}</span>
                      <div className="flex items-center text-blue-600 text-xs font-medium group-hover:text-blue-700">
                        <span className="mr-1">Read</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with the Latest in AI Nutrition
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Get weekly insights, tips, and exclusive content delivered straight to your inbox. 
            Join thousands of food enthusiasts already subscribed.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 outline-none"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Blog;