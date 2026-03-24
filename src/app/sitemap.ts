import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export const dynamic = "force-static";

// 배포 주소로 변경
const baseUrl = 'https://my-local-info-b82.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
