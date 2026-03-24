import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    // date가 Date 객체인 경우 YYYY-MM-DD 문자열로 변환
    let date = data.date;
    if (date instanceof Date) {
      date = date.toISOString().split("T")[0];
    } else {
      date = String(date ?? "");
    }

    return {
      slug,
      title: String(data.title ?? ""),
      date,
      summary: String(data.summary ?? ""),
      category: String(data.category ?? ""),
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  });

  // 날짜 내림차순 정렬
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  let date = data.date;
  if (date instanceof Date) {
    date = date.toISOString().split("T")[0];
  } else {
    date = String(date ?? "");
  }

  return {
    slug,
    title: String(data.title ?? ""),
    date,
    summary: String(data.summary ?? ""),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
  };
}
