import { z } from "zod";

export const WELCOME_MESSAGE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;


export enum WelcomeMessageTrackerApiActions {
  SEND_WELCOME_MESSAGE = "send_welcome_message",
}

export enum WelcomeMessageAllowedServices {
    Loans = "loans",
    Insurances = "insurances"
}
export enum CampaignNames {
  VENDOR_WELCOME_MESSAGE = "Vendor Welcome Message",
  WELCOME_USER_MESSAGE = "Welcome User Message",
}


export const welcomeMessageApiSchema = z.object({
  action: z.nativeEnum(WelcomeMessageTrackerApiActions),
  service: z.nativeEnum(WelcomeMessageAllowedServices),
  templateId: z.nativeEnum(CampaignNames).optional(),
});
