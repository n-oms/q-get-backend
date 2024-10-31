import { DashboardService } from './service';
import { applications } from "../mongo/models/applications";
import { scans } from "../mongo/models/scans";
import { vendorCredits } from "../mongo/models/vendor-credits";
import { ApplicationStatus, VendorCreditStatus } from "../mongo/enums";

// Mock the models
jest.mock('../mongo/models/applications', () => ({
  applications: {
    aggregate: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock('../mongo/models/scans', () => ({
  scans: {
    countDocuments: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock('../mongo/models/vendor-credits', () => ({
  vendorCredits: {
    find: jest.fn()
  }
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  const mockVendorId = 'vendor123';

  beforeEach(() => {
    dashboardService = new DashboardService();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCardData', () => {
    it('should return correct card data when all queries succeed', async () => {
      // Mock the responses
      (scans.countDocuments as jest.Mock).mockResolvedValue(10);
      
      (applications.aggregate as jest.Mock).mockResolvedValue([
        { _id: ApplicationStatus.LOGIN, count: 5 },
        { _id: ApplicationStatus.APPROVED, count: 3 }
      ]);

      (vendorCredits.find as jest.Mock).mockResolvedValue([
        { credit: 100 },
        { credit: 200 }
      ]);

      const result = await dashboardService.getCardData({ vendorId: mockVendorId });

      expect(result).toEqual({
        scans: { count: 10 },
        logins: { count: 5 },
        approved: { count: 3 },
        billed: { value: 300 }
      });

      // Verify all mocks were called with correct parameters
      expect(scans.countDocuments).toHaveBeenCalledWith({ vendorId: mockVendorId });
      expect(applications.aggregate).toHaveBeenCalled();
      expect(vendorCredits.find).toHaveBeenCalledWith({
        vendorId: mockVendorId,
        status: VendorCreditStatus.TO_BE_RAISED
      });
    });

    it('should handle missing application status counts', async () => {
      (scans.countDocuments as jest.Mock).mockResolvedValue(10);
      (applications.aggregate as jest.Mock).mockResolvedValue([]);
      (vendorCredits.find as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getCardData({ vendorId: mockVendorId });

      expect(result).toEqual({
        scans: { count: 10 },
        logins: { count: 0 },
        approved: { count: 0 },
        billed: { value: 0 }
      });
    });

    it('should propagate errors from database queries', async () => {
      const mockError = new Error('Database error');
      (scans.countDocuments as jest.Mock).mockRejectedValue(mockError);

      await expect(dashboardService.getCardData({ vendorId: mockVendorId }))
        .rejects
        .toThrow(mockError);
    });
  });

  describe('getTableData', () => {
    const mockQuery = { someField: 'value' };

    it('should return scans data for scans queryId', async () => {
      const mockScans = [{ id: 1 }, { id: 2 }];
      (scans.find as jest.Mock).mockResolvedValue(mockScans);

      const result = await dashboardService.getTableData({
        queryId: 'scans',
        query: mockQuery
      });

      expect(result).toEqual(mockScans);
      expect(scans.find).toHaveBeenCalledWith(mockQuery);
    });

    it('should return applications data for applications queryId', async () => {
      const mockApplications = [{ id: 1 }, { id: 2 }];
      (applications.find as jest.Mock).mockResolvedValue(mockApplications);

      const result = await dashboardService.getTableData({
        queryId: 'applications',
        query: mockQuery
      });

      expect(result).toEqual(mockApplications);
      expect(applications.find).toHaveBeenCalledWith(mockQuery);
    });

    it('should return vendor credits data for billed queryId', async () => {
      const mockCredits = [{ id: 1 }, { id: 2 }];
      (vendorCredits.find as jest.Mock).mockResolvedValue(mockCredits);

      const result = await dashboardService.getTableData({
        queryId: 'billed',
        query: mockQuery
      });

      expect(result).toEqual(mockCredits);
      expect(vendorCredits.find).toHaveBeenCalledWith({
        ...mockQuery,
        status: VendorCreditStatus.TO_BE_RAISED
      });
    });

    it('should throw error for invalid queryId', async () => {
      await expect(dashboardService.getTableData({
        queryId: 'invalid',
        query: mockQuery
      })).rejects.toThrow('Invalid query id');
    });

    it('should propagate database errors', async () => {
      const mockError = new Error('Database error');
      (scans.find as jest.Mock).mockRejectedValue(mockError);

      await expect(dashboardService.getTableData({
        queryId: 'scans',
        query: mockQuery
      })).rejects.toThrow(mockError);
    });
  });
});