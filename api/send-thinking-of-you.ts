// Vercel Edge/Node API route to call Firebase Function HTTPS endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { fromUserId, toUserId, fromUserName } = req.body || {};
    const url = process.env.FIREBASE_FUNCTIONS_URL || '';
    if (!url) return res.status(500).json({ success: false, error: 'FIREBASE_FUNCTIONS_URL not set' });
    const resp = await fetch(`${url}/createThinkingOfYou`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId, toUserId, fromUserName })
    });
    const json = await resp.json();
    res.status(resp.status).json(json);
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
}

