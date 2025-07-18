import { notFound } from 'next/navigation';
import { getAllPosts, BlogPost } from '@/lib/blog';
import { remark } from 'remark';
import html from 'remark-html';
import BlogPostClient from './BlogPostClient';

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}

async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();
  const contentHtml = await markdownToHtml(post.content);
  return <BlogPostClient post={post} contentHtml={contentHtml} />;
}