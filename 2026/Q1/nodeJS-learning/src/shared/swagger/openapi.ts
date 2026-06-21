/**
 * OpenAPI 3.0 specification for the e-commerce API.
 * Served as JSON at /api/docs.json and rendered by Swagger UI at /api/docs.
 */

const bearer = [{ bearerAuth: [] as string[] }];

// ---- Reusable response wrappers -------------------------------------------
const success = (dataSchema: object, withPagination = false) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    data: dataSchema,
    ...(withPagination ? { pagination: { $ref: "#/components/schemas/Pagination" } } : {}),
    meta: { $ref: "#/components/schemas/Meta" },
  },
});

const jsonResponse = (description: string, dataSchema: object, withPagination = false) => ({
  description,
  content: { "application/json": { schema: success(dataSchema, withPagination) } },
});

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: "array", items: ref(name) });

const errorResponses = {
  "400": { description: "Validation error", content: { "application/json": { schema: ref("ErrorResponse") } } },
  "401": { description: "Unauthorized", content: { "application/json": { schema: ref("ErrorResponse") } } },
  "403": { description: "Forbidden (admin only)", content: { "application/json": { schema: ref("ErrorResponse") } } },
  "404": { description: "Not found", content: { "application/json": { schema: ref("ErrorResponse") } } },
};

const pageParams = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
  { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
];

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "E-commerce API",
    version: "2.0.0",
    description:
      "Feature-based e-commerce API (auth, products, categories, wishlist, orders, admin). " +
      "All responses use a common envelope `{ success, message, data, meta }`; list endpoints add `pagination`.",
  },
  servers: [
    { url: "http://localhost:3000/api", description: "Local" },
    { url: "http://192.168.1.3:3000/api", description: "LAN" },
  ],
  tags: [
    { name: "Auth" },
    { name: "Products" },
    { name: "Categories" },
    { name: "Wishlist" },
    { name: "Orders" },
    { name: "Admin" },
    { name: "System" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Meta: {
        type: "object",
        properties: {
          copyright: { type: "string" },
          site: { type: "string" },
          emails: { type: "array", items: { type: "string" } },
          api: { type: "object", properties: { version: { type: "integer" } } },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          currentPage: { type: "integer" },
          totalPages: { type: "integer" },
          totalItems: { type: "integer" },
          limit: { type: "integer" },
          hasNext: { type: "boolean" },
          hasPrev: { type: "boolean" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "boolean", example: true },
          message: { type: "string", example: "Invalid email or password" },
          status_code: { type: "integer", example: 401 },
          path: { type: "string" },
          method: { type: "string" },
          meta: { $ref: "#/components/schemas/Meta" },
        },
      },
      ProductColor: {
        type: "object",
        properties: { name: { type: "string", example: "Black Titanium" }, hex: { type: "string", example: "#1C1C1E" } },
      },
      ProductSpecification: {
        type: "object",
        properties: { label: { type: "string", example: "4K Ultra HD XDR Display" }, icon: { type: "string", example: "display" } },
      },
      ProductReview: {
        type: "object",
        properties: {
          name: { type: "string" },
          rating: { type: "number" },
          comment: { type: "string" },
          user: { type: "string" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "iPhone 16 Pro Max" },
          description: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          price: { type: "number", example: 1399.99 },
          originalPrice: { type: "number", example: 1499.99 },
          category: { type: "string", example: "Mobile" },
          brand: { type: "string", example: "Apple" },
          rating: { type: "number", example: 4.9 },
          numReviews: { type: "integer", example: 2200 },
          countInStock: { type: "integer" },
          quantity: { type: "integer" },
          colors: arrayOf("ProductColor"),
          storageOptions: { type: "array", items: { type: "string" }, example: ["256GB", "512GB", "1TB"] },
          specifications: arrayOf("ProductSpecification"),
          isFeatured: { type: "boolean" },
          review: arrayOf("ProductReview"),
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Mobile" },
          slug: { type: "string", example: "mobile" },
          image: { type: "string" },
          order: { type: "integer" },
        },
      },
      Token: {
        type: "object",
        properties: { access_token: { type: "string" }, refresh_token: { type: "string" } },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          type: { type: "string", enum: ["User", "Admin"] },
          image: { type: "string" },
          token: { $ref: "#/components/schemas/Token" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          product: { type: "string" },
          quantity: { type: "integer" },
          price: { type: "number" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          user: { type: "string" },
          orderItems: arrayOf("OrderItem"),
          shippingAddress: { type: "string" },
          paymentMethod: { type: "string" },
          totalTax: { type: "number" },
          totalPrice: { type: "number" },
          shippingPrice: { type: "number" },
          status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
    parameters: {},
  },
  paths: {
    // ---------------------------------------------------------------- Auth
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user (multipart, optional avatar)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Rajan Paudel" },
                  email: { type: "string", example: "rajan@example.com" },
                  password: { type: "string", example: "Admin@123" },
                  address: { type: "string" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { "201": jsonResponse("User registered", ref("AuthUser")), ...errorResponses },
      },
    },
    "/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string", example: "user@shop.com" }, password: { type: "string", example: "User@1234" } },
              },
            },
          },
        },
        responses: { "200": jsonResponse("Signed in", ref("AuthUser")), ...errorResponses },
      },
    },
    "/auth/verify-token": {
      post: { tags: ["Auth"], summary: "Verify access token", security: bearer, responses: { "200": jsonResponse("Token valid", { type: "object" }), ...errorResponses } },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["refresh_token"], properties: { refresh_token: { type: "string" } } } } },
        },
        responses: { "200": jsonResponse("Token refreshed", ref("AuthUser")), ...errorResponses },
      },
    },
    "/auth/profile": {
      get: { tags: ["Auth"], summary: "Get current user profile", security: bearer, responses: { "200": jsonResponse("Profile", { type: "object", properties: { user: ref("AuthUser") } }), ...errorResponses } },
      put: {
        tags: ["Auth"],
        summary: "Update profile (multipart)",
        security: bearer,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, address: { type: "string" }, image: { type: "string", format: "binary" } } },
            },
          },
        },
        responses: { "200": jsonResponse("Profile updated", { type: "object", properties: { user: ref("AuthUser") } }), ...errorResponses },
      },
    },
    "/auth/logout": { post: { tags: ["Auth"], summary: "Logout (clears server tokens)", security: bearer, responses: { "200": jsonResponse("Logged out", { type: "object", nullable: true }), ...errorResponses } } },
    "/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change password",
        security: bearer,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["currentPassword", "newPassword"], properties: { currentPassword: { type: "string" }, newPassword: { type: "string", example: "NewPass@123" } } } } },
        },
        responses: { "200": jsonResponse("Password changed", { type: "object", nullable: true }), ...errorResponses },
      },
    },

    // ------------------------------------------------------------ Products
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products (paginated, filterable)",
        security: bearer,
        parameters: [
          ...pageParams,
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "price", "rating", "createdAt"] } },
        ],
        responses: { "200": jsonResponse("Products", arrayOf("Product"), true), ...errorResponses },
      },
      post: {
        tags: ["Products"],
        summary: "Create product (admin, multipart, up to 5 images)",
        security: bearer,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "description", "price", "category", "quantity"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  originalPrice: { type: "number" },
                  category: { type: "string" },
                  brand: { type: "string" },
                  quantity: { type: "integer" },
                  countInStock: { type: "integer" },
                  numReviews: { type: "integer" },
                  isFeatured: { type: "boolean" },
                  colors: { type: "string", description: 'JSON string, e.g. [{"name":"Black","hex":"#000"}]' },
                  storageOptions: { type: "string", description: 'JSON string, e.g. ["256GB","512GB"]' },
                  specifications: { type: "string", description: 'JSON string, e.g. [{"label":"OLED","icon":"display"}]' },
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: { "201": jsonResponse("Created", { type: "object", properties: { product: ref("Product") } }), ...errorResponses },
      },
    },
    "/products/featured": { get: { tags: ["Products"], summary: "Featured (isFeatured) products", responses: { "200": jsonResponse("Featured", { type: "object", properties: { products: arrayOf("Product"), pagination: ref("Pagination") } }) } } },
    "/products/search/{search}": {
      get: { tags: ["Products"], summary: "Search products", parameters: [{ name: "search", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Results", arrayOf("Product"), true) } },
    },
    "/products/category/{category}": {
      get: { tags: ["Products"], summary: "Products by category", parameters: [{ name: "category", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Products", arrayOf("Product"), true) } },
    },
    "/products/{id}": {
      get: { tags: ["Products"], summary: "Get product by id", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Product", ref("Product")), ...errorResponses } },
      put: {
        tags: ["Products"],
        summary: "Update product (admin, multipart)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, price: { type: "number" }, originalPrice: { type: "number" }, category: { type: "string" }, brand: { type: "string" }, quantity: { type: "integer" }, countInStock: { type: "integer" }, isFeatured: { type: "boolean" }, colors: { type: "string" }, storageOptions: { type: "string" }, specifications: { type: "string" }, images: { type: "array", items: { type: "string", format: "binary" } } } } } } },
        responses: { "200": jsonResponse("Updated", { type: "object", properties: { product: ref("Product") } }), ...errorResponses },
      },
      delete: { tags: ["Products"], summary: "Delete product (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Deleted", { type: "object", nullable: true }), ...errorResponses } },
    },
    "/products/{id}/reviews": {
      get: { tags: ["Products"], summary: "Get product reviews", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Reviews", { type: "object", properties: { reviews: arrayOf("ProductReview") } }) } },
      post: {
        tags: ["Products"],
        summary: "Add review (admin)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["rating", "comment"], properties: { rating: { type: "integer", minimum: 1, maximum: 5 }, comment: { type: "string" } } } } } },
        responses: { "201": jsonResponse("Review added", { type: "object", properties: { product: ref("Product") } }), ...errorResponses },
      },
    },
    "/products/{id}/availability": {
      get: { tags: ["Products"], summary: "Check availability", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "quantity", in: "query", schema: { type: "integer", default: 1 } }], responses: { "200": jsonResponse("Availability", { type: "object", properties: { productId: { type: "string" }, quantity: { type: "integer" }, isAvailable: { type: "boolean" } } }) } },
    },

    // ---------------------------------------------------------- Categories
    "/categories": {
      get: { tags: ["Categories"], summary: "List categories", responses: { "200": jsonResponse("Categories", arrayOf("Category")) } },
      post: {
        tags: ["Categories"],
        summary: "Create category (admin, multipart image)",
        security: bearer,
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, slug: { type: "string" }, order: { type: "integer" }, image: { type: "string", format: "binary" } } } } } },
        responses: { "201": jsonResponse("Created", ref("Category")), ...errorResponses },
      },
    },

    // ------------------------------------------------------------ Wishlist
    "/wishlist": {
      get: { tags: ["Wishlist"], summary: "Get current user's wishlist", security: bearer, responses: { "200": jsonResponse("Wishlist", arrayOf("Product")), ...errorResponses } },
      post: {
        tags: ["Wishlist"],
        summary: "Add product to wishlist",
        security: bearer,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["productId"], properties: { productId: { type: "string" } } } } } },
        responses: { "200": jsonResponse("Updated wishlist", arrayOf("Product")), ...errorResponses },
      },
    },
    "/wishlist/{productId}": {
      delete: { tags: ["Wishlist"], summary: "Remove product from wishlist", security: bearer, parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Updated wishlist", arrayOf("Product")), ...errorResponses } },
    },

    // -------------------------------------------------------------- Orders
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create order",
        security: bearer,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["orderItems", "shippingAddress", "paymentMethod", "totalTax", "totalPrice", "shippingPrice"], properties: { orderItems: arrayOf("OrderItem"), shippingAddress: { type: "string" }, paymentMethod: { type: "string" }, totalTax: { type: "number" }, totalPrice: { type: "number" }, shippingPrice: { type: "number" } } } } },
        },
        responses: { "201": jsonResponse("Order created", ref("Order")), ...errorResponses },
      },
      get: { tags: ["Orders"], summary: "List orders (paginated)", security: bearer, parameters: [...pageParams, { name: "status", in: "query", schema: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] } }], responses: { "200": jsonResponse("Orders", { type: "object", properties: { orders: arrayOf("Order"), pagination: ref("Pagination") } }), ...errorResponses } },
    },
    "/orders/user/my-orders": { get: { tags: ["Orders"], summary: "Current user's orders", security: bearer, responses: { "200": jsonResponse("Orders", arrayOf("Order")), ...errorResponses } } },
    "/orders/{id}": {
      get: { tags: ["Orders"], summary: "Get order by id", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Order", ref("Order")), ...errorResponses } },
      put: {
        tags: ["Orders"],
        summary: "Update order",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] }, shippingAddress: { type: "string" }, paymentMethod: { type: "string" } } } } } },
        responses: { "200": jsonResponse("Order updated", ref("Order")), ...errorResponses },
      },
    },
    "/orders/{id}/cancel": { patch: { tags: ["Orders"], summary: "Cancel order", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Order cancelled", ref("Order")), ...errorResponses } } },
    "/orders/admin/stats": { get: { tags: ["Orders"], summary: "Order statistics (admin)", security: bearer, responses: { "200": jsonResponse("Stats", { type: "object" }), ...errorResponses } } },

    // --------------------------------------------------------------- Admin
    "/admin/dashboard": { get: { tags: ["Admin"], summary: "Dashboard stats", security: bearer, parameters: [{ name: "days", in: "query", schema: { type: "integer", default: 30 } }], responses: { "200": jsonResponse("Dashboard", { type: "object" }), ...errorResponses } } },
    "/admin/analytics": { get: { tags: ["Admin"], summary: "System analytics", security: bearer, parameters: [{ name: "startDate", in: "query", required: true, schema: { type: "string", format: "date" } }, { name: "endDate", in: "query", required: true, schema: { type: "string", format: "date" } }, { name: "granularity", in: "query", schema: { type: "string", enum: ["day", "week", "month"] } }], responses: { "200": jsonResponse("Analytics", { type: "object" }), ...errorResponses } } },
    "/admin/system-info": { get: { tags: ["Admin"], summary: "System info", security: bearer, responses: { "200": jsonResponse("System info", { type: "object" }), ...errorResponses } } },
    "/admin/health": { get: { tags: ["Admin"], summary: "Admin health check", security: bearer, responses: { "200": jsonResponse("Health", { type: "object" }), ...errorResponses } } },
    "/admin/users": { get: { tags: ["Admin"], summary: "List users (paginated)", security: bearer, parameters: [...pageParams, { name: "search", in: "query", schema: { type: "string" } }, { name: "type", in: "query", schema: { type: "string", enum: ["User", "Admin"] } }], responses: { "200": jsonResponse("Users", { type: "object", properties: { users: arrayOf("AuthUser"), pagination: ref("Pagination") } }), ...errorResponses } } },
    "/admin/users/{id}": {
      get: { tags: ["Admin"], summary: "Get user by id", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("User", ref("AuthUser")), ...errorResponses } },
      put: {
        tags: ["Admin"],
        summary: "Update user",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, address: { type: "string" }, type: { type: "string", enum: ["User", "Admin"] }, isActive: { type: "boolean" } } } } } },
        responses: { "200": jsonResponse("User updated", ref("AuthUser")), ...errorResponses },
      },
      delete: { tags: ["Admin"], summary: "Delete user", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("User deleted", { type: "object", nullable: true }), ...errorResponses } },
    },
    "/admin/users/bulk-action": {
      post: {
        tags: ["Admin"],
        summary: "Bulk user action",
        security: bearer,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["action", "userIds"], properties: { action: { type: "string", enum: ["delete", "activate", "deactivate", "promote", "demote"] }, userIds: { type: "array", items: { type: "string" } } } } } } },
        responses: { "200": jsonResponse("Bulk action result", { type: "object" }), ...errorResponses },
      },
    },
    "/admin/orders": { get: { tags: ["Admin"], summary: "List orders (admin)", security: bearer, parameters: [...pageParams, { name: "status", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }], responses: { "200": jsonResponse("Orders", { type: "object", properties: { orders: arrayOf("Order"), pagination: ref("Pagination") } }), ...errorResponses } } },
    "/admin/products": { get: { tags: ["Admin"], summary: "List products (admin, stock filters)", security: bearer, parameters: [...pageParams, { name: "search", in: "query", schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "stockStatus", in: "query", schema: { type: "string", enum: ["in-stock", "low-stock", "out-of-stock"] } }], responses: { "200": jsonResponse("Products", { type: "object", properties: { products: arrayOf("Product"), pagination: ref("Pagination") } }), ...errorResponses } } },

    // -------------------------------------------------------------- System
    "/health": { get: { tags: ["System"], summary: "Health check", responses: { "200": { description: "OK" } } } },
    "/info": { get: { tags: ["System"], summary: "API info", responses: { "200": { description: "OK" } } } },
  },
};

export default openapiSpec;
