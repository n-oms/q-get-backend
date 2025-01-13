import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import axios from "axios";
import { ILead } from "./types";
import { Leads } from "../mongo/models/sbi-lead";

export class LeadService {
  private readonly TOKEN = "Partner-API";
  private readonly PWD_ITERATIONS = 65536;
  private readonly KEY_SIZE = 256;
  private readonly KEY_ALGORITHM = "aes-256-cbc";
  private readonly SECRET_KEY_FACTORY_ALGORITHM = "sha1";
  private readonly BASE_URL =
    "https://sbi-dev7.sbicard.com/api-gateway/resource";

  private RSAUtil = {
    encrypt: (data: string, publicKey: crypto.KeyObject, algorithm: string) => {
      return crypto
        .publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          Buffer.from(data)
        )
        .toString("base64");
    },
  };

  private AES256Util = {
    decryptAES: (
      encryptedText: string,
      keyBase64: string,
      ivHex: string
    ): string => {
      const key = Buffer.from(keyBase64, "base64");
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedText, "base64")),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    },
  };

  private getPublicKey(inputFile: string): crypto.KeyObject {
    const certPath = path.join(__dirname, inputFile);
    const cert = fs.readFileSync(certPath);
    return crypto.createPublicKey(cert);
  }

  private async performEncryption(plainText: string) {
    const saltBytes = crypto.randomBytes(20);
    const key = await util.promisify(crypto.pbkdf2)(
      this.TOKEN,
      saltBytes,
      this.PWD_ITERATIONS,
      this.KEY_SIZE / 8,
      this.SECRET_KEY_FACTORY_ALGORITHM
    );
    const aesKeyBase64String = Buffer.from(key).toString("base64");

    const ivBytes = crypto.randomBytes(16);
    const ivBase64String = Buffer.from(ivBytes).toString("base64");
    const ivHex = Buffer.from(ivBytes).toString("hex");

    const cipher = crypto.createCipheriv(this.KEY_ALGORITHM, key, ivBytes);
    const encryptedText = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);
    const encodedText = encryptedText.toString("base64");

    const concatenatedIVAndAes = `${ivBase64String}|${aesKeyBase64String}`;
    const encodedToken = this.RSAUtil.encrypt(
      concatenatedIVAndAes,
      this.getPublicKey("sprint.pem"),
      "RSA"
    );

    return {
      encodedText,
      encodedToken,
      aesKeyBase64String,
      ivHex,
    };
  }

  private async postData(body: any, headers: any, endpoint: string) {
    try {
      const response = await axios.post(`${this.BASE_URL}${endpoint}`, body, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async login() {
    const reqBody = {
      user: process.env.USER_QGET,
      pass: process.env.PASS_QGET,
      filler1: process.env.FILLER1_QGET,
    };

    const { encodedText, encodedToken, aesKeyBase64String, ivHex } =
      await this.performEncryption(JSON.stringify(reqBody));

    const body = {
      encData: encodedText,
      encToken: encodedToken,
    };

    const headers = {
      IDENTIFIER_1: "Q_GET",
    };

    const apiResponse = await this.postData(
      body,
      headers,
      "/oAuth/tokenGenPartner"
    );
    const decrypted = this.AES256Util.decryptAES(
      apiResponse.apiResponse,
      aesKeyBase64String,
      ivHex
    );
    const responseJson = JSON.parse(decrypted);

    return {
      token: responseJson.access_token,
      xSbicUserFgp: responseJson["x-sbic-user-fgp"],
    };
  }

  async createLead(leadData: Partial<ILead>) {
    try {
      const loginResponse = await this.login();
      const { encodedText, encodedToken, aesKeyBase64String, ivHex } =
        await this.performEncryption(
          JSON.stringify({
            ...leadData,
            action: "LG-Create-Lead",
            type: "SPRINT_Partner",
          })
        );

      const body = {
        encData: encodedText,
        encToken: encodedToken,
      };

      const headers = {
        Authorization: `Bearer ${loginResponse.token}`,
        Cookie: loginResponse.xSbicUserFgp,
        IDENTIFIER_1: "Q_GET",
      };

      const apiResponse = await this.postData(
        body,
        headers,
        "/swiftapp-partner/lead-generator"
      );
      const decrypted = this.AES256Util.decryptAES(
        apiResponse.apiResponse,
        aesKeyBase64String,
        ivHex
      );
      const responseJson = JSON.parse(decrypted);

      // Save lead to MongoDB
      const lead = await Leads.create({
        ...leadData,
        leadID: responseJson.leadID,
        status: responseJson.status,
      });

      return {
        lead,
        apiResponse: responseJson,
      };
    } catch (error) {
      throw new Error(`Lead creation failed: ${error.message}`);
    }
  }

  async queryLeads(queryObject: Record<string, any> = {}) {
    return await Leads.find(queryObject);
  }

  async getLeadById(leadId: string) {
    return await Leads.findOne({ leadID: leadId });
  }

  async getLeadsByUserId(userId: string) {
    return await Leads.find({ userId });
  }
}
