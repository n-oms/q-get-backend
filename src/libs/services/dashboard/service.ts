import { ApplicationStatus, VendorCreditStatus } from "../mongo/enums";
import { applications } from "../mongo/models/applications";
import { Invoices } from "../mongo/models/invoice";
import { scans } from "../mongo/models/scans";
import { vendorCredits } from "../mongo/models/vendor-credits";
import { VendorCreditsType } from "../mongo/types";
import autoBind from "auto-bind";
import { QueryBuilderService } from "../queryBuilder/service";

export class DashboardService {
  private readonly queryBuilder: QueryBuilderService;

  constructor() {
    this.queryBuilder = new QueryBuilderService();
    autoBind(this);
  }

  async getCardData({ vendorId }: { vendorId: string }) {
    try {
      const scansCount = await scans.countDocuments({ vendorId });
      const aggregationQuery = this.queryBuilder.buildAgrregationQuery({
        match: {
          vendorId: vendorId,
          status: {
            $in: [ApplicationStatus.LOGIN, ApplicationStatus.APPROVED],
          }, // Include other statuses you want to count
        },
        group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      });
      const applicationQueryResponse = await applications.aggregate(
        aggregationQuery
      );

      // Total credits billed for the vendor
      const toBeRaisedCredits = await vendorCredits.find({
        vendorId,
        status: VendorCreditStatus.TO_BE_RAISED,
      });
      const creditsBilled = this.getCreditsBilled(toBeRaisedCredits);
      const totalInvoices = await Invoices.countDocuments({ vendorId });

      return {
        scans: {
          count: scansCount,
        },
        logins: {
          count:
            applicationQueryResponse.find(
              (item) => item._id === ApplicationStatus.LOGIN
            )?.count || 0,
        },
        approved: {
          count:
            applicationQueryResponse.find(
              (item) => item._id === ApplicationStatus.APPROVED
            )?.count || 0,
        },
        billed: {
          value: creditsBilled,
        },
        invoices: {
          count: totalInvoices,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private getCreditsBilled(credits: VendorCreditsType[]) {
    if (vendorCredits.length === 0) {
      return 0;
    }
    return credits.reduce((acc, credit) => acc + credit.credit, 0);
  }

  async getTableData({
    queryId,
    query,
  }: {
    queryId: string;
    query: Record<string, any>;
  }) {
    try {
      switch (queryId) {
        case "scans":
          return await scans.find(query);
        case "applications":
          return await applications.find(query);
        case "billed":
          return await vendorCredits.find({
            ...query,
            status: VendorCreditStatus.TO_BE_RAISED,
          });
        default:
          throw new Error("Invalid query id");
      }
    } catch (error) {
      throw error;
    }
  }
}
