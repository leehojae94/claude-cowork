const URLS = {
  dev:  'https://datahub-dev.scraping.co.kr/assist/common/carzen/CarAllInfoInquiry',
  prod: 'https://api.mydatahub.co.kr/assist/common/carzen/CarAllInfoInquiry'
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 허용' });

  const env = req.query.env || 'dev';
  const targetUrl = URLS[env] || URLS.dev;
  const token = process.env.API_TOKEN;

  if (!token) return res.status(500).json({
    errCode: 'NO_TOKEN', errMsg: 'API_TOKEN 환경변수가 없습니다.', result: 'FAIL', data: null
  });

  const { REGINUMBER, OWNERNAME } = req.body || {};
  if (!REGINUMBER || !OWNERNAME) return res.status(400).json({
    errCode: 'MISSING_PARAMS', errMsg: '차량번호와 소유자명을 입력하세요.', result: 'FAIL', data: null
  });

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
      errCode: 'PROXY_ERROR', errMsg: '외부 API 오류: ' + error.message, result: 'FAIL', data: null
    });
  }
};
