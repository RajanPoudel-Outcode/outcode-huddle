# Ecommerce App - Complete Setup Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (choose platform)
npm start              # Interactive menu
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser

# Run linter
npm run lint
```

---

## 📁 Project Architecture

```
src/
├── app/                      # Expo Router (file-based routing)
├── features/                 # Feature modules
│   ├── auth/                 # Authentication
│   ├── products/             # Product catalog
│   ├── cart/                 # Shopping cart
│   ├── orders/               # Order management
│   └── checkout/             # Checkout flow
├── shared/
│   ├── theme/                # Global design tokens
│   ├── components/           # Reusable UI components
│   ├── services/             # Business logic services
│   │   ├── network.service.ts
│   │   ├── storage.service.ts
│   │   └── offline.service.ts
│   ├── store/                # Redux Toolkit configuration
│   │   ├── store.ts
│   │   └── slices/
│   ├── utils/
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── hooks/
│       ├── useAppDispatch.ts
│       ├── useAppSelector.ts
│       ├── useNetworkStatus.ts
│       └── useOfflineQueue.ts
├── constants/                # App constants
└── types/                    # Global TypeScript types
```

---

## 🎨 Global Theme System

### Theme Structure

The theme system provides centralized design tokens for consistent UI across the app.

**Location:** `src/shared/theme/`

### Colors

```typescript
// Primary: #FF6B6B (Coral Red) - Call-to-action buttons, active states
// Secondary: #4ECDC4 (Teal) - Secondary actions, highlights
// Success: #26A65B (Green) - Confirmations, success states
// Error: #E74C3C (Red) - Error messages, destructive actions
// Warning: #F39C12 (Orange) - Warnings, alerts
// Info: #3498DB (Blue) - Informational content
```

### Typography

```typescript
// H1: 32px bold (titles)
// H2: 24px semibold (section headers)
// H3: 18px semibold (subsections)
// H4: 16px semibold (card titles)
// Body: 14px regular (main text)
// Caption: 12px regular (supplementary text)
// Button: 14px semibold (button labels)
```

### Spacing Scale

```
xs: 4px   | Tight spacing
sm: 8px   | Small gaps
md: 16px  | Standard gap
lg: 24px  | Large gaps
xl: 32px  | Extra large gaps
```

**Usage:**

```typescript
import { Colors, Spacing, TextStyles } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.primary,
  },
  title: TextStyles.h2,
});
```

---

## 🔗 Network Handling

### Architecture

**Smart Network Service** (`src/shared/services/network.service.ts`):

- Detects online/offline status
- Automatically queues failed requests
- Retries with exponential backoff
- Validates requests before sending
- Centralized error handling

### Usage

```typescript
import { NetworkService } from "@/services";

// Make request
const response = await NetworkService.get("/api/products");

// Request will auto-retry if failed
// Failed requests are queued for later
```

### Features

- ✅ Automatic retry with exponential backoff
- ✅ Request queuing (offline mode)
- ✅ Network status detection
- ✅ Request/response interceptors
- ✅ Timeout handling
- ✅ Request cancellation

---

## ⚠️ Exception Handling

### Error Handler

**Location:** `src/shared/utils/error-handler.ts`

Centralized error handling with user-friendly messages:

```typescript
import { ErrorHandler } from "@/utils";

try {
  await apiCall();
} catch (error) {
  const userMessage = ErrorHandler.getUserMessage(error);
  const logMessage = ErrorHandler.getLogMessage(error);

  console.error(logMessage);
  showSnackbar(userMessage);
}
```

### Error Types

1. **Network Errors** - No internet, timeout, connection refused
2. **API Errors** - 4xx, 5xx responses with backend messages
3. **Validation Errors** - Input validation failures
4. **Storage Errors** - AsyncStorage failures
5. **Runtime Errors** - App crashes, unexpected exceptions

### User-Friendly Messages

Errors are automatically converted to user-friendly messages:

- Network errors → "Check your internet connection"
- 404 → "Item not found"
- 500 → "Something went wrong, please try again"
- Validation → Specific field error messages

---

## 💾 Offline-First Strategy

### Architecture

1. **Local Storage** (AsyncStorage)
   - Cache all successful API responses
   - Store user preferences
   - Persist Redux state

2. **Request Queue**
   - Queue failed requests during offline
   - Retry when online
   - Preserve request order

3. **Sync Strategy**
   - Sync on app launch
   - Sync when online
   - Background sync (every 30s)

### Implementation

```typescript
import { OfflineService } from "@/services";

// Automatically handled - just use network service
const products = await NetworkService.get("/api/products");

// If offline: returns cached data
// If online: fetches fresh data, caches it
// If failed: queued for retry
```

### Storage Structure

```typescript
{
  cache: {
    'https://api.example.com/products': {
      data: [...],
      timestamp: 1234567890,
      ttl: 3600000  // 1 hour
    }
  },
  queue: {
    'req-1': {
      method: 'POST',
      url: '/api/orders',
      data: {...},
      retries: 2
    }
  }
}
```

---

## 🗄️ Redux Toolkit Setup

### Store Configuration

**Location:** `src/shared/store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setToken"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Redux Slices

#### 1. Auth Slice

```typescript
// Features: login, logout, token storage, user info
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export default authSlice.reducer;
```

#### 2. Products Slice

```typescript
// Features: product catalog, filtering, sorting, search
const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {},
    searchQuery: "",
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});
```

#### 3. Cart Slice

```typescript
// Features: add/remove items, quantity updates, cart total
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      // Add or increment item
    },
    removeFromCart: (state, action) => {
      // Remove item from cart
    },
    updateQuantity: (state, action) => {
      // Update item quantity
    },
  },
});
```

### Pre-Typed Hooks

**Location:** `src/shared/hooks/`

```typescript
// useAppDispatch.ts
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

// useAppSelector.ts
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export const useAppSelector = useSelector.withTypes<RootState>();
```

### Usage in Components

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setProducts } from '@/store/slices/productsSlice';

export function ProductList() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.items);

  useEffect(() => {
    dispatch(setProducts(data));
  }, []);

  return <FlatList data={products} />;
}
```

---

## 🛟 Custom Hooks

### useNetworkStatus

```typescript
import { useNetworkStatus } from '@/hooks/useRedux';

export function MyComponent() {
  const isOnline = useNetworkStatus();

  return (
    <View>
      {!isOnline && <Text>Offline Mode</Text>}
    </View>
  );
}
```

### useOfflineQueue

```typescript
import { useOfflineQueue } from '@/hooks/useRedux';

export function SyncStatus() {
  const { queuedRequests, retryAll } = useOfflineQueue();

  return (
    <Button
      title={`Sync (${queuedRequests.length} pending)`}
      onPress={retryAll}
    />
  );
}
```

---

## 📱 API Integration Pattern

### 1. Create API Service

```typescript
// src/features/products/services/products.api.ts
import { NetworkService } from "@/services";

export const productsApi = {
  list: async (params?: { category?: string; search?: string }) =>
    NetworkService.get("/api/products", params),

  getDetail: async (id: string) => NetworkService.get(`/api/products/${id}`),

  search: async (query: string) =>
    NetworkService.get("/api/products/search", { q: query }),
};
```

### 2. Create Redux Thunk

```typescript
// src/shared/store/slices/productsSlice.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsApi } from "@/features/products/services";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: { category?: string } = {}) => {
    return await productsApi.list(params);
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});
```

### 3. Use in Component

```typescript
// src/features/products/screens/ProductList.tsx
import { fetchProducts } from '@/store/slices/productsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

export function ProductListScreen() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return <FlatList data={items} renderItem={renderProduct} />;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

- Redux slices
- Error handlers
- Validators
- Utility functions

### Integration Tests

- API service + Redux
- Offline queue + sync
- Network status handling

### E2E Tests

- User authentication flow
- Product browsing
- Cart management
- Checkout process

---

## 🔒 Security Best Practices

1. **Token Storage**
   - Store in secure storage, not AsyncStorage
   - Add expiration checks
   - Refresh token before expiry

2. **API Communication**
   - Use HTTPS only
   - Validate SSL certificates
   - Encrypt sensitive data

3. **Data Validation**
   - Validate all inputs
   - Sanitize API responses
   - Type-check with TypeScript

4. **Error Messages**
   - Don't expose sensitive info
   - Log detailed errors server-side
   - Show user-friendly messages

---

## 📊 Performance Tips

1. **Network**
   - Implement request caching
   - Use pagination for large lists
   - Compress API responses

2. **Storage**
   - Cache frequently accessed data
   - Implement TTL for cache invalidation
   - Clean up old data regularly

3. **UI Rendering**
   - Use React.memo for list items
   - Virtualize long lists
   - Optimize images

4. **Redux**
   - Use selectors to prevent unnecessary re-renders
   - Normalize state shape
   - Split large slices

---

## 🐛 Debugging

### Redux DevTools

```bash
npm install --save-dev redux-devtools-extension
```

### Network Inspection

Use Expo's network tab in dev tools to inspect all API calls.

### Logging

```typescript
import { Logger } from "@/utils";

Logger.info("User logged in", { userId: user.id });
Logger.error("API request failed", { error, url });
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)
- [React Navigation](https://reactnavigation.org)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

---

## 🤝 Contributing

1. Follow the project structure
2. Use established patterns
3. Test your changes
4. Update documentation

---

## 📝 License

MIT
