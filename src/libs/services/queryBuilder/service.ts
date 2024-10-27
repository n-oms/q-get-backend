import { BuildAgrregationQuery } from "./types"

export class QueryBuilderService {
    public buildAgrregationQuery(query: BuildAgrregationQuery) {
        const aggregationArray = []
        if (query.match) {
            aggregationArray.push({
                $match: query.match
            })
        }
        if (query.group) {
            aggregationArray.push({
                $group: query.group
            })
        }
        return aggregationArray
    }
}