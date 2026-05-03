-- Create reviews table for product reviews and store reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  user_id uuid not null,
  rating integer not null,
  title character varying(255) not null,
  comment text null,
  status character varying(50) null default 'pending'::character varying,
  helpful_count integer null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint reviews_pkey primary key (id),
  constraint reviews_product_id_user_id_key unique (product_id, user_id),
  constraint reviews_user_id_fkey foreign KEY (user_id) references public.users (id) on delete CASCADE,
  constraint reviews_product_id_fkey foreign KEY (product_id) references public.products (id) on delete CASCADE,
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  ),
  constraint reviews_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'approved'::character varying,
            'rejected'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews using btree (product_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews using btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews using btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews using btree (created_at) TABLESPACE pg_default;

-- Enable Row Level Security (RLS) for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved reviews
CREATE POLICY "View approved reviews" ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- Policy: Authenticated users can view their own reviews (any status)
CREATE POLICY "View own reviews" ON public.reviews
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy: Authenticated users can create reviews
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy: Users can update their own reviews
CREATE POLICY "Update own reviews" ON public.reviews
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy: Users can delete their own reviews
CREATE POLICY "Delete own reviews" ON public.reviews
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
