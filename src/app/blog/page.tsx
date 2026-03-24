import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800">
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            🏡 성남시 생활 정보
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/" className="text-stone-500 hover:text-orange-600 transition-colors">홈</Link>
            <Link href="/blog" className="text-orange-600 font-bold border-b-2 border-orange-400">블로그</Link>
            <Link href="/about" className="text-stone-500 hover:text-orange-600 transition-colors">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-stone-900 mb-8">📝 블로그</h1>

        {posts.length === 0 ? (
          <p className="text-stone-500 text-center py-20">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-stone-400 text-xs">{post.date}</span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-2 hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-stone-500 text-sm line-clamp-2">{post.summary}</p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
