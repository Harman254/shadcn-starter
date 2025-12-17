import { getAllPosts, BlogPost } from '@/lib/blog';
import BlogClient from './BlogClient';
import Footer from '@/components/footer';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour (blog posts don't change often)

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-background/95 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading blog posts...</p>
      </div>
    </div>
  );
}

export default function Blog() {
  const blogPosts: BlogPost[] = getAllPosts();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-gradient-to-br bg-background/95">
        <BlogClient posts={blogPosts} />
        <Footer />
      </div>
    </Suspense>
  );
}