import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sungnamer.com';

  // 1. 기본 정적 페이지 경로
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/redevelopment/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. 블로그 상세 포스트 경로 동적 생성
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory);
    const blogRoutes = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName): MetadataRoute.Sitemap[number] => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        
        let dateStr = new Date().toISOString();
        if (matterResult.data.date) {
          const rawDate = matterResult.data.date;
          if (rawDate instanceof Date) {
            dateStr = rawDate.toISOString();
          } else if (typeof rawDate === 'string') {
            const parsed = Date.parse(rawDate);
            if (!isNaN(parsed)) {
              dateStr = new Date(parsed).toISOString();
            }
          }
        }

        return {
          url: `${baseUrl}/blog/${slug}/`,
          lastModified: dateStr,
          changeFrequency: 'weekly',
          priority: 0.6,
        };
      });

    routes.push(...blogRoutes);
  }

  return routes;
}
