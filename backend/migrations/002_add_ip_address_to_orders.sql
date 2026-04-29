-- Add ip_address column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Create index on ip_address for queries
CREATE INDEX IF NOT EXISTS idx_orders_ip_address ON orders(ip_address);

-- Add comment to explain the column
COMMENT ON COLUMN orders.ip_address IS 'IP address of the customer who placed the order';
