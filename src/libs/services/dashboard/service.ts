import { app } from "@/app";
import { ApplicationStatus } from "../mongo/enums";
import { applications } from "../mongo/models/applications";
import { scans } from "../mongo/models/scans";
import { tableQueryIds } from "./utils";
import { QueryBuilderService } from "../queryBuilder/service";

export class DashboardService {
    private readonly queryBuilder: QueryBuilderService;

    constructor() {
        this.queryBuilder = new QueryBuilderService();
    }

    async getCardData({ vendorId }: { vendorId: string }) {
        try {
            const scansCount = await scans.countDocuments({ vendorId });
            const aggregationQuery = this.queryBuilder.buildAgrregationQuery({
                match: {
                    vendorId: vendorId,
                    status: { $in: [ApplicationStatus.LOGIN, ApplicationStatus.APPROVED, ApplicationStatus.BILLED] } // Include other statuses you want to count
                },
                group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            })
            const applicationQueryResponse = await applications.aggregate(aggregationQuery)
            return {
                scans: {
                    count: scansCount
                },
                logins: {
                    count: applicationQueryResponse.find((item) => item._id === ApplicationStatus.LOGIN)?.count || 0
                },
                approved: {
                    count: applicationQueryResponse.find((item) => item._id === ApplicationStatus.APPROVED)?.count || 0
                },
            }
        } catch (error) {
            throw error;
        }
    }

    async getTableData({ queryId, query }: { queryId: string, query: Record<string, any> }) {
        try {
            if (!tableQueryIds.includes(queryId)) {
                throw new Error('Invalid query id')
            }
            if (queryId === 'scans') {
                return await scans.find(query);
            }
            return await applications.find(query);
        } catch (error) {
            throw error;
        }
    }
}