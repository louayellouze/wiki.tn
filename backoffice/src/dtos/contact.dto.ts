export interface ContactMessage {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: string;
}
