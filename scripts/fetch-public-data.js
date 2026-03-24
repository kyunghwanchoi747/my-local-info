const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
      console.error('Missing API keys in environment variables.');
      process.exit(1);
    }

    // [1단계] 공공데이터포털 API에서 데이터 가져오기
    const listUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}&returnType=JSON`;
    
    const response = await fetch(listUrl);
    if (!response.ok) {
      throw new Error(`Public Data API fetch failed: ${response.statusText}`);
    }
    const data = await response.json();
    
    let items = data.data || [];
    
    // 필터링: 성남 포함
    let filteredItems = items.filter(item => {
      const str = JSON.stringify([item.서비스명, item.서비스목적요약, item.지원대상, item.소관기관명] || []);
      return str.includes('성남');
    });

    // 필터링: 경기 포함
    if (filteredItems.length === 0) {
      filteredItems = items.filter(item => {
        const str = JSON.stringify([item.서비스명, item.서비스목적요약, item.지원대상, item.소관기관명] || []);
        return str.includes('경기');
      });
    }

    // 전체 사용
    if (filteredItems.length === 0) {
      filteredItems = items;
    }

    if (filteredItems.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    // [2단계] 기존 데이터와 비교
    const localInfoPath = path.join(__dirname, '../public/data/local-info.json');
    let localData = { items: [] };
    if (fs.existsSync(localInfoPath)) {
      const rawData = fs.readFileSync(localInfoPath, 'utf8');
      localData = JSON.parse(rawData);
    }

    const existingNames = new Set(localData.items.map(item => item.name));

    // 새로운 항목 1건 찾기 (서비스명 배열 키에 따라 다를 수 있으므로 포함 여부로 체크)
    const newItem = filteredItems.find(item => {
      const itemName = item.서비스명 || item.serviceName || item.title || "";
      for (const existingName of existingNames) {
         if (existingName.includes(itemName) || itemName.includes(existingName)) return false;
      }
      return true;
    });

    if (!newItem) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    // [3단계] Gemini AI로 새 항목 1개만 가공
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(newItem, null, 2)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API fetch failed: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    let geminiText = geminiData.candidates[0].content.parts[0].text;
    
    // 마크다운 코드블록 제거
    geminiText = geminiText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    const parsedItem = JSON.parse(geminiText);

    // 고유 ID 생성 (가장 큰 ID + 1)
    let nextId = 1;
    if (localData.items.length > 0) {
      const ids = localData.items.map(i => parseInt(i.id, 10)).filter(i => !isNaN(i));
      if (ids.length > 0) {
        nextId = Math.max(...ids) + 1;
      }
    }
    parsedItem.id = String(nextId);

    // [4단계] 기존 데이터에 추가
    localData.items.push(parsedItem);

    fs.writeFileSync(localInfoPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log('데이터 추가 완료:', parsedItem.name);

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

main();
