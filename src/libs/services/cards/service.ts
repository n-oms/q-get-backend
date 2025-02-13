import { ObjectId } from 'mongodb';
import { Cards } from "../mongo/schema";

const BANK_ORDER = [
  'HDFC Bank',
  'SBI Bank', 
  'IDFC Bank',
  'Axis Bank',
  'IndusInd Bank',
  'AU Small Finance Bank'
];

export class CardService {
  private sortByBankOrder(cards: any[]) {
    return cards.sort((a, b) => {
      // Handle cases where bankName is missing
      const bankA = a.bankName || '';
      const bankB = b.bankName || '';
      
      const indexA = BANK_ORDER.indexOf(bankA);
      const indexB = BANK_ORDER.indexOf(bankB);

      // If both banks are in the order list, sort by their order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one bank is in the order list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // For banks not in the order list or missing bankNames, 
      // maintain their relative order but put them at the end
      if (bankA === bankB) return 0;
      return bankA < bankB ? -1 : 1;
    });
  }

  async queryCards({ queryObject = {} }: { queryObject: Record<string, any> }) {
    const query: Record<string, any> = {};

    if (queryObject._id && ObjectId.isValid(queryObject._id)) {
      query._id = new ObjectId(queryObject._id.toString());
    }

    if (queryObject.categories) {
      const categories = Array.isArray(queryObject.categories)
        ? queryObject.categories
        : queryObject.categories.split(',');
      query.categories = { $in: categories };
    }

    if (queryObject.search) {
      const searchRegex = { $regex: queryObject.search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { bankName: searchRegex },
        { searchString: searchRegex }
      ];
    }

    if (queryObject.bankName) {
      query.bankName = queryObject.bankName;
    }

    ['type', 'orientation'].forEach(field => {
      if (queryObject[field]) {
        query[field] = queryObject[field];
      }
    });

    const cards = await Cards.find(query).lean();
    return this.sortByBankOrder(cards);
  }

  async searchCards({ searchString }: { searchString: string }) {
    const cards = await Cards.find({ 
      searchString: { $regex: searchString, $options: 'i' } 
    }).lean();
    return this.sortByBankOrder(cards);
  }

  async getCardById({ cardId }: { cardId: string }) {
    const result = await Cards.findOne({ cardId }).lean();
    return result ? this.sortByBankOrder([result])[0] : null;
  }

  async getCardsByUserId({ userId }: { userId: string }) {
    const cards = await Cards.find({ userId }).lean();
    return this.sortByBankOrder(cards);
  }

  async getCardCountByUserId({ userId }: { userId: string }) {
    const result = await Cards.countDocuments({ userId });
    return result;
  }

  async createCard({ cardData }: { cardData: Record<string, any> }) {
    const newCard = await Cards.create(cardData);
    return newCard.toObject();
  }
}