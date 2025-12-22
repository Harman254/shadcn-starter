"use client";
import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/lib/blog';
import { Clock, User, Calendar, Share2, Bookmark, ArrowUp, Twitter, Linkedin, Facebook, Heart, MessageCircle, ArrowLeft, Crown, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useBlogImage } from '@/hooks/use-blog-image';
import { Badge } from '@/components/ui/badge';

interface BlogPostClientProps {
  post: BlogPost;
  contentHtml: string;
}

export default function BlogPostClient({ post, contentHtml }: BlogPostClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Get AI-generated image for the blog post
  const { imageUrl, isGenerated, isPro, isLoading } = useBlogImage({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    enabled: true,
  });

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post.title;

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

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

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 dark:bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back Button */}
      <Link
        href="/blog"
        className={`fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
          isDark 
            ? 'bg-gray-800/90 backdrop-blur-sm text-white hover:bg-gray-700 border border-gray-700' 
            : 'bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white border border-slate-200'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Blog</span>
      </Link>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 flex flex-col space-y-3 z-40">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
              isDark 
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' 
                : 'bg-white text-slate-600 hover:text-blue-600'
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
            isBookmarked 
              ? 'bg-blue-600 text-white' 
              : isDark
              ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
              : 'bg-white text-slate-600 hover:text-blue-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
              isDark 
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' 
                : 'bg-white text-slate-600 hover:text-blue-600'
            }`}
          >
            <Share2 className="w-5 h-5" />
          </button>
          {showShareMenu && (
            <div className={`absolute right-14 bottom-0 rounded-xl shadow-2xl p-3 flex space-x-2 animate-in slide-in-from-right-2 duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <button 
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isDark 
            ? 'from-black/80 via-black/40 to-transparent' 
            : 'from-black/60 via-black/20 to-transparent'
        } z-10`} />
        
        {/* Hero Image */}
        {isLoading ? (
          <div className={`absolute inset-0 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-gray-200 to-gray-300'
          } animate-pulse`} />
        ) : imageUrl.startsWith('data:') ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : imageUrl.includes('cloudinary.com') ? (
          <CldImage
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <Image
            src={imageUrl || post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Pro Image Badge */}
        {isPro && isGenerated && (
          <div className="absolute top-6 right-6 z-20">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-16 w-full">
            <div className="transform translate-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <div className="flex items-center space-x-3 mb-6">
                <span className={`inline-flex items-center backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  isDark 
                    ? 'bg-gray-900/90 text-white' 
                    : 'bg-white/90 text-slate-900'
                }`}>
                  {post.category}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                          isDark 
                            ? 'bg-gray-800/80 text-gray-300' 
                            : 'bg-white/70 text-slate-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                isDark ? 'text-white' : 'text-white'
              }`}>
                {post.title}
              </h1>
              
              <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${
                isDark ? 'text-gray-200' : 'text-white/90'
              }`}>
                {post.excerpt}
              </p>

              <div className={`flex flex-wrap items-center gap-6 ${
                isDark ? 'text-white/90' : 'text-white/90'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark 
                      ? 'bg-gray-800/80 backdrop-blur-sm' 
                      : 'bg-white/20 backdrop-blur-sm'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
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
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-30">
        <article 
          className={`rounded-3xl shadow-2xl p-10 md:p-16 prose prose-lg max-w-none ${
            isDark 
              ? 'bg-gray-800 prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400 prose-code:text-blue-400' 
              : 'bg-white prose-blue prose-headings:text-slate-900 prose-p:text-slate-700'
          }`}
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />

        {/* Author & Social Section */}
        <div className={`mt-16 rounded-2xl p-8 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-slate-100'
        }`}>
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {post.author[0]}
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {post.author}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  Expert Author
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleShare('twitter')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Facebook className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        <div className="mt-16 pb-16">
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Continue Reading
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Link
                key={i}
                href="/blog"
                className={`rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                    : 'bg-white border border-slate-100 shadow-xl'
                }`}
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="p-6">
                  <span className={`text-sm font-semibold ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Related Article
                  </span>
                  <h3 className={`text-xl font-bold mb-2 mt-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Discover More Insights
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                    Explore additional content and deepen your understanding of the latest trends and techniques.
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
