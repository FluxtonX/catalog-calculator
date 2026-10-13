// Single source of truth for an artist's headline catalog value.
//
// The website and the mobile app (ArtistValuationService.resolveSharedValuation)
// run this SAME algorithm against the shared `api_cache` table:
//   1. Look the artist up by the typed query, then by the RESOLVED artist name
//      (so "Weeknd" and "The Weeknd" share one value).
//   2. First writer wins: a stored, current-version value is never overwritten.
//   3. Rows written by older/buggy engines (no engineVersion) are replaced.
// Keep this file and the Dart port in lock-step.

export const VALUATION_ENGINE_VERSION = 2;

const normalizeKey = (s) => {
  const raw = String(s || '').trim().toLowerCase();
  return raw.replace(/[^a-z0-9]/g, '') || raw.replace(/\s+/g, '_');
};

export const buildValuationCacheId = (query, platforms) =>
  `valuation_${normalizeKey(query)}_${[...new Set(platforms)].sort().join('_')}`;

// Same priority order the mobile app uses to pick the "primary" artist.
export const pickResolvedArtistName = (artistsMap) => {
  const a =
    artistsMap.spotify ??
    artistsMap.spotify_proxy ??
    artistsMap.itunes ??
    artistsMap.youtube ??
    Object.values(artistsMap)[0];
  return a?.name || null;
};

async function readRow(supabase, id) {
  const { data } = await supabase.from('api_cache').select('data').eq('id', id).maybeSingle();
  const d = data?.data;
  const value = Number(d?.baseCatalogValue);
  const exists = !!d && value > 0;
  const current = exists && (d.engineVersion || 0) >= VALUATION_ENGINE_VERSION;
  return { exists, value: current ? value : null };
}

async function writeRow(supabase, id, artistName, platforms, value, replaceStale) {
  const row = {
    id,
    query: String(artistName).trim().toLowerCase(),
    platform: 'valuation',
    data: {
      artistName,
      baseCatalogValue: Math.round(value),
      currency: 'USD',
      platforms: [...new Set(platforms)].sort(),
      engineVersion: VALUATION_ENGINE_VERSION,
      updatedAt: new Date().toISOString(),
    },
  };
  // Absent row -> insert-if-missing (loses gracefully to a concurrent writer).
  // Stale row  -> overwrite.
  await supabase
    .from('api_cache')
    .upsert(row, replaceStale ? { onConflict: 'id' } : { onConflict: 'id', ignoreDuplicates: true });
}

/**
 * @returns {Promise<number>} the one value every client must display for this artist.
 */
export async function resolveSharedValuation({ supabase, typedQuery, platforms, artistsMap, computedVal }) {
  const typedId = buildValuationCacheId(typedQuery, platforms);
  const resolvedName = pickResolvedArtistName(artistsMap);
  const canonId = resolvedName ? buildValuationCacheId(resolvedName, platforms) : typedId;
  const displayName = resolvedName || typedQuery;

  const typed = await readRow(supabase, typedId);
  if (typed.value) return typed.value;

  const canon = canonId === typedId ? typed : await readRow(supabase, canonId);
  if (canon.value) {
    if (canonId !== typedId) await writeRow(supabase, typedId, displayName, platforms, canon.value, typed.exists);
    return canon.value;
  }

  // Nobody has a current value yet: publish ours, then read back the actual winner.
  await writeRow(supabase, canonId, displayName, platforms, computedVal, canon.exists);
  const winner = (await readRow(supabase, canonId)).value ?? Math.round(computedVal);
  if (canonId !== typedId) await writeRow(supabase, typedId, displayName, platforms, winner, typed.exists);
  return winner;
}
