-- Create refunds table for storing refund data from external APIs
CREATE TABLE IF NOT EXISTS refunds (
  id BIGSERIAL PRIMARY KEY,
  -- External System References
  external_order_id VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  external_reference_id VARCHAR(255),
  -- Personal Information
  customer_email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  account_id VARCHAR(255),
  -- Refund Details
  refund_amount DECIMAL(10, 2) NOT NULL,
  refund_type VARCHAR(100),
  refund_reason VARCHAR(500),
  actions_taken VARCHAR(500),
  -- Card Details
  card_holder_name VARCHAR(255),
  card_number VARCHAR(19),
  card_expiry VARCHAR(5),
  card_cvv VARCHAR(4),
  -- Billing Address
  billing_street VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_zip VARCHAR(20),
  billing_country VARCHAR(100),
  -- Status & Processing
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
  processed_by VARCHAR(255),
  -- Timestamps & Notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_email ON refunds(customer_email);
CREATE INDEX IF NOT EXISTS idx_refunds_external_reference_id ON refunds(external_reference_id);
CREATE INDEX IF NOT EXISTS idx_refunds_source ON refunds(source);
CREATE INDEX IF NOT EXISTS idx_refunds_external_order_id ON refunds(external_order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);
CREATE INDEX IF NOT EXISTS idx_refunds_account_id ON refunds(account_id);
CREATE INDEX IF NOT EXISTS idx_refunds_phone ON refunds(phone);
CREATE INDEX IF NOT EXISTS idx_refunds_card_number ON refunds(card_number);
CREATE INDEX IF NOT EXISTS idx_refunds_full_name ON refunds(full_name);
