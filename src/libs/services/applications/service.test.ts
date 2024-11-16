import { ApplicationsService } from "./service";
import { Applications } from "../mongo/models/applications";
import { DbError } from "../../error/error";
jest.mock("../mongo/models/Applications");

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

      (Applications.find as jest.Mock).mockResolvedValue(mockItems);

      const result = await service.queryApplications({ query: mockQuery });

      expect(result).toEqual(mockItems);
      expect(Applications.find).toHaveBeenCalledWith(mockQuery);
    });

    it("should throw DbError when query fails", async () => {
      const mockQuery = { name: "test" };
      const errorMessage = "Database error";

      (Applications.find as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        service.queryApplications({ query: mockQuery })
      ).rejects.toThrow(DbError);
      await expect(
        service.queryApplications({ query: mockQuery })
      ).rejects.toThrow(errorMessage);
    });
  });
});
