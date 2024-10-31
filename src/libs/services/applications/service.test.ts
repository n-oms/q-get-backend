import { ApplicationsService } from "./service";
import { applications } from "../mongo/models/applications";
import { DbError } from "../../error/error";

jest.mock("../mongo/models/applications");

describe("ApplicationsService", () => {
    let service: ApplicationsService;

    beforeEach(() => {
        service = new ApplicationsService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("queryApplications", () => {
        it("should return items when query is successful", async () => {
            const mockQuery = { name: "test" };
            const mockItems = [{ name: "test" }];
            
            (applications.find as jest.Mock).mockResolvedValue(mockItems);

            const result = await service.queryApplications({ query: mockQuery });

            expect(result).toEqual(mockItems);
            expect(applications.find).toHaveBeenCalledWith(mockQuery);
        });

        it("should throw DbError when query fails", async () => {
            const mockQuery = { name: "test" };
            const errorMessage = "Database error";
            
            (applications.find as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(service.queryApplications({ query: mockQuery })).rejects.toThrow(DbError);
            await expect(service.queryApplications({ query: mockQuery })).rejects.toThrow(errorMessage);
        });
    });
});
