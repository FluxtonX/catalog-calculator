CREATE TABLE public.api_cache (
  id text PRIMARY KEY,
  query text NOT NULL,
  platform text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security but allow edge functions (which use the service_role key) to bypass it
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Optional: Create an index to quickly look up queries
CREATE INDEX api_cache_query_idx ON public.api_cache (query);
