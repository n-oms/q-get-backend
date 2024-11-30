import mongoose from "mongoose";
import { GetInsightsInput } from "./types";

export class InsightService {
    async getInsights({ entity, query = {} }: GetInsightsInput) {
        try {    
          const model = mongoose.model(entity);
          const result = await model.find(query).sort({ createdAt: -1 });
          return result;
        } 
        catch (error) {
          console.error(error);
          throw error;
        }
      }
    }