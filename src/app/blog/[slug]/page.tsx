import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

interface PageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 pb-20">
      <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-orange-600 font-bold hover:opacity-80 transition-opacity">
            ← 목록으로
          </Link>
          <Link href="/" className="text-stone-400 text-sm hover:text-orange-500 transition-colors">홈</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-8 md:p-12 bg-orange-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-stone-400 text-sm">{post.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-stone-500">{post.summary}</p>
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-white text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            <div className="prose prose-stone max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 font-medium transition-colors">
            📝 블로그 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
