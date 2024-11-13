import { ApplicationStatus, VendorCreditStatus } from "../mongo/enums";
import {
  applications,
  Invoices,
  scans,
  users,
  vendorCredits,
} from "../mongo/models";
import { VendorCreditsType } from "../mongo/types";
import { QueryBuilderService } from "../queryBuilder/service";
import { UserService } from "../user/service";

export class DashboardService {
  private readonly queryBuilder: QueryBuilderService;
  private readonly userService: UserService;
  constructor() {
    this.queryBuilder = new QueryBuilderService();
    this.userService = new UserService();
    this.getCardData = this.getCardData.bind(this);
    this.getTableData = this.getTableData.bind(this);
    this.getCreditsBilled = this.getCreditsBilled.bind(this);
    this.getScansCount = this.getScansCount.bind(this);
    this.getLoginsApprovedCount = this.getLoginsApprovedCount.bind(this);
    this.getTotalBilledCredits = this.getTotalBilledCredits.bind(this);
  }

  async getCardData({
    vendorId,
    phoneNumber,
  }: {
    vendorId: string;
    phoneNumber?: string;
  }) {
    try {
      const scansCount = await this.getScansCount({ vendorId });
      const { loginsCount, approvedCount } = await this.getLoginsApprovedCount({
        vendorId,
      });

      const creditsBilled = await this.getTotalBilledCredits({ vendorId });

      const totalInvoices = await Invoices.countDocuments({ vendorId });

      const userCount = await this.userService.getUserCountByVendorId({
        vendorId,
        phoneNumber,
      });

      return {
        scans: {
          count: scansCount,
        },
        logins: {
          count: loginsCount,
        },
        approved: {
          count: approvedCount,
        },
        billed: {
          value: creditsBilled,
        },
        invoices: {
          count: totalInvoices,
        },
        users: {
          count: userCount,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private async getScansCount({ vendorId }: { vendorId: string }) {
    return await scans.countDocuments({ vendorId });
  }

  private async getLoginsApprovedCount({ vendorId }: { vendorId: string }) {
    const aggregationQuery = this.queryBuilder.buildAgrregationQuery({
      match: {
        vendorId: vendorId,
        status: {
          $in: [ApplicationStatus.LOGIN, ApplicationStatus.APPROVED],
        },
      },
      group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    });

    const applicationQueryResponse = await applications.aggregate(
      aggregationQuery
    );

    const approvedCount =
      applicationQueryResponse.find(
        (item) => item._id === ApplicationStatus.APPROVED
      )?.count || 0;

    const loginsCount =
      applicationQueryResponse.find(
        (item) => item._id === ApplicationStatus.LOGIN
      )?.count || 0;
    return { approvedCount, loginsCount };
  }

  private async getTotalBilledCredits({ vendorId }: { vendorId: string }) {
    const toBeRaisedCredits = await vendorCredits.find({
      vendorId,
      status: VendorCreditStatus.TO_BE_RAISED,
    });

    const creditsBilled = this.getCreditsBilled(toBeRaisedCredits);
    return creditsBilled;
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
        case "users":
          const filteredUsers = await users.find({
            vendorId: query.vendorId,
            phoneNumber: { $ne: query.phoneNumber },
          });
          return filteredUsers;
        default:
          throw new Error("Invalid query id");
      }
    } catch (error) {
      throw error;
    }
  }
}
