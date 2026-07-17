const fs = require('fs');
const path = require('path');

async function main() {
  const localInfoPath = path.join(__dirname, '../public/data/local-info.json');
  let originalContent = '';
  try {
    originalContent = fs.readFileSync(localInfoPath, 'utf8');
  } catch (e) {
    console.error("기존 데이터를 읽지 못했습니다.", e);
    process.exit(1);
  }

  try {
    // 1단계: 공공데이터 가져오기
    const apiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!apiKey) {
      throw new Error("PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const items = result.data || [];

    if (items.length === 0) {
      console.log("가져온 공공데이터가 없습니다.");
      process.exit(0);
    }

    // 필터링 규칙 적용
    const containsKeyword = (item, keyword) => {
      const fields = [
        item['서비스명'] || item['serviceNm'] || '',
        item['서비스목적요약'] || item['servicePurpSmmr'] || '',
        item['지원대상'] || item['supportTarget'] || '',
        item['소관기관명'] || item['orgNm'] || ''
      ];
      return fields.some(field => String(field).includes(keyword));
    };

    let filteredItems = items.filter(item => containsKeyword(item, '성남'));
    if (filteredItems.length === 0) {
      filteredItems = items.filter(item => containsKeyword(item, '경기'));
    }
    if (filteredItems.length === 0) {
      console.log("오늘은 추가할 지역 항목이 없습니다.");
      process.exit(0);
    }

    // 2단계: 기존 데이터와 비교
    const localInfo = JSON.parse(originalContent);
    const existingNames = new Set(
      localInfo.map(item => (item.name || item.title || '').trim())
    );

    const newItems = filteredItems.filter(item => {
      const name = (item['서비스명'] || item['serviceNm'] || '').trim();
      return name && !existingNames.has(name);
    });

    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      process.exit(0);
    }

    // 3단계: Gemini AI로 새 항목 1개만 가공
    const itemToProcess = newItems[0];
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const targetText = JSON.stringify(itemToProcess, null, 2);
    const today = new Date().toISOString().split('T')[0];
    
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜(${today}), endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${targetText}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const responseGemini = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!responseGemini.ok) {
      throw new Error(`Gemini API 호출 실패: ${responseGemini.status} ${responseGemini.statusText}`);
    }

    const geminiResult = await responseGemini.json();
    if (!geminiResult.candidates || !geminiResult.candidates[0] || !geminiResult.candidates[0].content || !geminiResult.candidates[0].content.parts || !geminiResult.candidates[0].content.parts[0]) {
      throw new Error("Gemini API 응답 형식이 올바르지 않습니다.");
    }

    const generatedText = geminiResult.candidates[0].content.parts[0].text;
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
    }
    jsonText = jsonText.trim();

    const newEvent = JSON.parse(jsonText);

    // ID 고유성 및 타입 보장
    const maxId = localInfo.reduce((max, item) => {
      const numericId = parseInt(String(item.id).replace(/[^0-9]/g, ''), 10);
      return isNaN(numericId) ? max : Math.max(max, numericId);
    }, 0);
    newEvent.id = maxId + 1;

    // 4단계: 기존 데이터에 추가
    localInfo.push(newEvent);
    fs.writeFileSync(localInfoPath, JSON.stringify(localInfo, null, 2) + '\n', 'utf8');
    console.log(`성공적으로 새로운 항목을 추가했습니다: ${newEvent.name}`);

  } catch (error) {
    console.error("오류가 발생하여 작업을 취소하고 기존 데이터를 유지합니다:", error.message);
    try {
      fs.writeFileSync(localInfoPath, originalContent, 'utf8');
    } catch (writeErr) {
      console.error("기존 데이터를 복원하는 데 실패했습니다:", writeErr);
    }
    process.exit(1);
  }
}

main();
