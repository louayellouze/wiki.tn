export type RepairSection = 
    | 'HERO' 
    | 'ABOUT' 
    | 'CERTIFICATION' 
    | 'SERVICE' 
    | 'DEVICE' 
    | 'DIAGNOSIS' 
    | 'PRICE_CARD' 
    | 'OBJECTIVE';

export interface RepairItem {
    id: number;
    section: RepairSection;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    logoUrl?: string; // Add this field
    targetDevice?: string;
    iconName?: string;
    price?: number;
    orderIndex: number;
    active: boolean;
}

export interface RepairRequest {
    id?: number;
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
    status?: string;
    createdAt?: string;
}

export interface RepairQuoteLine {
    id: number;
    title: string;
    price: number;
}

export interface RepairQuote {
    id: number;
    repairRequestId?: number;
    totalPrice: number;
    adminNote?: string;
    status: 'SENT' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    respondedAt?: string;
    lines: RepairQuoteLine[];
    paymentMethod?: 'CARD' | 'UPON_PICKUP';
    paymentStatus?: 'UNPAID' | 'PAID';
}
