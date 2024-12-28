import { EnquiryServiceType } from "@/libs/constants/common";
import { z } from "zod";

export const sendEnquiryBodySchema = z.object({
    enquiryServiceType: z.nativeEnum(EnquiryServiceType),
})