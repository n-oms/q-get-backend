import { ObjectId } from 'mongodb';
import { Cards } from "../mongo/schema";

export class CardService {
  async queryCards({ queryObject = {} }: { queryObject: Record<string, any> }) {
    const query: Record<string, any> = {};

    // Handle _id conversion if present
    if (queryObject._id && ObjectId.isValid(queryObject._id)) {
      query._id = new ObjectId(queryObject._id.toString());
    }

    // Handle categories
    if (queryObject.categories) {
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

    const cards = await Cards.find(query).lean();
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