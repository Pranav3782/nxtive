"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { createOrder as createFirestoreOrder } from "@/lib/firebase/firestore";
import { saveAdminOrder } from "@/features/admin-dashboard/server/actions";

export interface ProductItem {
  id: string;
  slug?: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  tag?: string;
  badge?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  description?: string;
  details?: string[];
  fabricCare?: string[];
  fit?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export interface CartItem extends ProductItem {
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: "Order Confirmed" | "Processing" | "Shipped" | "Delivered";
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending COD";
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryDateEstimate: string;
  trackingNumber: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: ProductItem | null;
  toastMessage: string | null;
  couponCode: string | null;
  discountRate: number;
  addToCart: (product: ProductItem, size?: string, color?: string, qty?: number) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, size: string, delta: number, color?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: ProductItem | null) => void;
  showToast: (msg: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (orderData: {
    shippingAddress: Order["shippingAddress"];
    paymentMethod: string;
    deliveryMethod: string;
    userId?: string;
  }) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  totalCartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartGrandTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SAMPLE_ORDERS: Order[] = [
  {
    id: "NX-2026-94812",
    date: "2026-09-24",
    items: [
      {
        id: "prod-1",
        title: "Oversized Essential Tee",
        price: 799,
        quantity: 1,
        selectedSize: "L",
        selectedColor: "Pitch Black",
        image: "/images/nxtvie/product-oversized-tee-hd.jpg",
      },
      {
        id: "prod-6",
        title: "NXTVIE Cap",
        price: 599,
        quantity: 1,
        selectedSize: "One Size",
        selectedColor: "Deep Black",
        image: "/images/nxtvie/product-cap-hd.jpg",
      },
    ],
    subtotal: 1398,
    discount: 140,
    shipping: 0,
    total: 1258,
    status: "Delivered",
    paymentMethod: "Razorpay UPI (Google Pay)",
    paymentStatus: "Paid",
    shippingAddress: {
      fullName: "Kabir Mehra",
      email: "kabir.mehra@example.com",
      phone: "+91 98201 44521",
      street: "402, Horizon Tower, Bandra West",
      apartment: "Flat 402",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
      country: "India",
    },
    deliveryDateEstimate: "28 Sep 2026",
    trackingNumber: "DEL-NXT-902341",
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nxtvie_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("nxtvie_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem("nxtvie_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {
      // Ignore storage errors in non-browser envs
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem("nxtvie_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("nxtvie_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("nxtvie_orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addToCart = (
    product: ProductItem,
    size = "M",
    color = product.colors?.[0]?.name || "Original",
    qty = 1
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: color }];
    });
    showToast(`Added "${product.title}" (${size}) to bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            (!size || item.selectedSize === size) &&
            (!color || item.selectedColor === color)
          )
      )
    );
    showToast("Item removed from bag");
  };

  const updateQuantity = (id: string, size: string, delta: number, color?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.id === id &&
            item.selectedSize === size &&
            (!color || item.selectedColor === color)
          ) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode(null);
    setDiscountRate(0);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((x) => x !== id);
      } else {
        showToast("Saved to your wishlist ❤️");
        return [...prev, id];
      }
    });
  };

  const isInWishlist = (id: string) => wishlist.includes(id);

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === "NEXT10") {
      setCouponCode("NEXT10");
      setDiscountRate(0.1);
      showToast("Coupon NEXT10 applied: 10% discount!");
      return true;
    }
    if (clean === "NXTVIE20") {
      setCouponCode("NXTVIE20");
      setDiscountRate(0.2);
      showToast("VIP Coupon NXTVIE20 applied: 20% discount!");
      return true;
    }
    showToast("Invalid promo code. Try NEXT10.");
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountRate(0);
    showToast("Coupon removed.");
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(cartSubtotal * discountRate);
  const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
  const cartGrandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Idempotency key ref to prevent duplicate submissions within same session
  const idempotencyRef = useRef<string | null>(null);

  const placeOrder = async ({
    shippingAddress,
    paymentMethod,
    deliveryMethod,
    userId,
  }: {
    shippingAddress: Order["shippingAddress"];
    paymentMethod: string;
    deliveryMethod: string;
    userId?: string;
  }): Promise<Order> => {
    // Generate idempotency key once per submission attempt
    const idempotencyKey =
      idempotencyRef.current || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    idempotencyRef.current = idempotencyKey;

    const orderItems: OrderItem[] = cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      image: item.image,
    }));

    const finalShipping = deliveryMethod.includes("Priority") ? 150 : shippingFee;
    const finalTotal = Math.max(0, cartSubtotal - discountAmount + finalShipping);
    const trackingNumber = `EXP-NXT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Attempt Firestore persistence
    let firestoreOrderId: string | null = null;
    const effectiveUserId = userId || `anon-${Date.now()}`;
    try {
      firestoreOrderId = await createFirestoreOrder({
        userId: effectiveUserId,
        items: orderItems.map((i) => ({
          productId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          image: i.image,
        })),
        subtotal: cartSubtotal,
        discount: discountAmount,
        shipping: finalShipping,
        total: finalTotal,
        status: "Order Confirmed",
        paymentMethod,
        paymentStatus: paymentMethod.toLowerCase().includes("cash") ? "Pending COD" : "Paid",
        shippingAddress,
        deliveryDateEstimate: deliveryMethod.includes("Priority")
          ? "1-2 Business Days"
          : "4-5 Business Days",
        trackingNumber,
        idempotencyKey,
      });
    } catch (err) {
      console.error("Firestore order creation failed, falling back to local:", err);
      // Continue with local order — do not block checkout
    }

    const newOrderId = firestoreOrderId
      ? `NX-${firestoreOrderId.slice(0, 8).toUpperCase()}`
      : `NX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: newOrderId,
      date: new Date().toISOString().split("T")[0],
      items: orderItems,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: finalShipping,
      total: finalTotal,
      status: "Order Confirmed",
      paymentMethod,
      paymentStatus: paymentMethod.toLowerCase().includes("cash") ? "Pending COD" : "Paid",
      shippingAddress,
      deliveryDateEstimate: deliveryMethod.includes("Priority")
        ? "1-2 Business Days"
        : "4-5 Business Days",
      trackingNumber,
    };

    // Reset idempotency key so next order gets a new one
    idempotencyRef.current = null;

    // Sync order to Admin Panel store & localStorage
    try {
      const adminOrderPayload = {
        id: newOrderId,
        orderNumber: newOrderId,
        userId: effectiveUserId,
        items: orderItems.map((i) => ({
          productId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          image: i.image,
        })),
        subtotal: cartSubtotal,
        discount: discountAmount,
        shipping: finalShipping,
        total: finalTotal,
        status: "pending" as const,
        paymentMethod,
        paymentStatus: paymentMethod.toLowerCase().includes("cash") ? ("cod_pending" as const) : ("paid" as const),
        shippingAddress,
        deliveryMethod,
        deliveryDateEstimate: deliveryMethod.includes("Priority") ? "1-2 Business Days" : "4-5 Business Days",
        trackingNumber,
        createdAt: new Date().toISOString(),
      };

      saveAdminOrder(adminOrderPayload).catch(() => {});

      if (typeof window !== "undefined") {
        const rawCustom = localStorage.getItem("nxtvie_admin_custom_orders");
        const customOrders = rawCustom ? JSON.parse(rawCustom) : [];
        customOrders.unshift(adminOrderPayload);
        localStorage.setItem("nxtvie_admin_custom_orders", JSON.stringify(customOrders));
      }
    } catch (e) {
      console.error("Failed to sync order to admin storage", e);
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((o) => o.id === orderId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        toastMessage,
        couponCode,
        discountRate,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setIsCartOpen,
        setIsSearchOpen,
        setQuickViewProduct,
        showToast,
        applyCoupon,
        removeCoupon,
        placeOrder,
        getOrderById,
        totalCartCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartGrandTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
