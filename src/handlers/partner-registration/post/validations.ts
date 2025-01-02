import { z } from "zod";

export enum PartnerRegistrationHandlerActions {
    CREATE_PARTNER_REGISTRATION = "CREATE_PARTNER_REGISTRATION",
    VERIFY_PARTNER_REGISTRATION = "VERIFY_PARTNER_REGISTRATION",
    RESEND_OTP = "RESEND_OTP",
}

export const partnerRegistartionPostApiHandler = z.object({
    action: z.nativeEnum(PartnerRegistrationHandlerActions),
    data: z.any(),
})