// News Sentiment Aggregator
// - Fetches last 2 days of news from NewsAPI (Everything endpoint)
// - Optionally fetches Reddit posts/comments and Twitter tweets for sentiment
// - Computes weighted sentiment and returns enriched articles

const https = require('https');

// Simple in-memory cache to mitigate rate limits (per function instance)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // key -> { expires, payload }

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Support key rotation: NEWSAPI_KEYS can be comma-separated list. Fallback to NEWSAPI_KEY
    const keyList = ((process.env.NEWSAPI_KEYS || '')
      .split(',')
      .map(k => k.trim())
      .filter(Boolean));
    if (process.env.NEWSAPI_KEY && !keyList.length) keyList.push(process.env.NEWSAPI_KEY);
    if (!keyList.length) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'NEWSAPI_KEY/NEWSAPI_KEYS not configured' }) };
    }

    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

    const params = event.queryStringParameters || {};
    const query = (params.q || 'stocks OR market OR economy').slice(0, 200);
    const language = params.language || 'en';
    const pageSize = Math.min(parseInt(params.pageSize || '25', 10), 50);
    const timeRange = (params.timeRange || '48h').toLowerCase();

    // Time window selection
    const now = new Date();
    let from = new Date(now);
    if (timeRange === '24h') {
      from.setHours(now.getHours() - 24);
    } else if (timeRange === '48h') {
      from.setHours(now.getHours() - 48);
    } else if (timeRange === '7d') {
      from.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      from.setDate(now.getDate() - 30);
    } else if (params.from && params.to) {
      // Optional custom ISO range; validate very roughly and cap to 60 days window
      const tryFrom = new Date(params.from);
      const tryTo = new Date(params.to);
      if (!isNaN(tryFrom) && !isNaN(tryTo) && tryFrom < tryTo) {
        const maxWindowMs = 60 * 24 * 60 * 60 * 1000; // 60 days
        if (tryTo - tryFrom <= maxWindowMs) {
          from = tryFrom;
        } else {
          from = new Date(tryTo - maxWindowMs);
        }
      } else {
        from.setHours(now.getHours() - 48);
      }
    } else {
      from.setHours(now.getHours() - 48);
    }
    const fromISO = from.toISOString();
    const toISO = now.toISOString();

    const { default: fetch } = await import('node-fetch');

    // Construct a cache key
    const cacheKey = JSON.stringify({ q: query, language, pageSize, timeRange, fromISO, toISO });
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { statusCode: 200, headers, body: JSON.stringify(cached.payload) };
    }

    // 1) Fetch articles from NewsAPI (Everything endpoint)
    const newsUrl = new URL('https://newsapi.org/v2/everything');
    newsUrl.searchParams.set('q', query);
    newsUrl.searchParams.set('from', fromISO);
    newsUrl.searchParams.set('to', toISO);
    newsUrl.searchParams.set('language', language);
    newsUrl.searchParams.set('sortBy', 'popularity');
    newsUrl.searchParams.set('pageSize', String(pageSize));

    // Helper: try multiple keys sequentially
    async function fetchWithKeys(url) {
      let lastError = null;
      for (const apiKey of keyList) {
        try {
          const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
          if (res.ok) return { res };
          lastError = res;
          if ([429, 401, 403].includes(res.status)) {
            // rotate to next key
            continue;
          } else {
            // non-429 error; return immediately
            return { res };
          }
        } catch (e) {
          lastError = e;
        }
      }
      return { res: lastError };
    }

    let { res: newsRes } = await fetchWithKeys(newsUrl.toString());
    let baseArticles = [];
    let provider = 'newsapi.org';
    if (!newsRes || !newsRes.ok) {
      // If rate limited by NewsAPI, try a graceful fallback or cached response
      if (newsRes && (newsRes.status === 429 || newsRes.status === 401 || newsRes.status === 403)) {
        // If we have any cached payload for this key, return it
        if (cached && cached.expires > Date.now()) {
          return { statusCode: 200, headers, body: JSON.stringify(cached.payload) };
        }
        // Attempt a lighter fallback using top-headlines with same query (best effort)
        try {
          const altUrl = new URL('https://newsapi.org/v2/top-headlines');
          altUrl.searchParams.set('q', query);
          altUrl.searchParams.set('language', language);
          altUrl.searchParams.set('pageSize', String(Math.min(pageSize, 10)));
          const { res: altRes } = await fetchWithKeys(altUrl.toString());
          if (altRes.ok) {
            newsRes = altRes; // continue with alt data
          } else {
            const msg = await altRes.text();
            // Try secondary provider: newsdata.io
            const nd = await fetchFromNewsData(query, language, fromISO, toISO, pageSize);
            if (nd.ok) {
              baseArticles = nd.articles;
              provider = 'newsdata.io';
            } else {
              return { statusCode: 200, headers, body: JSON.stringify({
                query,
                from: fromISO,
                to: toISO,
                totalArticles: 0,
                counts: { Positive: 0, Neutral: 0, Negative: 0 },
                articles: [],
                note: 'Upstream provider unavailable (429/401/403). Please try again shortly.' ,
                upstream: msg
              }) };
            }
          }
        } catch (e) {
          // Try secondary provider: newsdata.io
          const nd = await fetchFromNewsData(query, language, fromISO, toISO, pageSize);
          if (nd.ok) {
            baseArticles = nd.articles;
            provider = 'newsdata.io';
          } else {
            return { statusCode: 200, headers, body: JSON.stringify({
              query,
              from: fromISO,
              to: toISO,
              totalArticles: 0,
              counts: { Positive: 0, Neutral: 0, Negative: 0 },
              articles: [],
              note: 'Providers unavailable. Please try again shortly.'
            }) };
          }
        }
      } else {
        const errText = newsRes && newsRes.text ? await newsRes.text() : String(newsRes);
        return { statusCode: newsRes.status, headers, body: JSON.stringify({ error: 'NewsAPI error', details: errText }) };
      }
    }
    if (!baseArticles.length) {
      const newsData = await newsRes.json();
      baseArticles = Array.isArray(newsData.articles) ? newsData.articles : [];
    }

    // Utility: simple sentiment using 'sentiment' npm package
    let Sentiment;
    try {
      Sentiment = require('sentiment');
    } catch (e) {
      // Fallback: minimal heuristic if dependency missing
      Sentiment = class {
        analyze(text) {
          const positives = ['good','great','positive','up','bull','gain','beat','surge','record','strong','growth'];
          const negatives = ['bad','poor','negative','down','bear','loss','miss','drop','weak','decline'];
          const lc = (text || '').toLowerCase();
          let score = 0;
          positives.forEach(w => { if (lc.includes(w)) score += 1; });
          negatives.forEach(w => { if (lc.includes(w)) score -= 1; });
          return { score };
        }
      };
    }
    const sentiment = new Sentiment();
    // Secondary provider: newsdata.io
    async function fetchFromNewsData(q, lang, fromISO, toISO, size) {
      try {
        const ND_KEY = process.env.NEWSDATA_API_KEY || process.env.NEWSDATA_KEY;
        if (!ND_KEY) return { ok: false, status: 500, error: 'NEWSDATA_API_KEY not configured' };
        // Build query. newsdata.io supports 'q' and 'from_date'/'to_date' in ISO YYYY-MM-DD
        const fromDate = fromISO.slice(0, 10);
        const toDate = toISO.slice(0, 10);
        const ndUrl = new URL('https://newsdata.io/api/1/news');
        ndUrl.searchParams.set('apikey', ND_KEY);
        ndUrl.searchParams.set('q', q);
        ndUrl.searchParams.set('language', lang);
        ndUrl.searchParams.set('from_date', fromDate);
        ndUrl.searchParams.set('to_date', toDate);
        ndUrl.searchParams.set('page', '1');
        ndUrl.searchParams.set('page_size', String(Math.min(size, 50)));
        const ndRes = await fetch(ndUrl.toString());
        if (!ndRes.ok) return { ok: false, status: ndRes.status, error: await ndRes.text() };
        const ndJson = await ndRes.json();
        const results = Array.isArray(ndJson.results) ? ndJson.results : [];
        // Normalize to NewsAPI-like article shape we expect later
        const normalized = results.map(r => ({
          title: r.title || '',
          source: { name: r.source_id || r.source || 'Unknown' },
          url: r.link || r.url || '',
          publishedAt: r.pubDate || r.published_at || new Date().toISOString(),
          urlToImage: r.image_url || r.image || ''
        }));
        return { ok: true, articles: normalized };
      } catch (e) {
        return { ok: false, status: 500, error: e.message };
      }
    }

    const clean = (s) => (s || '').replace(/[\r\n]+/g, ' ').trim();
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const normalizeScore = (raw) => clamp(raw / 10, -1, 1); // rough normalization

    // Helper: Reddit lookup by URL or title
    async function fetchRedditSignals(title, url) {
      try {
        const results = { commentTexts: [], scoreSum: 0, commentsCount: 0 };
        // Prefer URL-based lookup
        if (url) {
          const infoUrl = `https://www.reddit.com/api/info.json?url=${encodeURIComponent(url)}`;
          const infoRes = await fetch(infoUrl, { agent: new https.Agent({ keepAlive: true }) });
          if (infoRes.ok) {
            const info = await infoRes.json();
            const posts = info?.data?.children || [];
            for (const p of posts.slice(0, 2)) {
              const id = p?.data?.id;
              const commentsUrl = `https://www.reddit.com/comments/${id}.json?limit=20`;
              const commentsRes = await fetch(commentsUrl, { agent: new https.Agent({ keepAlive: true }) });
              if (commentsRes.ok) {
                const commentsJson = await commentsRes.json();
                const listing = commentsJson?.[1]?.data?.children || [];
                listing.forEach(c => {
                  const body = c?.data?.body || '';
                  if (body && !c?.data?.stickied) {
                    results.commentTexts.push(body);
                    results.commentsCount += 1;
                  }
                });
              }
            }
          }
        }
        // Fallback search by title if no comments found
        if (results.commentsCount === 0 && title) {
          const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(title)}&sort=comments&t=week&limit=3`;
          const searchRes = await fetch(searchUrl, { agent: new https.Agent({ keepAlive: true }) });
          if (searchRes.ok) {
            const searchJson = await searchRes.json();
            const posts = searchJson?.data?.children || [];
            for (const p of posts.slice(0, 2)) {
              const id = p?.data?.id;
              const commentsUrl = `https://www.reddit.com/comments/${id}.json?limit=20`;
              const commentsRes = await fetch(commentsUrl, { agent: new https.Agent({ keepAlive: true }) });
              if (commentsRes.ok) {
                const commentsJson = await commentsRes.json();
                const listing = commentsJson?.[1]?.data?.children || [];
                listing.forEach(c => {
                  const body = c?.data?.body || '';
                  if (body && !c?.data?.stickied) {
                    results.commentTexts.push(body);
                    results.commentsCount += 1;
                  }
                });
              }
            }
          }
        }
        // Compute reddit sentiment score
        let score = 0;
        results.commentTexts.slice(0, 50).forEach(t => { score += sentiment.analyze(t).score; });
        results.scoreSum = score;
        const normalized = results.commentsCount > 0 ? normalizeScore(score / results.commentsCount) : 0;
        return { score: normalized, rawCount: results.commentsCount };
      } catch (e) {
        return { score: 0, rawCount: 0 };
      }
    }

    // Helper: Twitter recent search (optional)
    async function fetchTwitterSignals(title) {
      try {
        if (!TWITTER_BEARER_TOKEN) return { score: 0, rawCount: 0 };
        const q = encodeURIComponent(`${title} lang:en -is:retweet`);
        const url = `https://api.twitter.com/2/tweets/search/recent?query=${q}&max_results=50&tweet.fields=public_metrics,lang`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } });
        if (!res.ok) return { score: 0, rawCount: 0 };
        const json = await res.json();
        const tweets = json?.data || [];
        let score = 0;
        tweets.forEach(t => { score += sentiment.analyze(t.text).score; });
        const normalized = tweets.length > 0 ? normalizeScore(score / tweets.length) : 0;
        return { score: normalized, rawCount: tweets.length };
      } catch (e) {
        return { score: 0, rawCount: 0 };
      }
    }

    // Process each article with sentiment and social signals (limited concurrency)
    const limited = baseArticles.slice(0, pageSize);
    const enriched = [];
    for (const article of limited) {
      const baseText = `${clean(article.title)}. ${clean(article.description)}. ${clean(article.content)}`;
      const baseScore = normalizeScore(sentiment.analyze(baseText).score);

      const [reddit, twitter] = await Promise.all([
        fetchRedditSignals(article.title, article.url),
        fetchTwitterSignals(article.title)
      ]);

      // Weighted sentiment
      const weights = { base: 0.5, reddit: 0.35, twitter: 0.15 };
      const combined = (baseScore * weights.base) + (reddit.score * weights.reddit) + (twitter.score * weights.twitter);
      const label = combined >= 0.15 ? 'Positive' : combined <= -0.15 ? 'Negative' : 'Neutral';

      enriched.push({
        title: article.title,
        source: article.source?.name || 'Unknown',
        url: article.url,
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage || '',
        baseScore,
        redditScore: reddit.score,
        twitterScore: twitter.score,
        redditComments: reddit.rawCount,
        tweets: twitter.rawCount,
        combinedScore: Number(combined.toFixed(3)),
        sentiment: label
      });
    }

    // Aggregate counts
    const counts = enriched.reduce((acc, a) => { acc[a.sentiment] = (acc[a.sentiment] || 0) + 1; return acc; }, {});

    const payload = {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        query,
        from: fromISO,
        to: toISO,
        totalArticles: enriched.length,
        counts,
        articles: enriched
      })
    };
    // Cache the successful result
    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, payload: JSON.parse(payload.body) });
    return payload;
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error', details: error.message }) };
  }
};

