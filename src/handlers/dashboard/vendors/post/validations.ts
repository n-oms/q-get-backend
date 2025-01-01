import { z } from "zod";

export enum DashboardQueryTypes {
    GET_CARD_DATA = "getCardsData",
    GET_TABLE_DATA = "getTableData"
}

export const dashboardApiBodySchema = z.object({
    action: z.nativeEnum(DashboardQueryTypes),
    query: z.any().optional(),
})