-- Create conversations table (supports both authenticated users and guests)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  guest_id VARCHAR(255), -- For guest visitors (generated session ID)
  guest_email VARCHAR(255), -- Guest email for identification
  guest_name VARCHAR(255), -- Guest name
  admin_id UUID,
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- Ensure either customer_id or guest_id is provided
  CONSTRAINT customer_or_guest CHECK (customer_id IS NOT NULL OR guest_id IS NOT NULL)
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_type VARCHAR NOT NULL CHECK (sender_type IN ('customer', 'admin', 'guest')),
  sender_name VARCHAR(255), -- For guests without auth
  message_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_guest_email ON conversations(guest_email);
CREATE INDEX idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);

-- Note: RLS is disabled - access control is handled by backend authentication (verifyToken middleware)
-- This allows admins to query all conversations and ensures better performance
-- The backend verifyToken middleware ensures only admins can access /chat/admin/* endpoints

