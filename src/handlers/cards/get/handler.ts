import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { CardService } from "@/libs/services/cards/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";

export class GetCardsHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;
  cardsService: CardService
  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = false;
    this.isAuthorizedAccess = false;
    this.operationId = OPERATION_IDS.CARDS.GET_CARDS;
    this.resource = HTTP_RESOURCES.GET_CARDS;
    this.validations = [];
    this.handler = this.handler.bind(this);
    this.cardsService = new CardService()
  }

  async handler(
    req: ApiRequest,
    res: ApiResponse,
    next
  ) {
    try {
      const query = req.query || {}
      const result = await this.cardsService.queryCards({queryObject: query})
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
