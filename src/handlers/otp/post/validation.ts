import { z } from "zod";
import { OtpHandlerActions } from "./types";
import { DeviceType } from "@/libs/types/common";

export const otpPostApiSchema = z.object({
  action: z.nativeEnum(OtpHandlerActions),
  phoneNumber: z.string(),
  code: z.string().optional(),
  name: z.string().optional(),
  scannedVendorId: z.string().optional(),
  deviceType: z.nativeEnum(DeviceType).optional(),
  isNewUser: z.boolean().optional(),
});
