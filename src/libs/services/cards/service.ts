import { Cards } from "../mongo/schema";

export class CardService {
  async getCardById({ cardId }: { cardId: string }) {
    const result = await Cards.findOne({ cardId });
    return result.toJSON();
  }

  async getCardsByUserId({ userId }: { userId: string }) {
    const result = await Cards.find({ userId });
    return result;
  }

  async getCardCountByUserId({ userId }: { userId: string }) {
    const result = await Cards.countDocuments({ userId });
    return result;
  }
}
