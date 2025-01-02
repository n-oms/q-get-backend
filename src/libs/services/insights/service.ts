import mongoose from "mongoose";

export class InsightsService {
    async getInsights({model, query}:{model: string, query: any}) {
        try {
            const Model = mongoose.model(model);
            const result = await Model.find(query).sort({createdAt: -1})
            return result 
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}