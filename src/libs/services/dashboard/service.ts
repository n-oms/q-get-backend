import { ApplicationStatus } from "../mongo/enums";
import { applications } from "../mongo/models/applications";
import { scans } from "../mongo/models/scans";

export class DashboardService {
    async getCardData({ vendorId }: { vendorId: string }) {
        try {
            const scansCount = await scans.countDocuments({ vendorId });
            const loginsCount = await applications.countDocuments({ vendorId, status: ApplicationStatus.LOGIN });
            return { scansCount, loginsCount };
        } catch (error) {

        }
    }
}