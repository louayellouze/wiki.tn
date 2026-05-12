export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" |
    "DELIVERED_TO_STORE" | "EXCHANGE" | "IN_DELIVERY_ARAMEX" | "SMT" | "ARTICLE_BEING_PURCHASED" |
    "AWAITING_RESTOCK" | "PC_BEING_ASSEMBLED" | "ORDER_BEING_PICKED_UP" |
    "TRANSFERRED_TO_STORE_FACILITY_PAYMENT" | "TRANSFERRED_TO_STORE_CHECK_PAYMENT" |
    "UNREACHABLE_NUMBER" | "AWAITING_AVAILABILITY_CHECK" | "ORDER_ARRIVED_AT_STORE" |
    "IN_DELIVERY_OWN_MEANS" | "AWAITING_CLIENT_RESPONSE" | "AWAITING_PAYMENT";

export interface OrderItem {
    id: number;
    productId: number;
    productTitle: string;
    quantity: number;
    price: number;
    productImageUrl?: string;
}

export interface Order {
    id: number;
    userId: number;
    username: string;
    orderDate: string;
    status: OrderStatus;
    totalAmount: number;
    address: string;
    postalCode: string;
    phone: string;
    paymentMethod: "CASH_ON_DELIVERY" | "CARD" | "BANK_TRANSFER" | "STRIPE";
    discountAmount?: number;
    couponCode?: string;
    items: OrderItem[];
}

export interface OrderRequest {
    items: {
        productId: number;
        quantity: number;
    }[];
    address: string;
    postalCode: string;
    phone: string;
    username?: string; // Optional: For Infoline to specify or create target customer
    paymentMethod?: "CASH_ON_DELIVERY" | "CARD" | "BANK_TRANSFER" | "STRIPE";
    couponCode?: string;
}
