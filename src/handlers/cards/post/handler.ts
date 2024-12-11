import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { CardService } from "@/libs/services/cards/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";

export class CreateCardHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;
  cardsService: CardService;

  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.isAuthorizedAccess = true; 
    this.operationId = OPERATION_IDS.CARDS.CREATE_CARD;
    this.resource = HTTP_RESOURCES.CREATE_CARD;
    this.validations = []; 
    this.handler = this.handler.bind(this);
    this.cardsService = new CardService();
  }

  async handler(
    req: ApiRequest,
    res: ApiResponse,
    next
  ) {
    try {
      const cardData = req.body; 
      const result = await this.cardsService.createCard({ cardData });
      return res.status(201).send(result); 
    } catch (error) {
      next(error); 
    }
  }
}
