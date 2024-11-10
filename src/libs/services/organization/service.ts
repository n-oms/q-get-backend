import { DbError } from "@/libs/error/error";
import { organization } from "../mongo/models/organization";

export class OrganizationService {

  async getOrganizationInfo() {
    try {
      const orgInfo = await organization.findOne();
      return orgInfo.toJSON();
    } catch (error) {
      throw new DbError(
        error.message || "Error while fetching organization info from db"
      );
    }
  }
}
