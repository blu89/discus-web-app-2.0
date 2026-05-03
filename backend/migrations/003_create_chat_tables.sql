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

-- Enable RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

-- Allow guests to view their conversations via guest_id (handled in application)
-- This policy is permissive for RLS, actual verification happens in backend logic
CREATE POLICY "Guests can view conversations"
  ON conversations FOR SELECT
  USING (guest_id IS NOT NULL);

CREATE POLICY "Authenticated customers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Allow guest conversations to be created (handled in application with guest_id)
CREATE POLICY "Create guest conversations"
  ON conversations FOR INSERT
  WITH CHECK (guest_id IS NOT NULL);

CREATE POLICY "Admins can update conversation status"
  ON conversations FOR UPDATE
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Authenticated users can view messages"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() OR admin_id = auth.uid()
    )
  );

-- Allow guests to view their messages (verification in backend)
CREATE POLICY "Guests can view messages"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE guest_id IS NOT NULL
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() OR admin_id = auth.uid()
    )
  );

-- Allow guests to insert messages (verification in backend)
CREATE POLICY "Guests can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_type = 'guest' AND
    conversation_id IN (
      SELECT id FROM conversations WHERE guest_id IS NOT NULL
    )
  );

