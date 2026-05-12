export type ContactStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface ContactMessage {
    id: number;
    status: ContactStatus;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    response?: string;
    createdAt: string;
}
