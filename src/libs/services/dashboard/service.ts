import { ApplicationsService } from "../applications/service";
import { ApplicationStatus, VendorCreditStatus } from "../mongo/enums";
import {
  Applications,
  Invoices,
  Scans,
  Users,
  VendorCredits,
} from "../mongo/models";
import { VendorCreditsType } from "../mongo/types";
import { QueryBuilderService } from "../queryBuilder/service";
import { UserService } from "../user/service";
import { TableQueryIds } from "./utils";

export class DashboardService {
  private readonly queryBuilder: QueryBuilderService;
  private readonly userService: UserService;
  private readonly applicationService: ApplicationsService;
  constructor() {
    this.queryBuilder = new QueryBuilderService();
    this.userService = new UserService();
    this.applicationService = new ApplicationsService();
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
          count: creditsBilled,
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
    return await Scans.countDocuments({ vendorId });
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

    const applicationQueryResponse = await Applications.aggregate(
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
    const toBeRaisedCredits = await VendorCredits.find({
      vendorId,
      status: VendorCreditStatus.TO_BE_RAISED,
    });

    const creditsBilled = this.getCreditsBilled(toBeRaisedCredits);
    return creditsBilled;
  }

  private getCreditsBilled(credits: VendorCreditsType[]) {
    if (credits.length === 0) {
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
        case TableQueryIds.SCANS:
          return await this.getScannedUsers({ vendorId: query.vendorId });
        case TableQueryIds.APPROVED:
          return await this.applicationService.queryApplications({
            query: {
              status: ApplicationStatus.APPROVED,
              vendorId: query.vendorId,
            },
          });
        case TableQueryIds.LOGINS: {
          return await this.applicationService.queryApplications({
            query: {
              status: ApplicationStatus.LOGIN,
              vendorId: query.vendorId,
            },
          });
        }
        case TableQueryIds.BILLED:
          return await VendorCredits.find({
            vendorId: query.vendorId,
            status: VendorCreditStatus.TO_BE_RAISED,
          });
        case TableQueryIds.USERS:
          const filteredUsers = await Users.find({
            vendorId: query.vendorId,
            phoneNumber: { $ne: query.phoneNumber },
          });
          return filteredUsers;
        case TableQueryIds.INVOICES: {
          return await Invoices.find({ vendorId: query.vendorId });
        }
        default:
          throw new Error("Invalid query id");
      }
    } catch (error) {
      throw error;
    }
  }

  async getScannedUsers({ vendorId }: { vendorId: string }) {
    return await Scans.find({ vendorId });
  }
}
