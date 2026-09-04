import { config } from 'hatchable';

export const access = 'public';
export const methods = ['GET'];

const WIKI = 'https://en.wikipedia.org/w/api.php';
const WD_SEARCH = 'https://www.wikidata.org/w/api.php';
const SPARQL = 'https://query.wikidata.org/sparql';

async function getJson(url) {
  const r = await fetch(url, { timeout_ms: 12000, headers: { 'User-Agent': 'BOLS2/1.0 real-cinema-data' } });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  return r.json();
}

async function wikidataSearch(name) {
  const u = WD_SEARCH + '?action=wbsearchentities&search=' + encodeURIComponent(name) + '&language=en&format=json&limit=1&origin=*';
  const j = await getJson(u);
  return j?.search?.[0]?.id || null;
}

async function sparql(query) {
  const u = SPARQL + '?format=json&query=' + encodeURIComponent(query);
  const j = await getJson(u);
  return j?.results?.bindings || [];
}

async function wikipediaImage(title, preferPoster=false, year=0) {
  const wikiTitles = [];
  if (year) wikiTitles.push(`${title} (${year} film)`);
  wikiTitles.push(title);
  for (const wt of wikiTitles) {
    try {
      const u = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wt);
      const j = await getJson(u);
      const img = j?.thumbnail?.source || j?.originalimage?.source;
      if (img && /poster|cover|film|movie/i.test(String(img))) return img;
      if (img && !preferPoster) return img;
    } catch (_) {}
  }
  if (preferPoster) {
    try {
      const q = '"' + title + '" poster';
      const u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(q) + '&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*';
      const j = await getJson(u);
      const pages = Object.values(j?.query?.pages || {});
      const pick = pages.find(p => /poster/i.test(p?.title || '')) || pages[0];
      if (pick?.imageinfo?.[0]?.thumburl || pick?.imageinfo?.[0]?.url) return pick.imageinfo[0].thumburl || pick.imageinfo[0].url;
    } catch (_) {}
  }
  const exact = WIKI + '?action=query&prop=pageimages&titles=' + encodeURIComponent(title) + '&pithumbsize=1200&format=json&origin=*';
  try {
    const j = await getJson(exact);
    const p = Object.values(j?.query?.pages || {})[0];
    if (p?.thumbnail?.source) return p.thumbnail.source;
  } catch (_) {}
  return null;
}

function bind(v, key) { return v?.[key]?.value || null; }

export default async function(req, res) {
  try {
    const mode = String(req.query.mode || 'film').toLowerCase();
    const title = String(req.query.title || '').trim().slice(0, 160);
    const year = Number(req.query.year || 0);
    if (!title) return res.status(400).json({ error: 'title is required' });

    if (mode === 'film') {
      const safeTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const yearFilter = year ? `FILTER(YEAR(?date) = ${Math.max(1800, Math.min(2100, year))})` : '';
      const q = `SELECT DISTINCT ?film ?filmLabel ?actor ?actorLabel ?characterLabel ?actorImage WHERE { ?film wdt:P31/wdt:P279* wd:Q11424; rdfs:label "${safeTitle}"@en; wdt:P577 ?date; p:P161 ?cast. ?cast ps:P161 ?actor. ?film rdfs:label ?filmLabel FILTER(LANG(?filmLabel)="en"). ?actor rdfs:label ?actorLabel FILTER(LANG(?actorLabel)="en"). OPTIONAL { ?cast pq:P453 ?character. ?character rdfs:label ?characterLabel FILTER(LANG(?characterLabel)="en") } OPTIONAL { ?actor wdt:P18 ?actorImage } ${yearFilter} } ORDER BY ?date LIMIT 40`;
      const rows = await sparql(q);
      const seen = new Set();
      const cast = rows.map(r => ({
        name: bind(r, 'actorLabel'),
        qid: bind(r, 'actor')?.split('/').pop(),
        character: bind(r, 'characterLabel'),
        image: bind(r, 'actorImage')
      })).filter(x => x.name && !seen.has(x.name) && seen.add(x.name));
      /* Film art is resolved independently from cast/person images. Prefer the exact year-specific Wikipedia film page, then a poster search, and never fall back to an actor image. */
      const poster = await wikipediaImage(title, true, year);
      return res.json({ title, year: year || null, poster, cast, source: 'Wikidata + Wikipedia/Wikimedia' });
    }

    if (mode === 'person') {
      const qid = await wikidataSearch(title);
      if (!qid) return res.json({ name: title, qid: null, films: [], source: 'Wikidata' });
      const q = `SELECT ?film ?filmLabel ?date ?roleLabel ?filmImage WHERE { ?film wdt:P31/wdt:P279* wd:Q11424; wdt:P161 ?person; wdt:P577 ?date. FILTER(?person = wd:${qid}) OPTIONAL { ?film p:P161 ?cast. ?cast ps:P161 wd:${qid}. OPTIONAL { ?cast pq:P453 ?role. ?role rdfs:label ?roleLabel FILTER(LANG(?roleLabel)="en") } } OPTIONAL { ?film wdt:P18 ?filmImage } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } ORDER BY DESC(?date) LIMIT 80`;
      const rows = await sparql(q);
      const seen = new Set();
      const films = rows.map(r => ({
        qid: bind(r, 'film')?.split('/').pop(),
        title: bind(r, 'filmLabel'),
        year: bind(r, 'date')?.slice(0, 4),
        role: bind(r, 'roleLabel'),
        image: bind(r, 'filmImage')
      })).filter(x => x.title && !seen.has(x.qid) && seen.add(x.qid));
      return res.json({ name: title, qid, films, source: 'Wikidata' });
    }

    return res.status(400).json({ error: 'mode must be film or person' });
  } catch (err) {
    console.error('real-cinema', err?.message || err);
    return res.status(502).json({ error: 'Real cinema data temporarily unavailable.' });
  }
}