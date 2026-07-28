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
    {
      url: `${baseUrl}/columns/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sitemap/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/author/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. 블로그 상세 포스트 경로 동적 생성
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  if (fs.existsSync(postsDirectory)) {
    const categories = new Set<string>();

    const blogRoutes = fs
      .readdirSync(postsDirectory)
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName): MetadataRoute.Sitemap[number] => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        categories.add(matterResult.data.category || '기타');

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
          url: `${baseUrl}/blog/${encodeURIComponent(slug)}/`,
          lastModified: dateStr,
          changeFrequency: 'weekly',
          priority: 0.6,
        };
      });

    routes.push(...blogRoutes);

    // 3. 카테고리 상세 경로 (블로그 글의 category 프런트매터에서 추출)
    routes.push(
      ...Array.from(categories).map(
        (category): MetadataRoute.Sitemap[number] => ({
          url: `${baseUrl}/categories/${encodeURIComponent(category)}/`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      )
    );
  }

  // 4. 칼럼 상세 경로 동적 생성
  const columnsDirectory = path.join(process.cwd(), 'src/content/columns');
  if (fs.existsSync(columnsDirectory)) {
    const columnRoutes = fs
      .readdirSync(columnsDirectory)
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName): MetadataRoute.Sitemap[number] => {
        const slug = fileName.replace(/\.md$/, '');
        const fileContents = fs.readFileSync(
          path.join(columnsDirectory, fileName),
          'utf8'
        );
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
          url: `${baseUrl}/columns/${encodeURIComponent(slug)}/`,
          lastModified: dateStr,
          changeFrequency: 'monthly',
          priority: 0.5,
        };
      });

    routes.push(...columnRoutes);
  }

  return routes;
}
