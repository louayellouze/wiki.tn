export type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
export type EntityType = "PRODUCT" | "CATEGORY" | "ORDER" | "USER" | "SPEC_KEY";

export interface Historique {
    id: number;
    actionType: ActionType;
    entityType: EntityType;
    details: string;
    entityId?: number;
    actionDate: string;
    userId: number;
    username: string;
    userFullName: string;
    userRole: string;
}
