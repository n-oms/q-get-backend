import { Cards } from "../mongo/schema";

export class CardService {
  async queryCards({ queryObject = {} }: { queryObject: Record<string, any> }) {
    const query: Record<string, any> = {};

    // Handle categories
    if (queryObject.categories) {
      // Support both array and comma-separated string
      const categories = Array.isArray(queryObject.categories)
        ? queryObject.categories
        : queryObject.categories.split(',');
      query.categories = { $in: categories };
    }

    // Handle text search across multiple fields
    if (queryObject.search) {
      const searchRegex = { $regex: queryObject.search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { bankName: searchRegex },
        { searchString: searchRegex }
      ];
    }

    // Handle bank name
    if (queryObject.bankName) {
      query.bankName = queryObject.bankName;
    }

    // Handle type and orientation
    ['type', 'orientation'].forEach(field => {
      if (queryObject[field]) {
        query[field] = queryObject[field];
      }
    });

    const cards = await Cards.find(query);
    return cards;
  }

  async searchCards({ searchString }: { searchString: string }) {
    const cards = await Cards.find({ searchString: { $regex: searchString, $options: 'i' } });
    return cards;
  }

  async getCardById({ cardId }: { cardId: string }) {
    const result = await Cards.findOne({ cardId });
    return result?.toJSON();
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