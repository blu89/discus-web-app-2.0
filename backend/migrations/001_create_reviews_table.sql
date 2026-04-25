-- Create reviews table for product reviews and store reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create index on product_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Create index on status for filtering approved reviews
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Enable Row Level Security (RLS) for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved reviews
CREATE POLICY "View approved reviews" ON reviews
  FOR SELECT
  USING (status = 'approved' OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid()
    UNION
    SELECT 1 FROM users WHERE users.role = 'admin' AND users.id = auth.uid()
  ));

-- Policy: Users can view their own pending/rejected reviews
CREATE POLICY "View own reviews" ON reviews
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own reviews
CREATE POLICY "Update own reviews" ON reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own reviews
CREATE POLICY "Delete own reviews" ON reviews
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Admin can manage all reviews
CREATE POLICY "Admin manage reviews" ON reviews
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));
