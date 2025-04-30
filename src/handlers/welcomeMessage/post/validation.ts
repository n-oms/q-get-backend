import { z } from "zod";

export const WELCOME_MESSAGE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;


export enum WelcomeMessageTrackerApiActions {
  SEND_WELCOME_MESSAGE = "send_welcome_message",
}

export enum WelcomeMessageAllowedServices {
    Loans = "loans",
    Insurances = "insurances"
}

export const welcomeMessageApiSchema = z.object({
  action: z.nativeEnum(WelcomeMessageTrackerApiActions),
  service: z.nativeEnum(WelcomeMessageAllowedServices),
  campaignName: z.string().optional(),
});
