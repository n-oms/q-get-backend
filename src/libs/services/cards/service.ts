import { Cards } from "../mongo/schema";

export class CardService {

  async queryCards({queryObject = {}}:{queryObject: Record<string, any>}){
    const cards = await Cards.find(queryObject)
    return cards
  }

  async searchCards({ searchString }: { searchString: string }) {
    const cards = await Cards.find({ searchString: { $regex: searchString, $options: 'i' } });
    return cards;
  }

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
  async createCard({ cardData }: { cardData: Record<string, any> }) {
    const newCard = await Cards.create(cardData);
    return newCard;
  }
}












