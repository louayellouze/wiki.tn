import api from '@/common/utils/api';
import { RepairItem, RepairQuote, RepairRequest } from "@/app/dtos/repair";

export const repairService = {
    async getRepairItems(section?: string): Promise<RepairItem[]> {
        const query = section ? `?section=${section}&onlyActive=true` : '?onlyActive=true';
        const response = await api.get<RepairItem[]>(`/v1/repair-items${query}`);
        return response.data;
    },

    async submitRepairRequest(data: Partial<RepairRequest>): Promise<RepairRequest> {
        const response = await api.post<RepairRequest>('/v1/repair-requests', data);
        return response.data;
    },

    async getMyRepairRequests(): Promise<RepairRequest[]> {
        const response = await api.get<RepairRequest[]>('/v1/repair-requests/my');
        return response.data;
    },

    async getQuoteByRequestId(requestId: number): Promise<RepairQuote> {
        const response = await api.get<RepairQuote>(`/v1/repair-quotes/my/request/${requestId}`);
        return response.data;
    },

    async respondToQuote(quoteId: number, response: 'ACCEPTED' | 'REJECTED'): Promise<RepairQuote> {
        const res = await api.patch<RepairQuote>(`/v1/repair-quotes/${quoteId}/respond`, { response });
        return res.data;
    },

    async payQuote(quoteId: number, method: 'CARD' | 'UPON_PICKUP'): Promise<{ result: string }> {
        const res = await api.post<{ result: string }>(`/v1/repair-quotes/${quoteId}/pay`, { method });
        return res.data;
    }
};

