import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
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
  slug: string;
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      return {
        id: Number(data.id),
        title: data.title || '',
        excerpt: data.excerpt || '',
        content,
        author: data.author || '',
        publishDate: data.publishDate || '',
        readTime: data.readTime || '',
        category: data.category || '',
        tags: data.tags || [],
        image: data.image || '',
        featured: Boolean(data.featured),
        likes: Number(data.likes) || 0,
        comments: Number(data.comments) || 0,
        slug: fileName.replace(/\.md$/, ''),
      };
    });
  return posts.sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
} 