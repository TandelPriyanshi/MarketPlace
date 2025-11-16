# API Integration Guide

This document explains how to use the integrated API client for the marketplace application.

## Overview

The API client is built with Axios and provides:
- Automatic JWT authentication
- Token refresh handling
- Global error handling
- Type-safe API calls
- File upload support

## Setup

1. Ensure your environment variables are set in `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

2. Import the API client in your components:
   ```typescript
   import { api, authApi } from '@/api';
   ```

## Authentication

### Login
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    
    // Store tokens
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Automatic Token Handling
The API client automatically:
- Attaches JWT tokens to requests
- Refreshes expired tokens
- Handles 401 errors by logging out

## API Usage

### GET Request
```typescript
const products = await api.get('/api/products');
```

### POST Request
```typescript
const newProduct = await api.post('/api/products', {
  name: 'Product Name',
  price: 99.99,
  category: 'electronics'
});
```

### PUT Request
```typescript
const updatedProduct = await api.put('/api/products/123', {
  name: 'Updated Name',
  price: 149.99
});
```

### DELETE Request
```typescript
await api.delete('/api/products/123');
```

### File Upload
```typescript
const formData = new FormData();
formData.append('image', file);
formData.append('productId', '123');

const result = await api.upload('/api/upload', formData);
```

### Query Parameters
```typescript
const users = await api.get('/api/users?page=1&limit=10');
```

## Error Handling

The API client handles errors automatically:
- **401 Unauthorized**: Attempts token refresh, then redirects to login
- **400/422**: Logs validation errors
- **403**: Logs permission errors
- **404**: Logs not found errors
- **500**: Logs server errors
- **Network errors**: Logs connection issues

You can also handle errors in your components:

```typescript
try {
  const data = await api.get('/api/data');
} catch (error) {
  // Handle specific errors
  if (error.response?.status === 404) {
    // Show not found message
  } else if (error.response?.status === 500) {
    // Show server error message
  }
}
```

## TypeScript Types

The API client provides built-in TypeScript types:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
```

## Available API Services

### Authentication (`authApi`)
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `refreshToken(refreshToken)` - Refresh access token
- `getProfile()` - Get user profile
- `updateProfile(userData)` - Update user profile
- `changePassword(passwords)` - Change password

### Generic API (`api`)
- `get(url, config?)` - GET request
- `post(url, data?, config?)` - POST request
- `put(url, data?, config?)` - PUT request
- `patch(url, data?, config?)` - PATCH request
- `delete(url, config?)` - DELETE request
- `upload(url, formData, config?)` - File upload
- `download(url, config?)` - File download

## Environment Variables

Create a `.env` file in the client root:

```env
VITE_API_URL=http://localhost:3000
```

## Testing

Run the API integration tests:

```typescript
import { runApiTests } from '@/api/test';

// Test API connection and auth endpoints
const testsPassed = await runApiTests();
```

## Common Patterns

### Fetching Data in React Component
```typescript
import { useEffect, useState } from 'react';
import { api } from '@/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/api/products');
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Render component...
};
```

### Submitting Form Data
```typescript
const handleSubmit = async (formData: any) => {
  try {
    const result = await api.post('/api/products', formData);
    // Handle success
    console.log('Product created:', result);
  } catch (error) {
    // Handle error
    console.error('Failed to create product:', error);
  }
};
```

## Security Notes

- Tokens are automatically managed by the API client
- Refresh tokens are used to maintain sessions
- All requests are automatically authenticated
- Sensitive data should be handled securely on the backend
- Never expose secrets in the frontend code
