# Review System Documentation

## Overview

The review system allows customers to submit, view, and manage product reviews and store-wide reviews. Admins can moderate and manage all reviews from the admin dashboard.

## Features

### For Customers
- **Submit Product Reviews**: Leave ratings and comments on products they've purchased
- **View Product Reviews**: See all approved reviews on product detail pages
- **View Store Reviews**: Browse customer reviews on the dedicated Reviews page
- **Manage Personal Reviews**: View and delete their own reviews from My Reviews page
- **Star Ratings**: Rate products from 1-5 stars
- **Review Details**: Include title and detailed comments (up to 1000 characters)

### For Admins
- **Review Moderation**: Approve, reject, or delete reviews
- **Review Management**: Full CRUD operations on all reviews
- **Filter & Search**: Filter by status (pending, approved, rejected) and search reviews
- **Bulk Actions**: Manage multiple reviews efficiently
- **Statistics**: View average ratings and review distribution

## Components

### Frontend Components

#### 1. **ReviewForm** (`src/components/ReviewForm.jsx`)
- Star rating selector (1-5 stars)
- Review title input
- Detailed comment textarea
- Form validation
- Success/error messages
- Authentication check - redirects to login if not authenticated

#### 2. **ReviewCard** (`src/components/ReviewCard.jsx`)
- Displays individual review
- Shows reviewer name and date
- Displays star rating
- Shows review comment
- Shows helpful count

#### 3. **ReviewManagement** (`src/components/admin/ReviewManagement.jsx`)
- Admin dashboard for managing reviews
- Filter by status (all, pending, approved, rejected)
- Search reviews by title, comment, user, or product
- Approve/reject pending reviews
- Delete reviews
- Edit review details
- Responsive table layout

### Frontend Pages

#### 1. **Reviews Page** (`src/pages/Reviews.jsx`)
- Display all approved customer reviews
- Overall store rating with distribution chart
- Pagination support
- Featured reviews section
- Call-to-action for writing reviews

#### 2. **MyReviews Page** (`src/pages/MyReviews.jsx`)
- Personalized review page for logged-in users
- Display all reviews written by the user
- Ability to delete own reviews
- Shows product information for each review
- Pagination support

#### 3. **ProductDetail Page** (Updated)
- Integrated review section below product details
- Review form for authenticated users
- Display average rating and review count
- List of approved reviews for the product
- Auto-refresh when new review is submitted

### Backend

#### 1. **Review Controller** (`src/controllers/reviewController.js`)

**Functions:**
- `getAllReviews()` - Get all reviews (admin only)
- `getReviewsByProduct()` - Get reviews for specific product with average rating
- `getUserReviews()` - Get all reviews by a user
- `createReview()` - Submit a new review (prevents duplicate reviews per product)
- `updateReview()` - Update review (admin only)
- `deleteReview()` - Delete review (admin only)
- `getStoreReviews()` - Get all approved reviews for homepage/reviews page

#### 2. **Review Routes** (`src/routes/reviews.js`)

**Public Routes:**
- `GET /api/reviews/store` - Get all approved store reviews
- `GET /api/reviews/product/:productId` - Get reviews for a product

**Protected Routes:**
- `POST /api/reviews` - Create a review (requires authentication)
- `GET /api/reviews/user/:userId` - Get user's reviews

**Admin Routes:**
- `GET /api/reviews` - Get all reviews with filters
- `PUT /api/reviews/:reviewId` - Update review status or details
- `DELETE /api/reviews/:reviewId` - Delete review

### Database Schema

#### Reviews Table
```sql
reviews (
  id: UUID (Primary Key)
  product_id: UUID (Foreign Key → products)
  user_id: UUID (Foreign Key → users)
  rating: INTEGER (1-5)
  title: VARCHAR(255)
  comment: TEXT
  status: VARCHAR(50) ('pending', 'approved', 'rejected')
  helpful_count: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

## Setup Instructions

### 1. Database Setup (Supabase)

Run the migration SQL script in Supabase SQL Editor:

```bash
# Go to Supabase Dashboard → SQL Editor
# Run: backend/migrations/001_create_reviews_table.sql
```

This creates:
- `reviews` table with all necessary columns
- Indexes for optimized queries
- Row Level Security (RLS) policies
- Constraints for data integrity

### 2. Backend Setup

The review routes are automatically integrated into the API:
- Review controller is registered in `src/controllers/reviewController.js`
- Review routes are mounted at `/api/reviews` in `src/index.js`
- Authentication middleware is applied to protected routes

### 3. Frontend Integration

All components and pages are created and already integrated:
- Routes added to `App.jsx`:
  - `/reviews` - Store reviews page
  - `/my-reviews` - User's personal reviews
- Header updated with review navigation links
- Product detail page includes reviews section
- Admin layout includes review management

## Usage Guide

### For Customers

#### Writing a Review
1. Navigate to a product page
2. Scroll to "Customer Reviews" section
3. Click "Write a Review" button
4. Select star rating (1-5 stars)
5. Enter review title (max 100 characters)
6. Write detailed review (max 1000 characters)
7. Click "Submit Review"
8. Review is submitted for moderation (pending approval)

#### Viewing Reviews
1. **Product Reviews**: Scroll to bottom of product page
2. **Store Reviews**: Click "Reviews" in main navigation
3. **Personal Reviews**: Click "My Reviews" in main navigation (authenticated users)

#### Deleting a Review
1. Go to "My Reviews" page
2. Find the review you want to delete
3. Click "Delete" button
4. Confirm deletion

### For Administrators

#### Accessing Review Management
1. Log in with admin account
2. Go to Admin Dashboard
3. Click "Reviews" in sidebar (⭐)

#### Moderating Reviews
1. **Filter Reviews**: Use status dropdown and search box
2. **Approve Review**: Click "Approve" button
   - Review becomes visible to customers
3. **Reject Review**: Click "Reject" button
   - Review remains hidden from customers
4. **Edit Review**: Click "Edit" button
   - Modify title, content, rating, or status
   - Click "Save" to apply changes
5. **Delete Review**: Click "Delete" button
   - Permanently removes review from database

#### Viewing Statistics
- Average store rating displayed at top of Reviews page
- Rating distribution chart shows breakdown by star rating
- Review count shows total number of reviews

## API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/store` | Get all approved store reviews |
| GET | `/api/reviews/product/:productId` | Get reviews for a product |

### Authenticated User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create a new review |
| GET | `/api/reviews/user/:userId` | Get user's reviews |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get all reviews (filterable) |
| PUT | `/api/reviews/:reviewId` | Update review |
| DELETE | `/api/reviews/:reviewId` | Delete review |

## Business Rules

1. **One Review Per Product Per User**: Users can only submit one review per product
2. **Moderation Required**: All reviews are pending until approved by admin
3. **Authentication Required**: Only logged-in users can submit reviews
4. **Rating Required**: All reviews must include a star rating (1-5)
5. **Content Required**: All reviews must have a title and comment
6. **RLS Policies**: 
   - Users can only see approved reviews and their own reviews
   - Admins can see all reviews
   - Only review authors can delete their own reviews

## Styling

- Uses Tailwind CSS for responsive design
- Dark mode support with `dark:` prefixes
- Mobile-optimized interface
- Consistent with existing app styling
- Star ratings use emoji (★) for visual appeal

## Error Handling

- Form validation with user feedback
- API error messages displayed to users
- Loading states for async operations
- Graceful handling of network errors
- Toast-like success messages

## Future Enhancements

Potential features to add:
- Review images/attachments
- Review helpfulness voting
- Admin review moderation notifications
- Review reply system
- Verified purchase badge
- Review sorting options (newest, helpful, highest rated)
- Review analytics dashboard
- Email notifications for new reviews

## Troubleshooting

### Reviews not appearing
- Check review status is "approved"
- Verify RLS policies are correctly configured
- Ensure product_id and user_id foreign keys are valid

### Can't submit review
- Confirm user is authenticated
- Check if user already reviewed the product
- Verify all required fields are filled
- Check browser console for API errors

### Review form not loading
- Ensure ReviewForm component is properly imported
- Check API endpoint is accessible
- Verify authentication token is valid

## Support

For issues or questions, please refer to:
- Backend error logs in server console
- Browser console for frontend errors
- Supabase dashboard for database issues
- Review the migration script for schema verification
