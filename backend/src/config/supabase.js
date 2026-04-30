/**
 * SUPABASE CONFIGURATION MODULE
 * 
 * ⚠️  ENVIRONMENT VARIABLE PROTECTION
 * This module handles Supabase credentials. Environment variables are:
 * - Loaded from .env file at module initialization only
 * - NEVER cached or stored in response cache
 * - NEVER exposed in API responses
 * - NEVER logged with actual values
 * - Only used internally to create database client
 * 
 * The cache middleware (cache.js) includes 5 defense layers to prevent
 * caching of any responses containing Supabase keys or credentials.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
