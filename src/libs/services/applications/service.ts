import { DbError } from "@/libs/error/error";
import { applications } from "../mongo/models/applications";

export class ApplicationsService {
    async queryApplications({ query }: { query: Record<string, any> }) {
        try {
            const items = await applications.find(query)
            return items
        } catch (error) {
            throw new DbError(error.message || "Error while fetching applications from db")
        }
    }
}