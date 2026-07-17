import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  link?: string;
  contentHtml?: string;
  content?: string;
  image?: string;
}

function formatDate(dateVal: any): string {
  if (dateVal instanceof Date) {
    const yyyy = dateVal.getFullYear();
    const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
    const dd = String(dateVal.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof dateVal === 'string') {
    // 만약 ISO String 형태 등으로 날짜 객체가 문자열로 들어오는 경우 포맷 변환 시도
    const parsed = Date.parse(dateVal);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateVal;
  }
  return '';
}

export function getSortedPostsData(): PostData[] {
  // 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const rawDate = matterResult.data.date;
      const dateStr = formatDate(rawDate);

      return {
        slug,
        title: matterResult.data.title || '',
        date: dateStr,
        summary: matterResult.data.summary || '',
        category: matterResult.data.category || '',
        tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
        link: matterResult.data.link || '',
        content: matterResult.content,
        image: matterResult.data.image || '',
      } as PostData;
    });

  // 날짜순으로 정렬 (최신순)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

export function getPostData(slug: string): PostData | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const rawDate = matterResult.data.date;
    const dateStr = formatDate(rawDate);

    return {
      slug,
      title: matterResult.data.title || '',
      date: dateStr,
      summary: matterResult.data.summary || '',
      category: matterResult.data.category || '',
      tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
      link: matterResult.data.link || '',
      content: matterResult.content,
      image: matterResult.data.image || '',
    };
  } catch (e) {
    return null;
  }
}

// 칼럼 관련 폴더 및 인터페이스/함수 추가
const columnsDirectory = path.join(process.cwd(), 'src/content/columns');

export interface ColumnData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  content?: string;
  image?: string;
}

export function getSortedColumnsData(): ColumnData[] {
  if (!fs.existsSync(columnsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(columnsDirectory);
  const allColumnsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(columnsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const rawDate = matterResult.data.date;
      const dateStr = formatDate(rawDate);

      return {
        slug,
        title: matterResult.data.title || '',
        date: dateStr,
        summary: matterResult.data.summary || '',
        author: matterResult.data.author || '성나머',
        content: matterResult.content,
        image: matterResult.data.image || '',
      } as ColumnData;
    });

  return allColumnsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllColumnSlugs() {
  if (!fs.existsSync(columnsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(columnsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

export function getColumnData(slug: string): ColumnData | null {
  try {
    const fullPath = path.join(columnsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const rawDate = matterResult.data.date;
    const dateStr = formatDate(rawDate);

    return {
      slug,
      title: matterResult.data.title || '',
      date: dateStr,
      summary: matterResult.data.summary || '',
      author: matterResult.data.author || '성나머',
      content: matterResult.content,
      image: matterResult.data.image || '',
    };
  } catch (e) {
    return null;
  }
}

