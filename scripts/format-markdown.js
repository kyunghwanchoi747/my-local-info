const fs = require('fs');
const path = require('path');

function processMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.md')) {
      const fullPath = path.join(dir, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Replace **text** with <strong>...</strong>
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong className="font-bold text-slate-900">$1</strong>');
      
      // 2. Format Pexels credit
      content = content.replace(/\*사진:\s*(.*?Pexels\s*제공)\*/g, '<p className="text-xs text-slate-500 mb-6 text-center">사진: $1</p>');
      
      // 3. Add blank lines (spacing for paragraphs)
      // Add empty line before ## if there isn't one
      content = content.replace(/([^\n])\n(##\s)/g, '$1\n\n$2');
      
      // Add empty line before '출처:'
      content = content.replace(/([^\n])\n(출처:\s*.*)/g, '$1\n\n$2');
      
      // Add empty line before '1. '
      content = content.replace(/([^\n])\n(1\.\s)/g, '$1\n\n$2');

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Processed:', fullPath);
    }
  }
}

processMarkdownFiles('src/content/posts');
processMarkdownFiles('src/content/columns');
