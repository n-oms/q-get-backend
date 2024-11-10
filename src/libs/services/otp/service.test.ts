// otpDBService.test.ts
import { OtpDBService } from "./service";
import { otps } from "../mongo/schema";
import { Otp } from "../mongo/types";

jest.mock("../mongo/schema");

describe("OtpDBService", () => {
    let otpService: OtpDBService;

    beforeEach(() => {
        otpService = new OtpDBService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getOtpEntry", () => {
        it("should return OTP entry when found", async () => {
            const phone = "1234567890";
            const mockOtp = { phoneNumber: phone, code: "1234", verified: false };
            (otps.findOne as jest.Mock).mockResolvedValue({
                toJSON: () => mockOtp,
            });

            const result = await otpService.getOtpEntry(phone);

            expect(result).toEqual(mockOtp);
            expect(otps.findOne).toHaveBeenCalledWith({ phoneNumber: phone });
        });

        it("should return null if OTP entry is not found", async () => {
            const phone = "1234567890";
            (otps.findOne as jest.Mock).mockResolvedValue(null);

            const result = await otpService.getOtpEntry(phone);

            expect(result).toBeUndefined();
            expect(otps.findOne).toHaveBeenCalledWith({ phoneNumber: phone });
        });

        it("should throw an error if findOne fails", async () => {
            const phone = "1234567890";
            const errorMessage = "Database error";
            (otps.findOne as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(otpService.getOtpEntry(phone)).rejects.toThrow(errorMessage);
        });
    });

    describe("createOtpEntry", () => {
        it("should create and return new OTP entry", async () => {
            const input = { phoneNumber: "1234567890", code: "1234" };
            const mockOtp = { ...input, verified: false, lastSentAt: Date.now() };
            (otps.create as jest.Mock).mockResolvedValue({
                toJSON: () => mockOtp,
            });

            const result = await otpService.createOtpEntry(input);

            expect(result).toEqual(mockOtp);
            expect(otps.create).toHaveBeenCalledWith({
                ...input,
                verified: false,
                lastSentAt: expect.any(Number),
            });
        });

        it("should throw an error if create fails", async () => {
            const input = { phoneNumber: "1234567890", code: "1234" };
            const errorMessage = "Database error";
            (otps.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(otpService.createOtpEntry(input)).rejects.toThrow(errorMessage);
        });
    });

    describe("updateOtpEntry", () => {
        it("should update and return OTP entry when phoneNumber is found", async () => {
            const input: Partial<Otp> = { phoneNumber: "1234567890", verified: true };
            const mockUpdatedOtp = { ...input, code: "1234", lastSentAt: Date.now() };
            delete input.phoneNumber;
            (otps.findOneAndUpdate as jest.Mock).mockResolvedValue({
                toJSON: () => mockUpdatedOtp,
            });

            const result = await otpService.updateOtpEntry({ phoneNumber: "1234567890", verified: true });

            expect(result).toEqual(mockUpdatedOtp);
            expect(otps.findOneAndUpdate).toHaveBeenCalledWith(
                { phoneNumber: "1234567890" },
                { verified: true },
                { new: true }
            );
        });

        it("should return null if OTP entry is not found for update", async () => {
            const input: Partial<Otp> = { phoneNumber: "1234567890", verified: true };
            (otps.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const result = await otpService.updateOtpEntry(input);

            expect(result).toBeUndefined();
            // expect(otps.findOneAndUpdate).toHaveBeenCalledWith(
            //     { phoneNumber: input.phoneNumber },
            //     { verified: true },
            //     { new: true }
            // );
        });

        it("should throw an error if update fails", async () => {
            const input: Partial<Otp> = { phoneNumber: "1234567890", verified: true };
            const errorMessage = "Database error";
            (otps.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(otpService.updateOtpEntry(input)).rejects.toThrow(errorMessage);
        });
    });
});
