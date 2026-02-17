export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

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
    items: OrderItem[];
}

export interface OrderRequest {
    items: {
        productId: number;
        quantity: number;
    }[];
    address: string;
    postalCode: string;
    username?: string; // Optional: For Infoline to specify or create target customer
}
