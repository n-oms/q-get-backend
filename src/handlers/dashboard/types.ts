
export enum DashboardQueryTypes {
    GET_CARD_DATA = "getCardsData",
}

export interface GetDashboardData {
    query:{
        queryType: DashboardQueryTypes
    }
}