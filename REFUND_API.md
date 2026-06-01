# Refund API Documentation

## Overview
The Refund API allows external websites and systems to submit refund requests to the Discus web app. It includes endpoints for submitting refunds, managing them through an admin dashboard, and tracking refund status.

## Authentication

### External Refund Submission
The `/refunds/submit` endpoint requires API key authentication. Provide the API key in one of these ways:

**Option 1: Header-based (Recommended)**
```
x-refund-api-key: YOUR_API_KEY_HERE
```

**Option 2: Query parameter**
```
/api/refunds/submit?api_key=YOUR_API_KEY_HERE
```

### Admin Operations
All other refund endpoints require JWT authentication via the standard `Authorization: Bearer <token>` header and admin privileges.

## Environment Configuration

Add the following to your `.env` file:
```env
EXTERNAL_REFUND_API_KEY=your_secret_api_key_here
```

**Important**: Keep this API key secure. Treat it like a password.

---

## Endpoints

### 1. Submit Refund (External)
**POST** `/api/refunds/submit`

Submit a refund request from an external system.

**Headers:**
```
x-refund-api-key: YOUR_API_KEY_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "external_order_id": "EXT-12345",          // Optional: ID from external system
  "customer_email": "customer@example.com",  // Required
  "full_name": "John Doe",                   // Optional: Customer's full name
  "phone": "555-123-4567",                   // Optional: Customer phone number
  "account_id": "ACC-12345",                 // Optional: Customer's account ID
  "refund_amount": 99.99,                    // Required: Amount to refund
  "refund_type": "full",                     // Optional: full, partial, etc.
  "refund_reason": "Product defective",      // Optional: Reason for refund
  "actions_taken": "Return shipped",         // Optional: Actions taken by customer
  "source": "amazon",                        // Required: Source identifier
  "external_reference_id": "AMZ-REF-789",    // Optional: Unique reference from source
  "card_holder_name": "John Doe",            // Optional: Cardholder name
  "card_number": "4532123456789012",        // Optional: Full card number
  "card_expiry": "12/25",                    // Optional: Card expiry (MM/YY)
  "card_cvv": "123",                         // Optional: Card CVV
  "billing_street": "123 Main St",           // Optional: Billing street address
  "billing_city": "Springfield",             // Optional: Billing city
  "billing_state": "IL",                     // Optional: Billing state
  "billing_zip": "62701",                    // Optional: Billing zip code
  "billing_country": "USA"                   // Optional: Billing country
}
```

**Response (201 Created):**
```json
{
  "message": "Refund submitted successfully",
  "refund": {
    "id": 1,
    "external_order_id": "EXT-12345",
    "customer_email": "customer@example.com",
    "full_name": "John Doe",
    "phone": "555-123-4567",
    "account_id": "ACC-12345",
    "refund_amount": 99.99,
    "refund_type": "full",
    "refund_reason": "Product defective",
    "actions_taken": "Return shipped",
    "status": "pending",
    "source": "amazon",
    "external_reference_id": "AMZ-REF-789",
    "card_holder_name": "John Doe",
    "card_number": "4532123456789012",
    "card_expiry": "12/25",
    "card_cvv": "123",
    "billing_street": "123 Main St",
    "billing_city": "Springfield",
    "billing_state": "IL",
    "billing_zip": "62701",
    "billing_country": "USA",
    "processed_by": "external",
    "created_at": "2026-06-01T10:30:00Z",
    "updated_at": "2026-06-01T10:30:00Z",
    "notes": "Submitted by external system: amazon"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Missing API key
- `403 Forbidden`: Invalid API key
- `404 Not Found`: Order not found (if order_id provided)
- `409 Conflict`: Duplicate refund (same external_reference_id)

---

### 2. Get All Refunds (Admin)
**GET** `/api/refunds`

Retrieve all refunds with optional filtering.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, completed)
- `source`: Filter by source (e.g., amazon, ebay)
- `customer_email`: Filter by customer email
- `order_id`: Filter by order ID

**Example:**
```
GET /api/refunds?status=pending&source=amazon
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "order_id": 123,
    "external_order_id": "EXT-12345",
    "customer_email": "customer@example.com",
    "refund_amount": 99.99,
    "refund_reason": "Product defective",
    "status": "pending",
    "source": "amazon",
    "external_reference_id": "AMZ-REF-789",
    "processed_by": "external",
    "created_at": "2026-06-01T10:30:00Z",
    "updated_at": "2026-06-01T10:30:00Z",
    "notes": "Submitted by external system: amazon"
  }
]
```

---

### 3. Get Refund by ID (Admin)
**GET** `/api/refunds/:id`

Retrieve details of a specific refund.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "order_id": 123,
  ...
}
```

---

### 4. Approve Refund (Admin)
**PUT** `/api/refunds/:id/approve`

Approve a pending refund.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "notes": "Approved - product replacement sent"
}
```

**Response (200 OK):**
```json
{
  "message": "Refund approved",
  "refund": {
    "id": 1,
    "status": "approved",
    "processed_by": "admin@example.com",
    "updated_at": "2026-06-01T11:00:00Z",
    ...
  }
}
```

---

### 5. Reject Refund (Admin)
**PUT** `/api/refunds/:id/reject`

Reject a refund request.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Refund period expired"
}
```

**Response (200 OK):**
```json
{
  "message": "Refund rejected",
  "refund": {
    "id": 1,
    "status": "rejected",
    "notes": "Refund period expired",
    ...
  }
}
```

---

### 6. Complete Refund (Admin)
**PUT** `/api/refunds/:id/complete`

Mark a refund as completed (money transferred back).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "transaction_id": "TXN-2026060101"
}
```

**Response (200 OK):**
```json
{
  "message": "Refund completed",
  "refund": {
    "id": 1,
    "status": "completed",
    "updated_at": "2026-06-01T12:00:00Z",
    ...
  }
}
```

---

### 7. Get Refund Statistics (Admin)
**GET** `/api/refunds/stats`

Retrieve refund statistics grouped by status and source.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "byStatus": [
    {
      "status": "pending",
      "total": 299.97
    },
    {
      "status": "approved",
      "total": 150.00
    },
    {
      "status": "completed",
      "total": 500.00
    }
  ],
  "bySource": [
    {
      "source": "amazon",
      "count": 3,
      "total": 400.00
    },
    {
      "source": "ebay",
      "count": 2,
      "total": 200.00
    }
  ]
}
```

---

## Refund Status Flow

```
pending → approved → completed
       ↓
      rejected
```

**Status Definitions:**
- **pending**: Refund request received, awaiting admin review
- **approved**: Admin approved the refund
- **rejected**: Admin rejected the refund
- **completed**: Refund has been processed and money transferred

---

## Usage Examples

### Example 1: Submit Refund from External System (JavaScript/Node.js)

```javascript
const submitRefund = async () => {
  const response = await fetch('https://your-api.com/api/refunds/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-refund-api-key': 'your_secret_api_key'
    },
    body: JSON.stringify({
      external_order_id: 'AMZ-12345',
      customer_email: 'customer@example.com',
      full_name: 'John Doe',
      phone: '555-123-4567',
      account_id: 'ACC-12345',
      refund_amount: 99.99,
      refund_type: 'full',
      refund_reason: 'Customer requested return',
      actions_taken: 'Return shipped via UPS',
      source: 'amazon',
      external_reference_id: 'AMZ-REF-789',
      card_holder_name: 'John Doe',
      card_number: '4532123456789012',
      card_expiry: '12/25',
      card_cvv: '123',
      billing_street: '123 Main St',
      billing_city: 'Springfield',
      billing_state: 'IL',
      billing_zip: '62701',
      billing_country: 'USA'
    })
  });

  const data = await response.json();
  console.log(data);
};
```

### Example 2: Get Pending Refunds (Admin)

```javascript
const getPendingRefunds = async (adminToken) => {
  const response = await fetch(
    'https://your-api.com/api/refunds?status=pending',
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const refunds = await response.json();
  console.log(refunds);
};
```

### Example 3: Approve Refund (Admin)

```javascript
const approveRefund = async (refundId, adminToken) => {
  const response = await fetch(
    `https://your-api.com/api/refunds/${refundId}/approve`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        notes: 'Approved - refund initiated'
      })
    }
  );

  const data = await response.json();
  console.log(data);
};
```

---

## Security Considerations

1. **API Key Protection**: Never expose the API key in client-side code or version control
2. **HTTPS Only**: Always use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
4. **Logging**: All refund submissions are logged with source information
5. **Validation**: External reference IDs are checked for uniqueness to prevent duplicate submissions
6. **Amount Validation**: Refund amounts cannot exceed the original order total

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing authentication
- `403`: Forbidden - Invalid credentials
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Duplicate refund
- `500`: Server Error - Internal error

---

## Database Schema

The refunds are stored in the `refunds` table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| external_order_id | VARCHAR(255) | Order ID from external system |
| source | VARCHAR(100) | Source system identifier |
| external_reference_id | VARCHAR(255) | Unique reference ID from source |
| customer_email | VARCHAR(255) | Customer email address |
| full_name | VARCHAR(255) | Customer's full name |
| phone | VARCHAR(20) | Customer phone number |
| account_id | VARCHAR(255) | Customer's account ID in source system |
| refund_amount | DECIMAL(10,2) | Refund amount |
| refund_type | VARCHAR(100) | Type of refund (full, partial, etc.) |
| refund_reason | VARCHAR(500) | Reason for refund |
| actions_taken | VARCHAR(500) | Actions taken by customer |
| card_holder_name | VARCHAR(255) | Cardholder name |
| card_number | VARCHAR(19) | Full card number |
| card_expiry | VARCHAR(5) | Card expiry date (MM/YY) |
| card_cvv | VARCHAR(4) | Card CVV |
| billing_street | VARCHAR(255) | Billing street address |
| billing_city | VARCHAR(100) | Billing city |
| billing_state | VARCHAR(100) | Billing state/province |
| billing_zip | VARCHAR(20) | Billing zip/postal code |
| billing_country | VARCHAR(100) | Billing country |
| status | VARCHAR(50) | Current status (pending, approved, rejected, completed) |
| processed_by | VARCHAR(255) | Admin who processed or 'external' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| notes | TEXT | Additional notes |

---

## Support

For issues or questions, contact the development team.
