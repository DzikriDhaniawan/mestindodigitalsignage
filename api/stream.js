const https = require('https');

// Persistent Keep-Alive TLS Agent agar koneksi SSL/TLS ke Google Drive tetap hangat dan cepat
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 32,
  maxFreeSockets: 10
});

// Di Vercel Serverless Function, batas payload respons adalah 4.5 MB per request.
const VERCEL_CHUNK_SIZE = 3800000;

// Cache URL stream transcoded Google Drive (H.264 MP4 faststart) agar langsung play di semua HP & TV
const streamUrlCache = new Map();
const CACHE_TTL_MS = 45 * 60 * 1000;

function resolveDriveStreamInfo(driveId) {
  const cached = streamUrlCache.get(driveId);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const apiUrl = `https://content-workspacevideo-pa.googleapis.com/v1/drive/media/${driveId}/playback?auditContext=forDisplay&key=AIzaSyDVQw45DwoYh632gvsP5vPDqEKvb-Ywnb8`;
    const req = https.get(apiUrl, {
      agent: keepAliveAgent,
      headers: {
        'Origin': 'https://drive.google.com',
        'Referer': 'https://drive.google.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    }, (res) => {
      const cookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const serialized = data && data.mediaStreamingData && data.mediaStreamingData.serializedHouseBrandPlayerResponse;
          if (serialized) {
            const playerResp = JSON.parse(serialized);
            const formats = (playerResp && playerResp.streamingData && playerResp.streamingData.formats) || [];
            // Prioritaskan MP4 H.264 720p (itag 22), 1080p (itag 37), atau 360p (itag 18) yang ringan & 100% kompatibel di semua HP & TV
            const preferred = formats.find(f => f.itag === 22) ||
                              formats.find(f => f.itag === 37) ||
                              formats.find(f => f.itag === 18) ||
                              formats[0];
            if (preferred && preferred.url) {
              const info = {
                url: preferred.url,
                cookies: cookies,
                expiresAt: Date.now() + CACHE_TTL_MS
              };
              streamUrlCache.set(driveId, info);
              return resolve(info);
            }
          }
        } catch (err) {
          // Fallback ke direct download jika gagal parse
        }
        resolve({
          url: `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`,
          cookies: '',
          expiresAt: Date.now() + 5 * 60 * 1000
        });
      });
    });

    req.on('error', () => {
      resolve({
        url: `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`,
        cookies: '',
        expiresAt: Date.now() + 60 * 1000
      });
    });
  });
}

function fetchFromDrive(targetUrl, rangeHeader, cookies, req, res, redirectCount = 0) {
  if (redirectCount > 5) {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Too many redirects');
    }
    return;
  }

  const options = {
    agent: keepAliveAgent,
    headers: {
      'Origin': 'https://drive.google.com',
      'Referer': 'https://drive.google.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Connection': 'keep-alive'
    }
  };

  if (rangeHeader) {
    options.headers['Range'] = rangeHeader;
  }
  if (cookies) {
    options.headers['Cookie'] = cookies;
  }

  const driveReq = https.get(targetUrl, options, (driveRes) => {
    // Handle redirects (301, 302, 303, 307, 308)
    if (driveRes.statusCode >= 300 && driveRes.statusCode < 400 && driveRes.headers.location) {
      const nextCookies = (driveRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
      const mergedCookies = [cookies, nextCookies].filter(Boolean).join('; ');
      driveRes.resume();
      return fetchFromDrive(driveRes.headers.location, rangeHeader, mergedCookies, req, res, redirectCount + 1);
    }

    const headers = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    };

    if (driveRes.headers['content-range']) {
      headers['Content-Range'] = driveRes.headers['content-range'];
    }
    if (driveRes.headers['content-length']) {
      headers['Content-Length'] = driveRes.headers['content-length'];
    }

    res.writeHead(driveRes.statusCode || 206, headers);

    if (req.method === 'HEAD') {
      driveRes.destroy();
      return res.end();
    }

    driveRes.pipe(res);

    // Hentikan unduhan dari Google Drive segera jika user menutup/mengganti video
    req.on('close', () => {
      driveRes.destroy();
      driveReq.destroy();
    });
  });

  driveReq.on('error', (err) => {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Stream error: ' + err.message);
    }
  });

  req.on('close', () => {
    driveReq.destroy();
  });
}

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const driveId = (req.query && req.query.id) || reqUrl.searchParams.get('id');

  if (!driveId || !/^[a-zA-Z0-9_-]+$/.test(driveId)) {
    res.statusCode = 400;
    return res.end('Invalid or missing Google Drive File ID');
  }

  const clientRange = req.headers.range || 'bytes=0-';
  let targetRange = clientRange;

  // Jika berjalan di Vercel Serverless, batasi maksimal 3.8 MB per respons 206 agar bebas error 413 FUNCTION_PAYLOAD_TOO_LARGE
  if (process.env.VERCEL) {
    const match = clientRange.match(/bytes=(\d+)-(\d*)/);
    const start = match ? parseInt(match[1], 10) : 0;
    const requestedEnd = (match && match[2]) ? parseInt(match[2], 10) : null;
    const end = requestedEnd !== null
      ? Math.min(requestedEnd, start + VERCEL_CHUNK_SIZE - 1)
      : (start + VERCEL_CHUNK_SIZE - 1);
    targetRange = `bytes=${start}-${end}`;
  }

  const streamInfo = await resolveDriveStreamInfo(driveId);
  fetchFromDrive(streamInfo.url, targetRange, streamInfo.cookies, req, res);
};
