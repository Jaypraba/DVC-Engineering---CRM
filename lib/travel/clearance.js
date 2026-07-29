// Clearance / error-fare aggregation from public deal-site RSS feeds.
// These sites specialise in mistake fares and flash sales — the closest thing
// to "clearance flights" that exists. We fetch their feeds server-side, parse
// the XML with no extra dependencies, and enrich with Claude.

const FEEDS = [
  { source: 'Secret Flying', url: 'https://www.secretflying.com/feed/' },
  { source: 'Fly4free', url: 'https://www.fly4free.com/flights/feed/' },
  { source: 'The Flight Deal', url: 'https://www.theflightdeal.com/feed/' },
];

const ERROR_FARE_KEYWORDS = ['error fare', 'mistake fare', 'pricing error', 'glitch'];

function decodeEntities(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .trim();
}

function parseRssItems(xml, source) {
  const items = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of itemBlocks) {
    const title = decodeEntities((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = decodeEntities((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    const categories = (block.match(/<category>[\s\S]*?<\/category>/g) || [])
      .map((c) => decodeEntities(c.replace(/<\/?category>/g, '')));
    if (title && link) {
      items.push({ source, title, link, pubDate: pubDate.trim(), categories });
    }
  }
  return items;
}

function quickPrice(title) {
  const m = title.match(/(£|\$|€)\s?(\d{1,4}(?:[.,]\d{3})*(?:\.\d{2})?)/);
  if (!m) return null;
  const currency = m[1] === '£' ? 'GBP' : m[1] === '$' ? 'USD' : 'EUR';
  return { amount: parseFloat(m[2].replace(/,/g, '')), currency };
}

function looksLikeErrorFare(item) {
  const haystack = (item.title + ' ' + item.categories.join(' ')).toLowerCase();
  return ERROR_FARE_KEYWORDS.some((k) => haystack.includes(k));
}

export async function fetchClearanceDeals({ maxPerFeed = 15 } = {}) {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DVCTravelBot/1.0)' },
        });
        if (!res.ok) throw new Error(`${feed.source}: HTTP ${res.status}`);
        const xml = await res.text();
        return parseRssItems(xml, feed.source).slice(0, maxPerFeed);
      } finally {
        clearTimeout(timer);
      }
    })
  );

  const items = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .map((item) => ({
      ...item,
      price: quickPrice(item.title),
      isErrorFare: looksLikeErrorFare(item),
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    }))
    .sort((a, b) => {
      if (a.isErrorFare !== b.isErrorFare) return a.isErrorFare ? -1 : 1;
      return (b.publishedAt || '').localeCompare(a.publishedAt || '');
    });

  const failedSources = results
    .map((r, i) => (r.status === 'rejected' ? FEEDS[i].source : null))
    .filter(Boolean);

  return { items, failedSources };
}
