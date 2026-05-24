# 🛍️ Ecommerce App - React Native Expo

A production-ready ecommerce mobile application built with React Native, Expo, Redux Toolkit, and a robust offline-first architecture.

## ✨ Features

- 🏪 **Product Catalog** - Browse products with filtering, sorting, and search
- 🛒 **Shopping Cart** - Add/remove items with quantity management
- 🔐 **Authentication** - Secure user login and registration
- 💳 **Checkout** - Complete order processing
- 📦 **Order Management** - Track orders and history
- 🌐 **Offline-First** - Full functionality without internet
- 🔄 **Smart Caching** - Automatic cache management with TTL
- 🔁 **Request Retry** - Exponential backoff retry logic
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- 🎨 **Beautiful UI** - Consistent design with global theme system
- ⚡ **Performance** - Optimized rendering with memoization

---

## 📋 Quick Start

### Prerequisites

```bash
# Node.js 16+ and npm/yarn
node --version  # v16.0.0 or higher
npm --version   # 8.0.0 or higher
```

### Installation

```bash
# 1. Navigate to project directory
cd ecommerce-app

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# Choose platform:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web browser
# - Or scan QR code with Expo Go app
```

### Available Commands

```bash
npm start              # Start development server (interactive menu)
npm run ios           # Launch iOS simulator
npm run android       # Launch Android emulator
npm run web           # Launch web browser
npm run lint          # Run ESLint
npm run test          # Run tests (when configured)
```

---

## 📁 Project Structure

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-project-architecture) for detailed structure.

### Quick Overview

```
src/
├── app/                    # Navigation and main screens
├── features/               # Feature modules (auth, products, cart, etc.)
├── shared/
│   ├── components/        # Reusable UI components
│   ├── theme/             # Global design tokens
│   ├── store/             # Redux configuration
│   ├── services/          # Network & storage services
│   ├── utils/             # Helpers & utilities
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
└── constants/             # App-wide constants
```

---

## 🎨 Theme System

Global design tokens for consistent UI:

### Colors

```typescript
import { Colors } from '@/constants/theme';

// Brand colors
Colors.primary      // #FF6B6B (Coral Red)
Colors.secondary    // #4ECDC4 (Teal)
Colors.success      // #26A65B (Green)
Colors.error        // #E74C3C (Red)
Colors.warning      // #F39C12 (Orange)

// Grayscale
Colors.gray[50]     // Lightest
Colors.gray[900]    // Darkest

// Usage
<View style={{ backgroundColor: Colors.primary }} />
```

### Typography

```typescript
import { TextStyles } from '@/constants/theme';

// Available styles
TextStyles.h1, TextStyles.h2, TextStyles.h3, TextStyles.h4
TextStyles.body, TextStyles.bodySmall
TextStyles.caption, TextStyles.captionSmall
TextStyles.button, TextStyles.link, TextStyles.label

// Usage
<Text style={TextStyles.h2}>Title</Text>
```

### Spacing

```typescript
import { Spacing } from "@/constants/theme";

Spacing.xs; // 4px
Spacing.sm; // 8px
Spacing.md; // 16px (default)
Spacing.lg; // 24px
Spacing.xl; // 32px
Spacing.xxl; // 40px
```

---

## 🗄️ State Management (Redux Toolkit)

### Using Redux

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToCart, removeFromCart } from '@/store/slices/cartSlice';

export function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);

  return (
    <View>
      <Button
        title="Add to Cart"
        onPress={() => dispatch(addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        }))}
      />
    </View>
  );
}
```

### Available Slices

1. **Auth** - User authentication and profile
2. **Products** - Product catalog with filtering
3. **Cart** - Shopping cart management

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-redux-toolkit-setup) for detailed Redux documentation.

---

## 🌐 Network & Offline

### Making API Calls

```typescript
import { networkService } from "@/services";

// GET with caching
const products = await networkService.get(
  "/api/products",
  {},
  {
    cache: true,
    cacheTTL: 3600000, // 1 hour
  },
);

// POST
const order = await networkService.post("/api/orders", orderData);

// Automatic features:
// ✅ Offline fallback (serves cache)
// ✅ Automatic retry with exponential backoff
// ✅ Request queuing when offline
// ✅ Sync when back online
```

### Check Network Status

```typescript
import { useNetworkStatus } from '@/hooks';

export function MyScreen() {
  const isOnline = useNetworkStatus();

  return (
    <View>
      {!isOnline && <Banner message="Currently offline" />}
      {/* Rest of screen */}
    </View>
  );
}
```

### Manage Offline Queue

```typescript
import { useOfflineQueue } from '@/hooks';

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

## ⚠️ Error Handling

### User-Friendly Messages

```typescript
import { ErrorHandler } from "@/utils";

try {
  await apiCall();
} catch (error) {
  const userMessage = ErrorHandler.getUserMessage(error);
  showSnackbar(userMessage);
}
```

### Validation

```typescript
import { Validators, ValidationError } from "@/utils";

try {
  if (!Validators.isValidEmail(email)) {
    throw new ValidationError("email", email, "Invalid email");
  }
  if (!Validators.isValidPassword(password).isValid) {
    throw new ValidationError("password", "", "Weak password");
  }
} catch (error) {
  if (error instanceof ValidationError) {
    setFieldError(error.field, error.message);
  }
}
```

---

## 🔒 Security

- ✅ HTTPS only communication
- ✅ Input validation on all fields
- ✅ Token-based authentication
- ✅ Secure token storage
- ✅ SSL certificate validation
- ✅ Type-safe Redux state

---

## ⚡ Performance

- ✅ Memoized components with `React.memo`
- ✅ Optimized Redux selectors with `createSelector`
- ✅ List virtualization with `FlatList`
- ✅ API response caching with TTL
- ✅ Lazy loading of images
- ✅ Code splitting via Expo Router

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Comprehensive setup and architecture guide
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Code patterns and best practices
- **[Expo Docs](https://docs.expo.dev)** - Official Expo documentation
- **[Redux Toolkit Docs](https://redux-toolkit.js.org)** - Redux Toolkit reference
- **[React Native Docs](https://reactnative.dev)** - React Native API reference

---

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test Structure

```
__tests__/
├── store/
│   └── slices/
│       ├── authSlice.test.ts
│       ├── productsSlice.test.ts
│       └── cartSlice.test.ts
├── utils/
│   ├── error-handler.test.ts
│   └── validators.test.ts
└── services/
    ├── network.test.ts
    └── storage.test.ts
```

---

## 🚀 Deployment

### Build for iOS

```bash
npm run build:ios
```

### Build for Android

```bash
npm run build:android
```

### Build for Web

```bash
npm run build:web
```

See [Expo Build Documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

---

## 🐛 Troubleshooting

### Dev server won't start

```bash
# Clear cache and rebuild
npm run reset-project

# Clear Metro bundler cache
watchman watch-del-all
```

### Module not found error

```bash
# Check imports use correct aliases
# ✅ import { Colors } from '@/constants/theme'
# ❌ import { Colors } from '../../../shared/theme'
```

### Type errors

```bash
# Ensure tsconfig.json has proper settings
# Run type checking
npx tsc --noEmit
```

---

## 📞 Support

- **Expo Community**: [Discord](https://chat.expo.dev)
- **React Native**: [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- **Redux**: [Redux Discord](https://discord.gg/redux)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Next Steps

1. ✅ Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed architecture
2. ✅ Read [BEST_PRACTICES.md](./BEST_PRACTICES.md) for code patterns
3. ✅ Set up your API base URL in `constants/env.ts`
4. ✅ Create feature screens following the feature module pattern
5. ✅ Implement Redux async thunks for API calls
6. ✅ Add your app's business logic

Happy coding! 🚀
