export type RepairSection =
    | 'HERO'
    | 'ABOUT'
    | 'CERTIFICATION'
    | 'SERVICE'
    | 'DEVICE'
    | 'DIAGNOSIS'
    | 'PRICE_CARD'
    | 'OBJECTIVE'
    | 'PROCESS';

export interface RepairItem {
    id: number;
    section: RepairSection;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    logoUrl?: string;
    targetDevice?: string;
    iconName?: string;
    price?: number;
    orderIndex: number;
    active: boolean;
}

export interface RepairItemRequest {
    section: RepairSection;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    logoUrl?: string;
    targetDevice?: string;
    iconName?: string;
    price?: number;
    orderIndex: number;
    active: boolean;
}

export interface RepairRequest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    deviceType?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    photoUrl?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}

export type QuoteStatus = 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface RepairQuoteLine {
    id: number;
    repairItem?: RepairItem;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface RepairQuote {
    id: number;
    lines: RepairQuoteLine[];
    totalPrice: number;
    adminNote?: string;
    status: QuoteStatus;
    createdAt: string;
    respondedAt?: string;
}

export interface RepairQuoteLineRequest {
    repairItemId?: number;
    description?: string;
    quantity: number;
    unitPrice: number;
}

export interface RepairQuoteRequest {
    adminNote?: string;
    lines: RepairQuoteLineRequest[];
}
