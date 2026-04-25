const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SEARCH_INDEX_PATH = path.join(__dirname, '../public/data/search-index.json');
const LOCAL_INFO_PATH = path.join(__dirname, '../public/data/local-info.json');
const POSTS_DIR = path.join(__dirname, '../src/content/posts');

// 마크다운 기호 제거 함수
function stripMarkdown(content) {
  return content
    .replace(/#+\s+/g, '') // 헤더 제거
    .replace(/\*\*/g, '') // 굵게 제거
    .replace(/\*/g, '') // 기울임 제거
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크 텍스트만 남기기
    .replace(/\|/g, ' ') // 표 구분선 제거
    .replace(/>/g, '') // 인용구 기호 제거
    .replace(/---/g, '') // 구분선 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 전환
    .replace(/\s+/g, ' ') // 연속된 공백 하나로 축소
    .trim();
}

function buildIndex() {
  const index = [];

  // 1. 공공데이터(local-info.json) 처리
  if (fs.existsSync(LOCAL_INFO_PATH)) {
    const localInfo = JSON.parse(fs.readFileSync(LOCAL_INFO_PATH, 'utf-8'));
    localInfo.items.forEach(item => {
      index.push({
        id: `info-${item.id}`,
        type: 'info',
        title: item.name,
        summary: item.summary,
        content: `${item.location} ${item.target} ${item.category}`,
        url: `/`
      });
    });
  }

  // 2. 블로그 포스트(Markdown) 처리
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md') && file !== '.gitkeep');
    files.forEach(file => {
      const filePath = path.join(POSTS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      const plainContent = stripMarkdown(content).substring(0, 500);
      const slug = file.replace('.md', '');
      
      index.push({
        id: `post-${slug}`,
        type: 'post',
        title: data.title || 'Untitled',
        summary: data.summary || '',
        content: plainContent,
        url: `/blog/${slug}`
      });
    });
  }

  // 디렉토리 확인 및 저장
  const dir = path.dirname(SEARCH_INDEX_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`Search index built: ${index.length} entries`);
}

buildIndex();
