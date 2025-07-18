"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Calendar, Clock, Heart, MessageCircle, ArrowRight, BookOpen, TrendingUp, Search, Filter, Star, Eye, Zap, Users, Award, Sun, Moon } from 'lucide-react';

const categories = ["All", "AI & Technology", "Meal Prep", "Nutrition", "Sustainability", "Psychology", "Budget"];

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  likes: number;
  comments: number;
  image: string;
  slug: string;
  featured?: boolean;
}

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts.find(post => post.featured) || filteredPosts[0];
  const regularPosts = filteredPosts.filter(post => post !== featuredPost);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-yellow-400/25' 
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/25'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
            : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' 
            : 'bg-gradient-to-br from-indigo-400/20 to-pink-400/20'
        }`}></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
              : 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900'
          }`}
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/90 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Latest insights on AI-powered nutrition</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight mb-6">
            <span className="text-white">The Future of</span>
            <br />
            <span className={`text-transparent bg-clip-text animate-pulse transition-all duration-1000 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400' 
                : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
            }`}>
              Meal Planning
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover expert insights, practical tips, and the latest innovations in AI-powered nutrition. 
            Transform the way you plan, prepare, and enjoy your meals.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">12K+</div>
              <div className="text-slate-300 text-sm">Active Readers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">150+</div>
              <div className="text-slate-300 text-sm">Articles Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-slate-300 text-sm">Reader Satisfaction</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-white/60 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/25 scale-105'
                      : 'bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Featured Article
              </h2>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            
            <div className="group cursor-pointer">
              <div className={`rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                  : 'bg-white border border-slate-100'
              }`}>
                <div className="flex flex-col lg:flex-row">
                  <div className="relative lg:w-1/2 overflow-hidden">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-80 lg:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {featuredPost.category}
                      </span>
                    </div>
                    <div className="absolute bottom-6 right-6">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2">
                        <Eye className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {featuredPost.title}
                    </h3>
                    <p className={`mb-6 text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className={`flex items-center space-x-6 text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(featuredPost.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                        isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                      }`}>
                        <Heart className="h-4 w-4" />
                        <span>{featuredPost.likes}</span>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                        isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <MessageCircle className="h-4 w-4" />
                        <span>{featuredPost.comments}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {featuredPost.author[0]}
                        </div>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {featuredPost.author}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            Expert Author
                          </div>
                        </div>
                      </div>
                      <div className="group/link">
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all">
                          <span>Read Article</span>
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Latest Articles
              </h2>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              {filteredPosts.length} articles found
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <article key={post.id} className="group cursor-pointer">
                <div className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                    : 'bg-white border border-slate-100'
                }`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                        isDark ? 'bg-gray-900/80 text-gray-200' : 'bg-white/95 text-slate-700'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm mb-4 leading-relaxed line-clamp-3 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>
                      {post.excerpt}
                    </p>
                    
                    <div className={`flex items-center justify-between text-xs mb-4 ${
                      isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}>
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
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-red-500">
                          <Heart className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-500">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      isDark ? 'border-gray-700' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {post.author[0]}
                        </div>
                        <span className={`text-xs font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}>
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                        <span className="mr-1">Read</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No articles found
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                Try adjusting your search terms or selected category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className={`mb-8 text-lg ${
            isDark ? 'text-purple-100' : 'text-blue-100'
          }`}>
            Get the latest articles and insights delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white outline-none transition-all ${
                isDark 
                  ? 'bg-gray-800 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
            <button className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-white text-purple-600 hover:bg-gray-100' 
                : 'bg-white text-blue-600 hover:bg-slate-50'
            }`}>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}