import { apiFetch } from "./auth.service";
import { ContactMessage } from "../dtos/contact.dto";

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    return apiFetch<ContactMessage[]>("/v1/contact");
};
