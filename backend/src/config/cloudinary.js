/**
 * CLOUDINARY CONFIGURATION MODULE
 * 
 * ⚠️  ENVIRONMENT VARIABLE PROTECTION
 * This module handles Cloudinary credentials. Environment variables are:
 * - Loaded from .env file at module initialization only
 * - NEVER cached or stored in response cache
 * - NEVER exposed in API responses or logs
 * - Only used internally to initialize Cloudinary SDK
 * 
 * The cache middleware (cache.js) includes 5 defense layers to prevent
 * caching of any responses containing Cloudinary credentials:
 * - cloudinary_api_key
 * - cloudinary_api_secret
 * - cloudinary_cloud_name
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗'
});

export default cloudinary;
