const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 마크다운 문법 제거 함수 (단순 텍스트 추출)
function removeMarkdown(markdown) {
  if (!markdown) return '';
  return markdown
    .replace(/#+\s+/g, '') // 헤더 제거 (#)
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 볼드 제거 (**)
    .replace(/(\*|_)(.*?)\1/g, '$2') // 이탤릭 제거 (*)
    .replace(/`{3}[\s\S]*?`{3}/g, '') // 코드 블록 제거 (```)
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드 제거 (`)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 텍스트만 유지
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 이미지 제거
    .replace(/>\s+/g, '') // 인용구 기호 제거
    .replace(/[-*+]\s+/g, '') // 리스트 불릿 기호 제거
    .replace(/\s+/g, ' ') // 연속된 공백 통합
    .trim();
}

function main() {
  const searchIndex = [];

  // 1. local-info.json 파일 읽기
  const localInfoPath = path.join(__dirname, '../public/data/local-info.json');
  if (fs.existsSync(localInfoPath)) {
    try {
      const localInfoContent = fs.readFileSync(localInfoPath, 'utf8');
      const items = JSON.parse(localInfoContent);

      items.forEach((item) => {
        searchIndex.push({
          type: 'info',
          id: String(item.id),
          title: item.name || item.title || '',
          summary: item.summary || '',
          content: `${item.location || ''} ${item.target || ''} ${item.summary || ''}`,
          category: item.category || '',
          link: item.link || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
        });
      });
    } catch (e) {
      console.error("local-info.json 처리 중 에러 발생:", e.message);
    }
  }

  // 2. markdown 포스트 파일들 읽기 (src/content/posts)
  const postsDirectory = path.join(__dirname, '../src/content/posts');
  if (fs.existsSync(postsDirectory)) {
    try {
      const fileNames = fs.readdirSync(postsDirectory);
      fileNames.forEach((fileName) => {
        if (!fileName.endsWith('.md')) return;

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content: rawContent } = matter(fileContents);

        const slug = fileName.replace(/\.md$/, '');
        const plainContent = removeMarkdown(rawContent);
        const truncatedContent = plainContent.substring(0, 500);

        searchIndex.push({
          type: 'post',
          id: slug,
          title: data.title || '',
          summary: data.summary || '',
          content: truncatedContent,
          category: data.category || '',
          link: `/blog/${slug}/`,
          date: data.date || '',
        });
      });
    } catch (e) {
      console.error("Markdown posts 처리 중 에러 발생:", e.message);
    }
  }

  // 3. 결과 파일 저장
  const outputPath = path.join(__dirname, '../public/data/search-index.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), 'utf8');
  console.log(`Search index built: ${searchIndex.length} entries`);
}

main();
