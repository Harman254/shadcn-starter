"use client";
import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/lib/blog';
import { Clock, User, Calendar, Share2, Bookmark, ArrowUp, Twitter, Linkedin, Facebook } from 'lucide-react';

interface BlogPostClientProps {
  post: BlogPost;
  contentHtml: string;
}

export default function BlogPostClient({ post, contentHtml }: BlogPostClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 flex flex-col space-y-3 z-40">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
            isBookmarked ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:text-blue-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {showShareMenu && (
            <div className="absolute right-14 bottom-0 bg-white rounded-xl shadow-2xl p-3 flex space-x-2 animate-in slide-in-from-right-2 duration-300">
              <button className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-[70vh] object-cover"
        />
        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-16 w-full">
            <div className="transform translate-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <span className="inline-flex items-center bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                {post.category}
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center space-x-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(post.publishDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-30">
        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 prose max-w-none prose-blue prose-lg dark:prose-invert" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        {/* Related/Continue Reading Section (optional) */}
        <div className="mt-16 pb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Continue Reading</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="p-6">
                  <span className="text-blue-600 text-sm font-semibold">Related Article</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Discover More Insights</h3>
                  <p className="text-slate-600">Explore additional content and deepen your understanding of the latest trends and techniques.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 