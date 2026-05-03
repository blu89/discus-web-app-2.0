-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type VARCHAR NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

CREATE POLICY "Customers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can update conversation status"
  ON conversations FOR UPDATE
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() OR admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() OR admin_id = auth.uid()
    )
  );
