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
  private readonly BASE_URL = process.env.SBI_LEAD_URL;

  constructor() {
    console.log("LeadService initialized with BASE_URL:", this.BASE_URL);
  }

  private RSAUtil = {
    encrypt: (data: string, publicKey: crypto.KeyObject, algorithm: string) => {
      console.log("RSAUtil.encrypt - Starting encryption with algorithm:", algorithm);
      try {
        const encrypted = crypto
          .publicEncrypt(
            {
              key: publicKey,
              padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(data)
          )
          .toString("base64");
        console.log("RSAUtil.encrypt - Encryption successful");
        return encrypted;
      } catch (error) {
        console.error("RSAUtil.encrypt - Encryption failed:", error);
        throw error;
      }
    },
  };

  private AES256Util = {
    decryptAES: (encryptedText: string, keyBase64: string, ivHex: string): string => {
      console.log("AES256Util.decryptAES - Starting decryption");
      try {
        const key = Buffer.from(keyBase64, "base64");
        const iv = Buffer.from(ivHex, "hex");
        console.log("AES256Util.decryptAES - IV length:", iv.length);
        
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = Buffer.concat([
          decipher.update(Buffer.from(encryptedText, "base64")),
          decipher.final(),
        ]);
        console.log("AES256Util.decryptAES - Decryption successful");
        return decrypted.toString("utf8");
      } catch (error) {
        console.error("AES256Util.decryptAES - Decryption failed:", error);
        throw error;
      }
    },
  };

  private getPublicKey(inputFile: string): crypto.KeyObject {
    console.log("getPublicKey - Reading certificate file:", inputFile);
    try {
      const certPath = path.join(__dirname, inputFile);
      console.log("getPublicKey - Certificate path:", certPath);
      
      const cert = fs.readFileSync(certPath);
      const publicKey = crypto.createPublicKey(cert);
      console.log("getPublicKey - Successfully loaded public key");
      return publicKey;
    } catch (error) {
      console.error("getPublicKey - Failed to load public key:", error);
      throw error;
    }
  }

  private async performEncryption(plainText: string) {
    console.log("performEncryption - Starting encryption process");
    console.log("performEncryption - Plain text length:", plainText.length);

    try {
      const saltBytes = crypto.randomBytes(20);
      console.log("performEncryption - Generated salt bytes length:", saltBytes.length);

      console.log("performEncryption - Deriving key with PBKDF2");
      const key = await util.promisify(crypto.pbkdf2)(
        this.TOKEN,
        saltBytes,
        this.PWD_ITERATIONS,
        this.KEY_SIZE / 8,
        this.SECRET_KEY_FACTORY_ALGORITHM
      );
      console.log("performEncryption - Key derivation successful");

      const aesKeyBase64String = Buffer.from(key).toString("base64");
      console.log("performEncryption - AES key converted to base64");

      const ivBytes = crypto.randomBytes(16);
      const ivBase64String = Buffer.from(ivBytes).toString("base64");
      const ivHex = Buffer.from(ivBytes).toString("hex");
      console.log("performEncryption - Generated IV bytes length:", ivBytes.length);

      const cipher = crypto.createCipheriv(this.KEY_ALGORITHM, key, ivBytes);
      const encryptedText = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
      ]);
      const encodedText = encryptedText.toString("base64");
      console.log("performEncryption - Text encryption successful");

      const concatenatedIVAndAes = `${ivBase64String}|${aesKeyBase64String}`;
      console.log("performEncryption - Starting RSA encryption of IV and AES key");
      const encodedToken = this.RSAUtil.encrypt(
        concatenatedIVAndAes,
        this.getPublicKey("sprint.pem"),
        "RSA"
      );
      console.log("performEncryption - RSA encryption successful");

      return {
        encodedText,
        encodedToken,
        aesKeyBase64String,
        ivHex,
      };
    } catch (error) {
      console.error("performEncryption - Encryption process failed:", error);
      throw error;
    }
  }

  private async postData(body: any, headers: any, endpoint: string) {
    console.log("postData - Starting API request to endpoint:", endpoint);
    console.log("postData - Request headers:", JSON.stringify(headers, null, 2));
    console.log("postData - Request body keys:", Object.keys(body));

    try {
      const response = await axios.post(`${this.BASE_URL}${endpoint}`, body, {
        headers,
      });
      console.log("postData - API request successful");
      console.log("postData - Response status:", response.status);
      console.log("postData - Response data keys:", Object.keys(response.data));
      return response.data;
    } catch (error) {
      console.error("postData - API request failed:", error);
      console.error("postData - Error response:", error.response?.data);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async login() {
    console.log("login - Starting login process");
    try {
      const reqBody = {
        user: process.env.USER_QGET,
        pass: process.env.PASS_QGET,
        filler1: process.env.FILLER1_QGET,
      };
      console.log("login - Environment variables loaded successfully");

      console.log("login - Starting request encryption");
      const { encodedText, encodedToken, aesKeyBase64String, ivHex } =
        await this.performEncryption(JSON.stringify(reqBody));
      console.log("login - Request encryption completed");

      const body = {
        encData: encodedText,
        encToken: encodedToken,
      };

      const headers = {
        IDENTIFIER_1: "Q_GET",
      };

      console.log("login - Making token generation API call");
      const apiResponse = await this.postData(
        body,
        headers,
        "/oAuth/tokenGenPartner"
      );
      console.log("login - Token generation API call successful");

      console.log("login - Decrypting response");
      const decrypted = this.AES256Util.decryptAES(
        apiResponse.encResponse,
        aesKeyBase64String,
        ivHex
      );
      const responseJson = JSON.parse(decrypted);
      console.log("login - Response decryption successful. Response JSON is :",responseJson.data);
      console.log("login - Response :",{
        token: responseJson.data.accessToken,
        xSbicUserFgp: responseJson.data.xSbicUserFgp
      });

      return {
        token: responseJson.data.accessToken,
        xSbicUserFgp: responseJson.data.xSbicUserFgp
      };
    } catch (error) {
      console.error("login - Login process failed:", error);
      throw error;
    }
  }

  async createLead(leadData: Partial<ILead>) {
    console.log("createLead - Starting lead creation process");
    console.log("createLead - Input lead data:", JSON.stringify(leadData, null, 2));

    try {
      console.log("createLead - Initiating login");
      const loginResponse = await this.login();
      console.log("createLead - Login successful! Response is:",loginResponse);

      const requestData = {
        data: leadData,
        action: "LG-Create-Lead",
        type: "SPRINT_Partner",
      };
      console.log("createLead - Prepared request data:", JSON.stringify(requestData, null, 2));

      console.log("createLead - Starting request encryption");
      const { encodedText, encodedToken, aesKeyBase64String, ivHex } =
        await this.performEncryption(JSON.stringify(requestData));
      console.log("createLead - Request encryption completed");

      const body = {
        encData: encodedText,
        encToken: encodedToken,
      };

      const headers = {
        Authorization: `Bearer ${loginResponse.token}`,
        Cookie: `x-sbic-user-fgp=${loginResponse.xSbicUserFgp}`,
        IDENTIFIER_1: "Q_GET",
      };

      console.log("createLead - Making lead generation API call");
      const apiResponse = await this.postData(
        body,
        headers,
        "/swiftapp-partner/lead-generator"
      );
      console.log("createLead - Lead generation API call successful");

      console.log("createLead - Decrypting response");
      const decrypted = this.AES256Util.decryptAES(
        apiResponse.encResponse,
        aesKeyBase64String,
        ivHex
      );
      console.log("Unparsed Data:",decrypted)
      const responseJson = JSON.parse(decrypted);
      console.log("createLead - Response decryption successful! Response Json is:",responseJson);
      console.log("createLead - Decrypted response:", JSON.stringify(responseJson.data, null, 2));

      console.log("createLead - Saving lead to MongoDB");
      const lead = await Leads.create({
        ...leadData,
        leadID: responseJson.data.leadID,
        status: responseJson.data.status,
      });
      console.log("createLead - Lead saved successfully with ID:", lead._id);

      return {
        lead,
        apiResponse: responseJson.data,
      };
    } catch (error) {
      console.error("createLead - Lead creation failed:", error);
      console.error("createLead - Error stack:", error.stack);
      throw new Error(`Lead creation failed: ${error.message}`);
    }
  }

  async queryLeads(queryObject: Record<string, any> = {}) {
    console.log("queryLeads - Starting query with filters:", JSON.stringify(queryObject, null, 2));
    try {
      const leads = await Leads.find(queryObject);
      console.log("queryLeads - Query successful, found records:", leads.length);
      return leads;
    } catch (error) {
      console.error("queryLeads - Query failed:", error);
      throw error;
    }
  }

  async getLeadById(leadId: string) {
    console.log("getLeadById - Searching for lead:", leadId);
    try {
      const lead = await Leads.findOne({ leadID: leadId });
      console.log("getLeadById - Search result:", lead ? "Lead found" : "Lead not found");
      return lead;
    } catch (error) {
      console.error("getLeadById - Search failed:", error);
      throw error;
    }
  }

  async getLeadsByUserId(userId: string) {
    console.log("getLeadsByUserId - Searching leads for user:", userId);
    try {
      const leads = await Leads.find({ userId });
      console.log("getLeadsByUserId - Found leads count:", leads.length);
      return leads;
    } catch (error) {
      console.error("getLeadsByUserId - Search failed:", error);
      throw error;
    }
  }
}