import { DbError } from "@/libs/error/error";
import { Organization } from "../mongo/models/organization";

export class OrganizationService {
  constructor() {
    this.getOrganizationInfo = this.getOrganizationInfo.bind(this);
  }
  async getOrganizationInfo() {
    try {
      const orgInfo = await Organization.findOne();
      return orgInfo.toJSON();
    } catch (error) {
      throw new DbError(
        error.message || "Error while fetching organization info from db"
      );
    }
  }
}
