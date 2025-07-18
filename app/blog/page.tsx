import { getAllPosts, BlogPost } from '@/lib/blog';
import BlogClient from './BlogClient';
import Footer from '@/components/footer';

export default function Blog() {
  const blogPosts: BlogPost[] = getAllPosts();
  return (
    <div className="min-h-screen bg-gradient-to-br bg-background/95">
      <BlogClient posts={blogPosts} />
      <Footer />
    </div>
  );
}