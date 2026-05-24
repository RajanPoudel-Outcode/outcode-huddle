/**
 * Slices Barrel Export
 */

export {
    authSlice,
    logout,
    setError as setAuthError,
    setLoading as setAuthLoading,
    setToken,
    setUser
} from "./authSlice";
export {
    addToCart,
    cartSlice,
    clearCart,
    removeFromCart,
    setCart,
    updateQuantity
} from "./cartSlice";
export {
    onboardingSlice, resetOnboarding, setCurrentPage, setHasViewedOnboarding
} from "./onboardingSlice";
export {
    addProduct,
    productsSlice,
    removeProduct,
    setFilters,
    setPage,
    setProducts,
    setError as setProductsError,
    setLoading as setProductsLoading,
    setSelectedProduct,
    updateProduct
} from "./productsSlice";

