// frontmatter의 title/summary 값에 콜론(:)이 있으면 YAML 파싱이 깨지므로 저장 전에 따옴표로 감싼다
function quoteFrontmatterColons(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('---', 3);
  if (end === -1) return content;
  const front = content.slice(0, end);
  const fixed = front.replace(/^(title|summary):[ \t]*(.+)$/gm, (line, key, val) => {
    const trimmed = val.trim();
    const alreadyQuoted = (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"));
    if (alreadyQuoted || !trimmed.includes(':')) return line;
    return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
  });
  return fixed + content.slice(end);
}

// AI 응답이 frontmatter 여는 "---"를 빠뜨리는 경우가 있어, 사진 삽입 등 이후 처리가
// content.split('---')로 frontmatter 위치를 찾다가 엉뚱한 곳에 이미지를 끼워 넣는 사고를 막기 위한 가드
function ensureFrontmatterFence(content) {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('---')) return trimmed;
  return '---\n' + trimmed;
}

module.exports = { quoteFrontmatterColons, ensureFrontmatterFence };
