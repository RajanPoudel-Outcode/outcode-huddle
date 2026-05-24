# Best Practices & Code Patterns

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Code Organization](#code-organization)
3. [Component Patterns](#component-patterns)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [Network Handling](#network-handling)
8. [Testing](#testing)
9. [Performance](#performance)
10. [Security](#security)

---

## Project Structure

```
src/
├── app/                        # Expo Router navigation
├── features/                   # Feature modules (auth, products, cart, orders, checkout)
│   ├── [feature]/
│   │   ├── screens/           # Feature-specific screens
│   │   ├── components/        # Feature-specific components
│   │   ├── services/          # Feature API services
│   │   ├── types/             # Feature TypeScript types
│   │   └── hooks/             # Feature-specific hooks
├── shared/
│   ├── components/            # Reusable UI components
│   ├── theme/                 # Design tokens (colors, spacing, typography)
│   ├── store/                 # Redux configuration and slices
│   ├── services/              # Core services (network, storage)
│   ├── utils/                 # Utilities (error handling, logging, validators)
│   ├── hooks/                 # Custom hooks (useAppDispatch, useNetworkStatus)
│   └── types/                 # Global types
└── constants/                 # App-wide constants

**Key Principle**: Keep feature folders self-contained while sharing common utilities in `shared/`.
```

---

## Code Organization

### Feature Module Structure

```typescript
// features/products/services/products.api.ts
import { networkService } from "@/services";

export const productsApi = {
  list: async (params?: ListParams) =>
    networkService.get("/products", params, { cache: true, cacheTTL: 3600000 }),

  getDetail: async (id: string) =>
    networkService.get(`/products/${id}`, {}, { cache: true }),

  search: async (query: string) =>
    networkService.get("/products/search", { q: query }),
};
```

### Service Layer Pattern

Services should:

- Have a single responsibility
- Be injectable (use getInstance or dependency injection)
- Have error handling built-in
- Log operations for debugging
- Support caching where appropriate

---

## Component Patterns

### Functional Components with Hooks

```typescript
import { View, StyleSheet } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface ProductListProps {
  category?: string;
}

export function ProductList({ category }: ProductListProps) {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector(
    state => state.products
  );

  useEffect(() => {
    if (category) {
      dispatch(setFilters({ category }));
    }
  }, [category, dispatch]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={item => item.id}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.bg.primary,
  },
});
```

### Props and Types

```typescript
// ✅ GOOD: Clear, type-safe props
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

// ❌ BAD: Too many optional props, unclear types
interface ButtonProps {
  title?: string;
  onPress?: any;
  disabled?: any;
  variant?: any;
}
```

---

## State Management

### Redux Pattern

#### 1. Define Slice

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, isAuthenticated: false, error: null },
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### 2. Use in Component

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setUser, logout } from '@/store/slices/authSlice';

export function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button
        title="Logout"
        onPress={() => dispatch(logout())}
      />
    </View>
  );
}
```

### Don'ts

- ❌ Don't put non-serializable data directly in Redux
- ❌ Don't mutate state directly (Redux Toolkit handles this)
- ❌ Don't have deeply nested selectors
- ❌ Don't dispatch actions from reducers

### Do's

- ✅ Keep Redux state normalized and flat
- ✅ Use selectors for derived state
- ✅ Create async thunks for async operations
- ✅ Use useAppSelector with proper memoization

---

## API Integration

### API Service Pattern

```typescript
// features/products/services/products.api.ts
import { networkService } from "@/services";
import type { Product } from "@/store/slices/productsSlice";

export const productsApi = {
  // GET with caching
  list: async (params?: { category?: string; skip?: number; limit?: number }) =>
    networkService.get<Product[]>("/api/products", params, {
      cache: true,
      cacheTTL: 3600000, // 1 hour
    }),

  // GET without caching
  getDetail: async (id: string) =>
    networkService.get<Product>(
      `/api/products/${id}`,
      {},
      {
        cache: false, // Disable cache for detailed views
      },
    ),

  // POST
  create: async (data: Partial<Product>) =>
    networkService.post<Product>("/api/products", data),

  // PUT
  update: async (id: string, data: Partial<Product>) =>
    networkService.put<Product>(`/api/products/${id}`, data),

  // DELETE
  delete: async (id: string) =>
    networkService.delete<void>(`/api/products/${id}`),
};
```

### Redux Thunk Pattern

```typescript
// store/slices/productsSlice.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsApi } from "@/features/products/services";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params?: { category?: string }, { rejectWithValue }) => {
    try {
      return await productsApi.list(params);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch products",
      );
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});
```

### Component Usage

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchProducts } from '@/store/slices/productsSlice';

export function ProductsScreen() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <ActivityIndicator />;
  if (error) return <ErrorMessage message={error} />;

  return <FlatList data={items} renderItem={renderProduct} />;
}
```

---

## Error Handling

### Global Error Handler

```typescript
import { ErrorHandler } from "@/utils";

try {
  await apiCall();
} catch (error) {
  // Get user-friendly message
  const userMessage = ErrorHandler.getUserMessage(error);

  // Show to user
  showSnackbar(userMessage, "error");

  // Log for debugging
  logger.error("API call failed", { error, context: "ProductList" });
}
```

### Validation Errors

```typescript
import { Validators, ValidationError } from "@/utils";

function validateEmail(email: string): void {
  if (!Validators.isValidEmail(email)) {
    throw new ValidationError("email", email, "Invalid email address");
  }
}

try {
  validateEmail(userInput);
} catch (error) {
  if (error instanceof ValidationError) {
    setFieldError(error.field, error.message);
  }
}
```

---

## Network Handling

### Automatic Retry and Offline Support

```typescript
import { networkService } from "@/services";

// Request automatically retries with exponential backoff
// If offline, request is queued and retried when online
const data = await networkService.get(
  "/api/products",
  {},
  {
    retryCount: 3, // Retry up to 3 times
    timeout: 10000, // 10 second timeout
  },
);
```

### Check Network Status

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function MyComponent() {
  const isOnline = useNetworkStatus();

  return (
    <View>
      {!isOnline && <Banner message="You are offline" />}
      {/* Rest of component */}
    </View>
  );
}
```

### Manage Offline Queue

```typescript
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export function SyncStatus() {
  const { queuedRequests, retryAll } = useOfflineQueue();

  if (queuedRequests.length === 0) return null;

  return (
    <View>
      <Text>{queuedRequests.length} requests pending</Text>
      <Button title="Sync Now" onPress={retryAll} />
    </View>
  );
}
```

---

## Testing

### Unit Test Pattern

```typescript
// __tests__/utils/validators.test.ts
import { Validators } from "@/utils";

describe("Validators", () => {
  it("should validate email correctly", () => {
    expect(Validators.isValidEmail("test@example.com")).toBe(true);
    expect(Validators.isValidEmail("invalid")).toBe(false);
  });

  it("should validate password strength", () => {
    const result = Validators.isValidPassword("Weak");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Redux Slice Test Pattern

```typescript
// __tests__/store/slices/cartSlice.test.ts
import { cartSlice, addToCart, removeFromCart } from '@/store/slices/cartSlice';

describe('cartSlice', () => {
  it('should add item to cart', () => {
    const item = { productId: '1', name: 'Product', price: 100, quantity: 1 };
    const state = cartSlice.reducer(undefined, addToCart(item));
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(100);
  });

  it('should remove item from cart', () => {
    // Setup initial state
    const state = { items: [...], total: 100 };
    const newState = cartSlice.reducer(state, removeFromCart('1'));
    expect(newState.items).toHaveLength(0);
  });
});
```

---

## Performance

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component to prevent unnecessary re-renders
export const ProductCard = memo(function ProductCard({ product }: Props) {
  return <View>{/* ... */}</View>;
});

// Memoize expensive calculations
const totalPrice = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// Memoize callbacks
const handlePress = useCallback(() => {
  dispatch(addToCart(product));
}, [dispatch, product]);
```

### Selector Optimization

```typescript
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// Create memoized selector to prevent re-renders
export const selectCartTotal = createSelector(
  (state: RootState) => state.cart.items,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

// Use in component
const total = useAppSelector(selectCartTotal);
```

### List Virtualization

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
/>
```

---

## Security

### API Security

```typescript
// 1. Use HTTPS only
networkService.setBaseURL("https://api.example.com");

// 2. Add authorization headers
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// 3. Validate SSL certificates
// Handled by networkService automatically
```

### Token Management

```typescript
// 1. Store securely (not in AsyncStorage)
// Use expo-secure-store or similar

// 2. Refresh before expiry
async function checkTokenExpiry() {
  const expiresAt = await storageService.getItem("tokenExpiresAt");
  if (Date.now() > expiresAt - 300000) {
    // 5 minutes before expiry
    await refreshToken();
  }
}

// 3. Clear on logout
dispatch(logout());
await storageService.removeItem("token");
```

### Input Validation

```typescript
// Always validate user input
function handleUserInput(input: string) {
  if (!Validators.isNotEmpty(input)) {
    return;
  }

  if (!Validators.hasMaxLength(input, 100)) {
    throw new ValidationError("input", input, "Input too long");
  }

  // Safe to use
  processInput(input);
}
```

---

## Environment Configuration

### Setting Up Environments

```typescript
// constants/env.ts
const ENV = {
  production: {
    API_URL: "https://api.example.com",
    LOG_LEVEL: "error",
  },
  staging: {
    API_URL: "https://staging-api.example.com",
    LOG_LEVEL: "warn",
  },
  development: {
    API_URL: "http://localhost:3000",
    LOG_LEVEL: "debug",
  },
};

export const getEnv = () => ENV[__DEV__ ? "development" : "production"];
```

---

## Folder Structure Checklist

- ✅ Features are self-contained with their own screens, components, services
- ✅ Shared utilities are in `shared/` folder
- ✅ Redux slices are co-located with related services
- ✅ Types are defined at feature level or in `shared/` if global
- ✅ Hooks are co-located with logic or in `shared/` if reusable
- ✅ Theme tokens are centralized in `shared/theme/`
- ✅ No circular dependencies between features
- ✅ App-level configuration in root files

---

## Code Quality Checklist

Before committing code:

- [ ] All TypeScript types are properly defined (no `any`)
- [ ] Error handling is implemented
- [ ] Loading and empty states are handled
- [ ] API responses are cached appropriately
- [ ] Redux actions are dispatched correctly
- [ ] No hardcoded strings (use constants)
- [ ] No hardcoded colors/spacing (use theme)
- [ ] Components are properly memoized
- [ ] Selectors are optimized with createSelector
- [ ] Tests are written for business logic
- [ ] ESLint warnings are fixed
- [ ] No console.logs left (use logger)
