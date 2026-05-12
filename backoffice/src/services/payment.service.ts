import { apiFetch } from "./auth.service";

export interface Payment {
    id: number;
    orderId: number;
    username: string;
    paymentDate: string;
    amount: number;
    method: string;
    transactionId: string;
    status: string;
}

export const getAllPayments = async (): Promise<Payment[]> => {
    return apiFetch<Payment[]>("/v1/payments");
};

export const getTotalPayments = async (): Promise<{ total: number }> => {
    return apiFetch<{ total: number }>("/v1/payments/total");
};

export const validatePayment = async (orderId: number): Promise<void> => {
    return apiFetch<void>(`/v1/payments/${orderId}/validate`, {
        method: "POST"
    });
};
