import { OrganizationService } from "./service";
import { Organization } from "../mongo/models/organization";
import { DbError } from "../../error/error";

jest.mock("../mongo/models/applications");


jest.mock("../mongo/models/organization");

describe("OrganizationService", () => {
    let service: OrganizationService;

    beforeEach(() => {
        service = new OrganizationService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getOrganizationInfo", () => {
        it("should return organization info when query is successful", async () => {
            const mockOrgInfo = { name: "testOrg", toJSON: jest.fn().mockReturnValue({ name: "testOrg" }) };
            
            (Organization.findOne as jest.Mock).mockResolvedValue(mockOrgInfo);

            const result = await service.getOrganizationInfo();

            expect(result).toEqual({ name: "testOrg" });
            expect(Organization.findOne).toHaveBeenCalled();
        });

        it("should throw DbError when query fails", async () => {
            const errorMessage = "Database error";
            
            (Organization.findOne as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(service.getOrganizationInfo()).rejects.toThrow(DbError);
            await expect(service.getOrganizationInfo()).rejects.toThrow(errorMessage);
        });
    });
});

