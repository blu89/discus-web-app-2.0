import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * Get or create conversation (works for both authenticated users and guests)
 * POST /api/chat/conversations
 * Body: { guestEmail?, guestName? } for guests
 */
router.post('/conversations', async (req, res) => {
  try {
    const { guestEmail, guestName } = req.body;
    const isGuest = !req.user; // No user means guest visitor
    
    let userId, guestId;
    
    if (isGuest) {
      // Generate guest session ID
      guestId = uuidv4();
      
      if (!guestEmail || !guestName) {
        return res.status(400).json({ 
          error: 'Guest email and name are required' 
        });
      }
    } else {
      userId = req.user.id;
    }

    // Check if conversation already exists
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('status', 'open');
    
    if (isGuest) {
      query = query.eq('guest_email', guestEmail);
    } else {
      query = query.eq('customer_id', userId);
    }

    const { data: existing, error: selectError } = await query.single();

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const conversationData = {
      status: 'open',
      is_guest: isGuest,
      ...(isGuest && {
        guest_id: guestId,
        guest_email: guestEmail,
        guest_name: guestName
      }),
      ...(!isGuest && {
        customer_id: userId
      })
    };

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get messages for a specific conversation
 * GET /api/chat/conversations/:conversationId/messages
 */
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Save a new message to the database (works for both users and guests)
 * POST /api/chat/conversations/:conversationId/messages
 */
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, imageUrl, senderType, guestName } = req.body;
    
    if (!message && !imageUrl) {
      return res.status(400).json({ error: 'Message or image required' });
    }

    let senderId, finalSenderType, senderNameField;
    
    if (senderType === 'guest' || !req.user) {
      // Guest message
      senderId = null;
      finalSenderType = 'guest';
      senderNameField = guestName || 'Guest';
    } else {
      // Authenticated user message
      senderId = req.user.id;
      finalSenderType = senderType || 'customer';
      senderNameField = null;
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: finalSenderType,
        sender_name: senderNameField,
        message_text: message,
        image_url: imageUrl,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all conversations for admin dashboard
 * GET /api/chat/admin/conversations
 */
router.get('/admin/conversations', verifyToken, async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, chat_messages(count)')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json(conversations || []);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a specific conversation with its messages (admin only)
 * GET /api/chat/admin/conversations/:conversationId
 */
router.get('/admin/conversations/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    res.json({
      conversation,
      messages: messages || []
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update conversation status (admin only)
 * PATCH /api/chat/admin/conversations/:conversationId
 */
router.patch('/admin/conversations/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, adminId } = req.body;

    const { data: updated, error } = await supabase
      .from('conversations')
      .update({ 
        status,
        admin_id: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;

    res.json(updated);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
