// Centralized route path constants (storefront + admin).

export const ROUTES = {
  // Storefront
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORIES: "/categories",
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ACCOUNT: "/account",
  WISHLIST: "/wishlist",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
  SHIPPING_INFO: "/shipping",
  RETURNS_INFO: "/returns",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Admin
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_NEW: "/admin/products/new",
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/${id}`,
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_SHIPPING: "/admin/shipping",
  ADMIN_RETURNS: "/admin/returns",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/settings",
} as const;
