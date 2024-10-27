
export enum DashboardQueryTypes {
    GET_CARD_DATA = "getCardsData",
    GET_TABLE_DATA = "getTableData"
}

export interface GetDashboardData {
    query:{
        queryType: DashboardQueryTypes
        [key: string]: any
    }
}