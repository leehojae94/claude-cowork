// 차량정보조회 API 프록시 서버
// Vercel Serverless Function

const URLS = {
  dev:  'https://datahub-dev.scraping.co.kr/assist/common/carzen/CarAllInfoInquiry',
  prod: 'https://api.mydatahub.co.kr/assist/common/carzen/CarAllInfoInquiry'
};

module.exports = async function handler(req, res) {
  // ── CORS 헤더 설정 (모든 도메인 허용) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 브라우저 사전 요청(Preflight) 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 이외 방법 차단
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  // 환경 선택 (dev / prod)
  const env = req.query.env || 'dev';
  const targetUrl = URLS[env] || URLS.dev;

  // 서버 환경변수에서 토큰 읽기
  const token = process.env.API_TOKEN;
  if (!token) {
    return res.status(500).json({
      errCode: 'NO_TOKEN',
      errMsg: 'API 토큰이 서버에 설정되지 않았습니다. Vercel 환경변수를 확인하세요.',
      result: 'FAIL',
      data: null
    });
  }

  // 요청 본문 유효성 검사
  const { REGINUMBER, OWNERNAME } = req.body || {};
  if (!REGINUMBER || !OWNERNAME) {
    return res.status(400).json({
      errCode: 'MISSING_PARAMS',
      errMsg: '자동차등록번호(REGINUMBER)와 소유자명(OWNERNAME)은 필수 입력값입니다.',
      result: 'FAIL',
      data: null
    });
  }

  // 실제 API 호출
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ REGINUMBER, OWNERNAME })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      errCode: 'PROXY_ERROR',
      errMsg: '외부 API 호출 중 오류가 발생했습니다: ' + error.message,
      result: 'FAIL',
      data: null
    });
  }
}
