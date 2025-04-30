// src/libs/services/whatsapp/service.ts
import axios from "axios";
import { env } from "@/env/env";
import { ClassUtils } from "@/libs/utils/classUtils";

export class WhatsappService {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor() {
    this.baseURL = env.WHATSAPP_API_URL;
    this.apiKey = env.WHATSAPP_API_KEY;
    ClassUtils.bindMethods(this);
  }

  async sendWelcomeMessage({ to, campaignName = "Welcome User Message" }: { to: string; campaignName?: string }) {
    return await this.sendMessage({
      to,
      parameters: [to, "https://q-get.in"],
      campaignName,
    });
  }

  async sendMessage({
    campaignName,
    to,
    parameters,
  }: {
    to: string;
    parameters: string[];
    campaignName: string;
  }) {
    try {
      const body = this.prepareBody({
        apiKey: this.apiKey,
        campaignName,
        parameters,
        to,
      });
      const response = await axios.post(this.baseURL, body);
      return { ok: true, data: response.data };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return { ok: false, error };
    }
  }

  private prepareBody({
    apiKey,
    campaignName,
    parameters,
    to,
  }: {
    to: string;
    parameters: string[];
    campaignName: string;
    apiKey: string;
  }) {
    return {
      apiKey,
      campaignName,
      destination: "91" + to,
      userName: "Q-GET",
      templateParams: parameters,
      source: "new-landing-page form",
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {},
      paramsFallbackValue: {
        FirstName: "user",
      },
    };
  }
}