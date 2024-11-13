import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption, NotProvidedError } from "@/libs/error/error";
import { DashboardService } from "@/libs/services/dashboard/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { DashboardQueryTypes, GetDashboardData } from "../../types";
import { UserType } from "@/libs/services/mongo/enums";

export class GetDashboardDataHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  dashboardService: DashboardService;
  isAuthorizedAccess?: boolean;
  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = false;
    this.isAuthorizedAccess = true;
    this.operationId = "GET_OTP";
    this.resource = HTTP_RESOURCES.DASHBOARD;
    this.validations = [];
    this.dashboardService = new DashboardService();
    this.handler = this.handler.bind(this);
  }

  async handler(req: ApiRequest<GetDashboardData>, res: ApiResponse, next) {
    try {
      const { userType, vendorId, phoneNumber } = req.userInfo;

      if (userType !== UserType.Vendor || !vendorId) {
        throw new BadRequestExecption("User is not vendor");
      }

      const type = req.query.queryType;

      delete req.query.queryType;

      if (!type) {
        throw new NotProvidedError("Query type not provided");
      }

      switch (type) {
        case DashboardQueryTypes.GET_CARD_DATA: {
          const result = await this.dashboardService.getCardData({
            vendorId,
            phoneNumber,
          });
          return res.status(200).send(result);
        }
        case DashboardQueryTypes.GET_TABLE_DATA: {
          const { queryId } = req.query;

          if (!queryId) {
            throw new NotProvidedError("Query id not provided");
          }

          // delete queryId from query to avoid passing it to the db query
          delete req.query.queryId;

          const result = await this.dashboardService.getTableData({
            query: { vendorId, ...req.query },
            queryId,
          });
          return res.status(200).send(result);
        }
        default:
          throw new BadRequestExecption("Invalid action");
      }
    } catch (error) {
      next(error);
    }
  }
}
