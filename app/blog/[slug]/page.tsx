import { notFound } from 'next/navigation';
import { getAllPosts, BlogPost } from '@/lib/blog';
import { remark } from 'remark';
import html from 'remark-html';
import BlogPostClient from './BlogPostClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    </div>
  );
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}

async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);
  if (!post) return notFound();
  const contentHtml = await markdownToHtml(post.content);
  return <BlogPostClient post={post} contentHtml={contentHtml} />;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogPostContent slug={slug} />
    </Suspense>
  );
}