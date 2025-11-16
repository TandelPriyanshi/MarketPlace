# Postman Testing Guide - Marketplace API

## Prerequisites

1. **Start the Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:3000` (or check your `.env` file)

2. **Ensure Database is Running**
   - MySQL should be running
   - Database should be created and migrations run

---

## Step-by-Step Testing Guide

### Step 1: Test Server Health

**Option A: Check API Documentation**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api-docs`
- **Expected Response (200):** Swagger UI page loads

**Option B: Test Auth Endpoint**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/auth/me`
- **Headers:**
  - `Authorization: Bearer ANY_TOKEN_HERE`
- **Expected Response (401):** 
```json
{
  "success": false,
  "message": "No token provided"
}
```
This confirms the server is running and routes are properly mounted.

---

### Step 2: Register a New User (Customer)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "customer1@test.com",
  "password": "password123",
  "name": "John Customer",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer1@test.com",
      "name": "John Customer",
      "phone": "+1234567890",
      "role": "customer",
      "isActive": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Save the token** from the response - you'll need it for authenticated requests!

---

### Step 3: Register a Seller

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "seller1@test.com",
  "password": "password123",
  "name": "Jane Seller",
  "phone": "+1234567891",
  "role": "seller"
}
```

**Expected Response (201):** Similar to Step 2, but with `role: "seller"`

**Save this token too!**

---

### Step 4: Login as Customer

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "customer1@test.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer1@test.com",
      "name": "John Customer",
      "role": "customer"
    },
    "token": "jwt-token-here"
  }
}
```

---

### Step 5: Get Current User Profile (Authenticated)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/auth/me`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - (Replace `YOUR_TOKEN_HERE` with the token from Step 2 or 4)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "customer1@test.com",
    "name": "John Customer",
    "role": "customer"
  }
}
```

---

### Step 6: Get All Products (Public - No Auth Required)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/products`
- **Headers:** None required
- **Query Parameters (Optional):**
  - `page=1`
  - `limit=10`
  - `status=published`
  - `search=laptop`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "totalPages": 0,
      "limit": 10
    }
  }
}
```

---

### Step 7: Get Product by ID (Public)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/products/{productId}`
- **Headers:** None required
- Replace `{productId}` with an actual product UUID

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Product Name",
    "price": 99.99,
    "stock": 50,
    "status": "published"
  }
}
```

---

### Step 8: Create Product (Seller Only)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/sellers/products`
- **Headers:**
  - `Authorization: Bearer SELLER_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "name": "Test Product",
  "description": "This is a test product",
  "price": 29.99,
  "stock": 100,
  "sku": "TEST-001",
  "images": ["https://example.com/image.jpg"],
  "status": "published"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Test Product",
    "price": 29.99,
    "stock": 100,
    "sellerId": "seller-uuid",
    "status": "published"
  },
  "message": "Product created successfully"
}
```

---

### Step 9: Get Seller Products

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/sellers/products`
- **Headers:**
  - `Authorization: Bearer SELLER_TOKEN_HERE`
- **Query Parameters (Optional):**
  - `page=1`
  - `limit=10`
  - `status=published`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

---

### Step 10: Place an Order (Customer)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/customers/orders`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "items": [
    {
      "productId": "product-uuid-1",
      "quantity": 2,
      "price": 29.99
    },
    {
      "productId": "product-uuid-2",
      "quantity": 1,
      "price": 49.99
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-1234567890-001",
    "totalAmount": 109.97,
    "status": "pending",
    "items": [...]
  },
  "message": "Order placed successfully"
}
```

---

### Step 11: Get Customer Orders

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/customers/orders`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
- **Query Parameters (Optional):**
  - `page=1`
  - `limit=10`
  - `status=pending`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {...}
  }
}
```

---

### Step 12: Get Seller Dashboard

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/sellers/dashboard`
- **Headers:**
  - `Authorization: Bearer SELLER_TOKEN_HERE`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProducts": 5,
      "totalOrders": 10,
      "totalRevenue": 1500.00
    },
    "recentOrders": [...]
  }
}
```

---

### Step 13: Update Order Status (Seller)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/v1/sellers/orders/{orderItemId}/status`
- **Headers:**
  - `Authorization: Bearer SELLER_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "status": "confirmed",
  "reason": "Order confirmed and ready for processing"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-item-uuid",
    "status": "confirmed",
    "order": {...}
  },
  "message": "Order status updated successfully"
}
```

---

### Step 14: Create Complaint (Customer)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/complaints`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `orderId`: (optional) order UUID
  - `type`: `order_issue` (options: order_issue, delivery_issue, product_quality, seller_behavior, payment_issue, other)
  - `title`: "Product not as described"
  - `description`: "The product I received is different from what was described"
  - `attachments`: (optional) file uploads

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "complaint-uuid",
    "type": "order_issue",
    "title": "Product not as described",
    "status": "open"
  },
  "message": "Complaint submitted successfully"
}
```

---

### Step 15: Get Customer Complaints

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/customers/complaints`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
- **Query Parameters (Optional):**
  - `page=1`
  - `limit=10`
  - `status=open` (options: open, in_progress, resolved, closed)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "complaint-uuid",
        "type": "order_issue",
        "title": "Product not as described",
        "status": "open",
        "created_at": "2025-11-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

---

### Step 16: Get Available Sellers (Customer)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/customers/sellers`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
- **Query Parameters (Optional):**
  - `city=Mumbai`
  - `area=Downtown`
  - `pincode=400001`

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "seller-uuid",
      "businessName": "Best Electronics Store",
      "user": {
        "name": "Seller One",
        "email": "seller1@example.com",
        "phone": "+1234567890"
      },
      "address": {
        "city": "Mumbai",
        "area": "Downtown",
        "pincode": "400001"
      },
      "rating": 4.5
    }
  ]
}
```

---

### Step 17: Get Order Details (Customer)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/customers/orders/{orderId}`
- **Headers:**
  - `Authorization: Bearer CUSTOMER_TOKEN_HERE`
- Replace `{orderId}` with an actual order UUID

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-123456",
    "status": "pending",
    "totalAmount": 1299.99,
    "items": [
      {
        "id": "order-item-uuid",
        "product": {
          "name": "Smartphone X",
          "price": 999.99
        },
        "quantity": 1,
        "status": "pending"
      }
    ],
    "created_at": "2025-11-15T10:00:00Z"
  }
}
```

---

### Step 18: Register Delivery Person

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "delivery1@test.com",
  "password": "password123",
  "name": "John Delivery",
  "phone": "+1234567893",
  "role": "delivery_person"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "delivery1@test.com",
      "name": "John Delivery",
      "role": "delivery_person"
    }
  },
  "message": "User registered successfully"
}
```

**Save the token** from the response!

---

### Step 19: Login as Delivery Person

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "delivery1@test.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "delivery1@test.com",
      "role": "delivery_person"
    }
  }
}
```

---

### Step 20: Get Assigned Orders (Delivery Person)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/delivery/orders`
- **Headers:**
  - `Authorization: Bearer DELIVERY_TOKEN_HERE`
- **Query Parameters (Optional):**
  - `status=pending` (options: pending, in_transit, delivered, cancelled)

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-123456",
      "status": "pending",
      "deliveryAddress": {
        "address": "123 Main St",
        "city": "Mumbai",
        "pincode": "400001"
      },
      "customer": {
        "name": "John Customer",
        "phone": "+1234567890"
      }
    }
  ]
}
```

---

### Step 21: Update Order Status (Delivery Person)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/v1/delivery/orders/{orderId}/status`
- **Headers:**
  - `Authorization: Bearer DELIVERY_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "status": "in_transit",
  "notes": "Package picked up, on the way"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "in_transit",
    "deliveryStatus": "in_transit"
  },
  "message": "Order status updated successfully"
}
```

---

### Step 22: Upload Delivery Proof

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/delivery/orders/{orderId}/proof`
- **Headers:**
  - `Authorization: Bearer DELIVERY_TOKEN_HERE`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `proofImage`: (file upload - delivery photo)
  - `signatureImage`: (file upload - customer signature)
  - `notes`: "Delivered successfully to customer"

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "delivery-proof-uuid",
    "orderId": "order-uuid",
    "proofImageUrl": "/uploads/delivery/proof-order-123.jpg",
    "signatureImageUrl": "/uploads/delivery/signature-order-123.jpg"
  },
  "message": "Delivery proof uploaded successfully"
}
```

---

### Step 23: Get Today's Delivery Route

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/delivery/route/today`
- **Headers:**
  - `Authorization: Bearer DELIVERY_TOKEN_HERE`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-15",
    "orders": [
      {
        "id": "order-uuid",
        "orderNumber": "ORD-123456",
        "sequence": 1,
        "deliveryAddress": {
          "address": "123 Main St",
          "city": "Mumbai",
          "pincode": "400001"
        },
        "estimatedTime": "10:30 AM",
        "status": "pending"
      }
    ],
    "totalOrders": 5,
    "completedOrders": 2
  }
}
```

---

### Step 24: Register Salesman

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "salesman1@test.com",
  "password": "password123",
  "name": "Mike Salesman",
  "phone": "+1234567894",
  "role": "salesman"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "salesman1@test.com",
      "name": "Mike Salesman",
      "role": "salesman"
    }
  },
  "message": "User registered successfully"
}
```

---

### Step 25: Login as Salesman

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "salesman1@test.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "salesman1@test.com",
      "role": "salesman"
    }
  }
}
```

---

### Step 26: Create Beat (Salesman)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/salesmen/beats`
- **Headers:**
  - `Authorization: Bearer SALESMAN_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "name": "Downtown Business District",
  "description": "Main commercial area with electronics and clothing stores",
  "area": "Downtown",
  "city": "Mumbai",
  "pincode": "400001"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "beat-uuid",
    "name": "Downtown Business District",
    "description": "Main commercial area with electronics and clothing stores",
    "area": "Downtown",
    "city": "Mumbai",
    "pincode": "400001",
    "salesmanId": "salesman-uuid"
  },
  "message": "Beat created successfully"
}
```

---

### Step 27: Get Beats (Salesman)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/salesmen/beats`
- **Headers:**
  - `Authorization: Bearer SALESMAN_TOKEN_HERE`

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "beat-uuid",
      "name": "Downtown Business District",
      "area": "Downtown",
      "city": "Mumbai",
      "pincode": "400001",
      "storeCount": 15,
      "lastVisit": "2025-11-14T15:30:00Z"
    }
  ]
}
```

---

### Step 28: Create Visit (Salesman)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/salesmen/visits`
- **Headers:**
  - `Authorization: Bearer SALESMAN_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "beatId": "beat-uuid",
  "storeId": "store-uuid",
  "scheduledDate": "2025-11-15",
  "scheduledTime": "14:00",
  "purpose": "Product demonstration and order collection"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "visit-uuid",
    "beatId": "beat-uuid",
    "storeId": "store-uuid",
    "scheduledDate": "2025-11-15",
    "scheduledTime": "14:00",
    "status": "scheduled",
    "purpose": "Product demonstration and order collection"
  },
  "message": "Visit created successfully"
}
```

---

### Step 29: Update Visit Status (Salesman)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/v1/salesmen/visits/{visitId}/status`
- **Headers:**
  - `Authorization: Bearer SALESMAN_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "status": "completed",
  "notes": "Successful product demo, order placed for 50 units",
  "nextVisitDate": "2025-11-22"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "visit-uuid",
    "status": "completed",
    "completedAt": "2025-11-15T14:30:00Z",
    "notes": "Successful product demo, order placed for 50 units"
  },
  "message": "Visit status updated successfully"
}
```

---

## Postman Collection Setup Tips

### 1. Create Environment Variables

In Postman, create an environment with these variables:
- `base_url`: `http://localhost:3000`
- `customer_token`: (will be set after customer login)
- `seller_token`: (will be set after seller login)
- `delivery_token`: (will be set after delivery person login)
- `salesman_token`: (will be set after salesman login)
- `product_id`: (will be set after creating product)
- `order_id`: (will be set after placing order)
- `beat_id`: (will be set after creating beat)
- `visit_id`: (will be set after creating visit)
- `complaint_id`: (will be set after creating complaint)

### 2. Use Variables in URLs

Instead of hardcoding URLs, use:
- `{{base_url}}/api/v1/auth/login`
- `{{base_url}}/api/v1/products/{{product_id}}`

### 3. Auto-Save Tokens

Create a test script in the Login request:
```javascript
// In Postman Tests tab
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("customer_token", jsonData.data.token);
    }
}
```

### 4. Set Authorization Header Automatically

In request Authorization tab:
- Type: Bearer Token
- Token: `{{customer_token}}` or `{{seller_token}}`

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```
**Solution:** Check if token is valid and included in Authorization header

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role: seller"
}
```
**Solution:** Use the correct user role token

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```
**Solution:** Check request body format and required fields

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```
**Solution:** Verify the resource ID exists

---

## Quick Test Checklist

- [ ] Server is running on port 3000
- [ ] Database is connected
- [ ] Register a customer user
- [ ] Register a seller user
- [ ] Login as customer
- [ ] Login as seller
- [ ] Get current user profile
- [ ] Get all products
- [ ] Create a product (as seller)
- [ ] Place an order (as customer)
- [ ] Get orders (as customer)
- [ ] Get seller dashboard
- [ ] Update order status (as seller)
- [ ] Create a complaint (as customer)

---

## Swagger Documentation

Once the server is running, you can access interactive API documentation at:
- **URL:** `http://localhost:3000/api-docs`

This provides a UI to test all endpoints directly!

---

## Troubleshooting

1. **Connection Refused**
   - Check if server is running: `npm run dev`
   - Verify port in `.env` file

2. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Run migrations: `npm run migrate` (if available)

3. **Token Expired**
   - Login again to get a new token
   - Tokens expire after 7 days (default)

4. **CORS Errors**
   - Server has CORS enabled, should work from Postman
   - If testing from browser, check CORS settings

---

# Complete API Routes Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Routes (`/api/v1/auth`)

### POST `/api/v1/auth/register`
Register a new user (any role)
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phone": "+1234567890",
  "role": "customer|seller|delivery_person|salesman"
}
```
- **Response**: 201 Created with user data and JWT token

### POST `/api/v1/auth/login`
Login user and get JWT token
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: 200 OK with user data and JWT token

### GET `/api/v1/auth/me`
Get current authenticated user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with user data

---

## User Management Routes (`/api/v1/users`)

### GET `/api/v1/users`
Get all users (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with array of users

### GET `/api/v1/users/:id`
Get user by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with user data

### PUT `/api/v1/users/:id`
Update user information
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```
- **Response**: 200 OK with updated user data

### PUT `/api/v1/users/:id/deactivate`
Deactivate user account (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK

### PUT `/api/v1/users/:id/activate`
Activate user account (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK

---

## Product Routes (`/api/v1/products`)

### GET `/api/v1/products`
Get all products (Public - No auth required)
- **Query Parameters** (optional):
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `category`: Filter by category
  - `search`: Search in product name/description
- **Response**: 200 OK with paginated products

### GET `/api/v1/products/:id`
Get product by ID (Public)
- **Response**: 200 OK with product details

---

## Seller Routes (`/api/v1/sellers`)

### GET `/api/v1/sellers/dashboard`
Get seller dashboard with statistics
- **Headers**: `Authorization: Bearer <token>` (Seller role required)
- **Response**: 200 OK with dashboard data

### GET `/api/v1/sellers/products`
Get seller's products
- **Headers**: `Authorization: Bearer <token>` (Seller role required)
- **Response**: 200 OK with seller's products

### POST `/api/v1/sellers/products`
Create new product (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "category": "electronics",
  "stock": 100,
  "images": ["image1.jpg", "image2.jpg"]
}
```
- **Response**: 201 Created with product data

### PUT `/api/v1/sellers/products/:id`
Update product (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Updated Product Name",
  "price": 149.99
}
```
- **Response**: 200 OK with updated product

### DELETE `/api/v1/sellers/products/:id`
Delete product (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK

### GET `/api/v1/sellers/orders`
Get seller's orders
- **Headers**: `Authorization: Bearer <token>` (Seller role required)
- **Response**: 200 OK with seller's orders

### PUT `/api/v1/sellers/orders/:id/status`
Update order status (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "confirmed|processing|ready_for_delivery|delivered|cancelled",
  "notes": "Optional notes"
}
```
- **Response**: 200 OK with updated order

---

## Order Routes (`/api/v1/orders`)

### GET `/api/v1/orders`
Get all orders (Admin) or user's orders (Customer)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters** (optional):
  - `status`: Filter by order status
  - `page`: Page number
  - `limit`: Items per page
- **Response**: 200 OK with orders

### GET `/api/v1/orders/:id`
Get order by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with order details

### PUT `/api/v1/orders/:id/cancel`
Cancel order (Customer only, if order is cancellable)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK

---

## Customer Routes (`/api/v1/customers`)

### GET `/api/v1/customers/sellers`
Get available sellers for customer
- **Headers**: `Authorization: Bearer <token>` (Customer role required)
- **Query Parameters** (optional):
  - `category`: Filter sellers by product category
  - `location`: Filter by location
- **Response**: 200 OK with sellers list

### POST `/api/v1/customers/orders`
Place new order (Customer only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "sellerId": "seller-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "phone": "+1234567890"
  }
}
```
- **Response**: 201 Created with order data

### GET `/api/v1/customers/orders/:id`
Get order details (Customer only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with order details

### POST `/api/v1/customers/complaints`
Create new complaint (Customer only)
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `orderId`: Order UUID
  - `description`: Complaint description
  - `attachments`: Files (max 5 files)
- **Response**: 201 Created with complaint data

### GET `/api/v1/customers/complaints`
Get customer's complaints
- **Headers**: `Authorization: Bearer <token>` (Customer role required)
- **Response**: 200 OK with complaints list

---

## Delivery Routes (`/api/v1/delivery`)

### GET `/api/v1/delivery/orders`
Get assigned orders for delivery person
- **Headers**: `Authorization: Bearer <token>` (Delivery person role required)
- **Response**: 200 OK with assigned orders

### PUT `/api/v1/delivery/orders/:id/status`
Update delivery order status (Delivery person only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "picked_up|in_transit|delivered|failed",
  "notes": "Optional delivery notes"
}
```
- **Response**: 200 OK with updated order

### POST `/api/v1/delivery/orders/:id/proof`
Upload delivery proof (Delivery person only)
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `type`: `signature|delivery_proof|return_proof`
  - `notes`: Optional notes
  - `file`: Proof file
- **Response**: 201 Created with proof data

### GET `/api/v1/delivery/route/today`
Get today's delivery route (Delivery person only)
- **Headers**: `Authorization: Bearer <token>` (Delivery person role required)
- **Response**: 200 OK with route information

---

## Salesman Routes (`/api/v1/salesmen`)

### POST `/api/v1/salesmen/beats`
Create new beat (Salesman only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Beat Name",
  "description": "Beat Description",
  "area": "Area covered",
  "sellers": ["seller-uuid-1", "seller-uuid-2"]
}
```
- **Response**: 201 Created with beat data

### GET `/api/v1/salesmen/beats`
Get salesman's beats
- **Headers**: `Authorization: Bearer <token>` (Salesman role required)
- **Response**: 200 OK with beats list

### GET `/api/v1/salesmen/beats/:id`
Get beat by ID (Salesman only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with beat details

### POST `/api/v1/salesmen/visits`
Create new visit (Salesman only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "beatId": "beat-uuid",
  "sellerId": "seller-uuid",
  "scheduledDate": "2024-01-01T10:00:00Z",
  "notes": "Visit notes"
}
```
- **Response**: 201 Created with visit data

### GET `/api/v1/salesmen/visits`
Get salesman's visits
- **Headers**: `Authorization: Bearer <token>` (Salesman role required)
- **Query Parameters** (optional):
  - `status`: Filter by visit status
  - `date`: Filter by date
- **Response**: 200 OK with visits list

### GET `/api/v1/salesmen/visits/:id`
Get visit by ID (Salesman only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with visit details

### PUT `/api/v1/salesmen/visits/:id/status`
Update visit status (Salesman only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "scheduled|completed|cancelled|rescheduled",
  "notes": "Updated notes",
  "actualVisitTime": "2024-01-01T10:30:00Z"
}
```
- **Response**: 200 OK with updated visit

---

## Complaint Routes (`/api/v1/complaints`)

### POST `/api/v1/complaints`
Create new complaint (General endpoint)
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `orderId`: Order UUID (optional)
  - `description`: Complaint description
  - `type`: Complaint type
  - `attachments`: Files (max 5 files)
- **Response**: 201 Created with complaint data

### GET `/api/v1/complaints`
Get complaints (Admin gets all, others get their own)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters** (optional):
  - `status`: Filter by complaint status
  - `type`: Filter by complaint type
- **Response**: 200 OK with complaints list

### GET `/api/v1/complaints/:id`
Get complaint by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK with complaint details

### PUT `/api/v1/complaints/:id/status`
Update complaint status (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "open|investigating|resolved|closed",
  "adminNotes": "Admin resolution notes"
}
```
- **Response**: 200 OK with updated complaint

---

## Common Response Formats

### Success Response (200/201)
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [
      // Validation errors or additional details
    ]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Rate Limiting
- Most endpoints have rate limiting applied
- Standard limit: 100 requests per 15 minutes per IP
- Auth routes: 5 requests per minute per IP

## File Uploads
- Max file size: 5MB per file
- Supported formats: JPG, PNG, PDF, DOC, DOCX
- Max files per request: 5 files

---

Happy Testing! 🚀

