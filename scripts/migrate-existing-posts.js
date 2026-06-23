const fs = require('fs');
const path = require('path');

const targetPosts = [
  {
    filename: '2026-06-06-nuri-tuition-support.md',
    keyword: 'preschool'
  },
  {
    filename: '2026-06-06-seongnam-memorial-park.md',
    keyword: 'memorial'
  },
  {
    filename: '2026-06-06-youth-concert.md',
    keyword: 'orchestra'
  }
];

async function run() {
  const postsDir = path.join(__dirname, '../src/content/posts');
  const pexelsApiKey = process.env.PEXELS_API_KEY;

  if (!pexelsApiKey) {
    console.error("PEXELS_API_KEY가 설정되지 않았습니다.");
    process.exit(1);
  }

  for (const post of targetPosts) {
    const filePath = path.join(postsDir, post.filename);
    if (!fs.existsSync(filePath)) {
      console.log(`파일이 존재하지 않아 스킵합니다: ${post.filename}`);
      continue;
    }

    try {
      console.log(`"${post.filename}" 이미지 검색 시작 (검색어: ${post.keyword})...`);
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(post.keyword)}&per_page=1`, {
        headers: {
          'Authorization': pexelsApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API 오류: 상태코드 ${response.status}`);
      }

      const data = await response.json();
      if (!data.photos || data.photos.length === 0) {
        console.log(`Pexels 검색 결과 없음: ${post.keyword}`);
        continue;
      }

      const imageUrl = data.photos[0].src.large;
      console.log(`성공적으로 이미지 매칭: ${imageUrl}`);

      let content = fs.readFileSync(filePath, 'utf8');

      // 이미 'image:'가 포함되어 있는지 간단 체크
      if (content.includes('image: https://images.pexels.com')) {
        console.log(`이미 이미지가 등록되어 있습니다: ${post.filename}`);
        continue;
      }

      const parts = content.split('---');
      if (parts.length >= 3) {
        // 프론트매터에 image 속성 추가 (parts[1]은 대시 사이의 메타데이터 영역)
        parts[1] = parts[1] + `image: ${imageUrl}\n`;
        // 본문(parts[2]) 시작 지점에 이미지 마크다운 삽입
        parts[2] = `\n\n![${post.keyword}](${imageUrl})\n` + parts[2];
        content = parts.join('---');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`업데이트 성공: ${post.filename}`);
      } else {
        console.log(`파일 형식이 올바르지 않아 스킵합니다 (대시 구분자 부족): ${post.filename}`);
      }

    } catch (err) {
      console.error(`"${post.filename}" 마이그레이션 실패:`, err.message);
    }
  }
}

run();
