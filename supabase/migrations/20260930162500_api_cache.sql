CREATE TABLE IF NOT EXISTS public.api_cache (
  id text PRIMARY KEY,
  query text NOT NULL,
  platform text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS api_cache_query_idx ON public.api_cache (query);
