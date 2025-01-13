import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import axios from 'axios';

// TypeScript Code for Lead Generator API

// Request Header Interface
interface LeadGeneratorRequestHeader {
    Authorization: string; // Bearer token
    Cookie: string; // 'x-sbic-user-fgp' value
    IDENTIFIER_1: string; // Required identifier
    IDENTIFIER_2?: string; // Optional identifier
  }
  
  // Request Body Interface
  interface LeadGeneratorRequestBody {
    data: {
      firstName: string; // Max 12 characters, Regex: [a-zA-Z]*
      middleName?: string; // Max 10 characters, Regex: [a-zA-Z\s]*
      lastName: string; // Max 16 characters, Regex: [a-zA-Z]*
      mobileNumber: string; // Exactly 10 digits, Regex: [0-9]
      emailID: string; // Max 50 characters, Regex: [A-Za-z0-9\.\@_-]*
      sourceCode: string; // Max 15 characters, Regex: [a-zA-Z0-9]*
      lgAgentID?: string; // Max 20 characters, Regex: [a-zA-Z0-9]*
      cardType: "VISC" | "VPTL" | "PULM" | "CSC1" | "SSU1"; // Enum of valid card types
      lgUID: string; // Max 120 characters, Regex: [a-zA-Z0-9]*
      breCode?: string; // Max 9 characters, Regex: [0-9]*
      channelCode: string; // Max 4 characters, Regex: [a-zA-Z]*
      leadSource: string; // Max 30 characters, Regex: [a-zA-Z0-9]*
      filler1?: string;
      filler2?: string;
      filler3?: string;
      filler4?: string;
      filler5?: string;
      action: "LG-Create-Lead"; // Constant value
      type: "SPRINT_Partner"; // Constant value
    };
  }
  
  // Response Interface
  interface LeadGeneratorResponse {
    data: {
      leadID?: string; // Max 15 characters
      C2bURL?: string; // Max 150 characters
      filler1?: string;
      filler2?: string;
      filler3?: string;
      filler4?: string;
      filler5?: string;
      status?: string;
      statusCode?: string;
      message?: string;
    };
  }
  
  // Sample Encrypted Request/Response
  interface EncryptedRequest {
    encData: string;
    encToken: string;
  }
  
  interface EncryptedResponse {
    encResponse: string;
  }
  
  // Error Dictionary
  enum LeadGeneratorErrorCodes {
    SUCCESS = "000", // Lead Created Successfully
    VALIDATION_FAILED = "100", // Request Validation Failed
    DUPLICATE_LEAD = "105", // Duplicate Lead Found
    RESPONSE_ERROR = "900", // Error occurred while generating the response
    LEAD_CREATION_ERROR = "901", // Error occurred while Lead Creation
    TIMEOUT = "910", // Downstream Service Timeout
    SERVICE_DOWN = "911", // Downstream Service Down
    GENERIC_FAILURE = "999", // Generic Failure
  }
  
  // Endpoint and HTTP Method
  const LeadGeneratorEndpoint = "https://sbi-dev7.sbicard.com/api-gateway/resource/swiftapp-partner/lead-generator";
  const LeadGeneratorHttpMethod = "POST";
  
  export {
    LeadGeneratorRequestHeader,
    LeadGeneratorRequestBody,
    LeadGeneratorResponse,
    EncryptedRequest,
    EncryptedResponse,
    LeadGeneratorErrorCodes,
    LeadGeneratorEndpoint,
    LeadGeneratorHttpMethod,
  };
    
async function leadAPI() {
    const loginResponse = await loginAPI();
    const TOKEN = 'Partner-API';
    const pwdIterations = 65536;
    const keySize = 256;
    const keyAlgorithm = 'aes-256-cbc';
    const secretKeyFactoryAlgorithm = 'sha1';

    // Generate random salt
    const saltBytes = crypto.randomBytes(20);

    try {
        
        const reqBody = {
            "firstName": "Arun",
            "middleName": "Kumar",
            "lastName": "Bakht",
            "mobileNumber": "8086591015",
            "emailID": "revista2k12@gmail.com",
            "sourceCode": "LGMA1",
            "lgAgentID": "TAgent007",
            "cardType": "VISC",
            "lgUID": "LG-a2e9sdioj",
            "breCode": "600102540",
            "channelCode": "OMLG",
            "leadSource": "LG",
            "gemId1": "LG_PartnerName",
            "gemId2": "LG_PartnerName",
            "filler1": "DBC2C3B4",
            "action": "LG-Create-Lead",
            "type": "SPRINT_Partner"
        };
      
        //const plainText = "{'applicationNumber':2230308000000, 'leadRefNo':1128219822}";
        const plainText = JSON.stringify(reqBody);
        // Derive key using PBKDF2
        const key = await util.promisify(crypto.pbkdf2)(TOKEN, saltBytes, pwdIterations, keySize / 8, secretKeyFactoryAlgorithm);
        const aesKeyBase64String = Buffer.from(key).toString('base64');

        // Generate IV
        const ivBytes = crypto.randomBytes(16);
        const ivBase64String = Buffer.from(ivBytes).toString('base64');

        const ivHex = Buffer.from(ivBytes).toString('hex');

        // Encrypt plaintext
        const cipher = crypto.createCipheriv(keyAlgorithm, key, ivBytes);
        const encryptedText = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const encodedText = encryptedText.toString('base64');

        const concatenatedIVAndAes = `${ivBase64String}|${aesKeyBase64String}`;
        const encodedToken = RSAUtil.encrypt(concatenatedIVAndAes, getPublicKey('sprint.pem'), 'RSA');

        console.log('encodedText:', encodedText);
        console.log('encodedToken:', encodedToken);
        const body = {
            "encData": encodedText,
            "encToken": encodedToken
        }
        const headers = {
            Authorization: `Bearer ${loginResponse?.token}`,
            Cookie: loginResponse?.xSbicUserFgp,
            IDENTIFIER_1: "Q_GET"
        };
        console.log('headers:', headers);
        const url = 'https://sbi-dev7.sbicard.com/api-gateway/resource/swiftapp-partner/lead-generator';
        const apiResponse:any = await postData(body, headers, url)
        console.log('apiResponse',apiResponse)
        const encryptedResText = apiResponse.apiResponse; // Assuming the encrypted response is in response.data
         const decrypted = AES256Util.decryptAES(encryptedResText, aesKeyBase64String, ivHex);
        console.log('decrypted:', decrypted);
        const responseJson = JSON.parse(decrypted);
        return responseJson;
    } catch (error) {
        util.inspect(error, { showHidden: true, depth: null })
    }
}

async function loginAPI() {
    const TOKEN = 'Partner-API';
    const pwdIterations = 65536;
    const keySize = 256;
    const keyAlgorithm = 'aes-256-cbc';
    const secretKeyFactoryAlgorithm = 'sha1';

    // Generate random salt
    const saltBytes = crypto.randomBytes(20);

    try {
        const reqBody = {
            user: "LG_Q_GET",
            pass: "0B3a7F23$7",
            filler1: "DBC2C3B4"
        }
      
        //const plainText = "{'applicationNumber':2230308000000, 'leadRefNo':1128219822}";
        const plainText = JSON.stringify(reqBody);
        // Derive key using PBKDF2
        const key = await util.promisify(crypto.pbkdf2)(TOKEN, saltBytes, pwdIterations, keySize / 8, secretKeyFactoryAlgorithm);
        const aesKeyBase64String = Buffer.from(key).toString('base64');

        // Generate IV
        const ivBytes = crypto.randomBytes(16);
        const ivBase64String = Buffer.from(ivBytes).toString('base64');

        const ivHex = Buffer.from(ivBytes).toString('hex');

        // Encrypt plaintext
        const cipher = crypto.createCipheriv(keyAlgorithm, key, ivBytes);
        const encryptedText = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const encodedText = encryptedText.toString('base64');

        const concatenatedIVAndAes = `${ivBase64String}|${aesKeyBase64String}`;
        const encodedToken = RSAUtil.encrypt(concatenatedIVAndAes, getPublicKey('sprint.pem'), 'RSA');

        console.log('encodedText:', encodedText);
        console.log('encodedToken:', encodedToken);
        const body = {
            "encData": encodedText,
            "encToken": encodedToken
        }
        const headers = {
            IDENTIFIER_1:"Q_GET"
        }
        const url = 'https://sbi-dev7.sbicard.com/api-gateway/resource/oAuth/tokenGenPartner';
        const apiResponse:any = await postData(body, headers, url)
        console.log('apiResponse',apiResponse)
        const encryptedResText = apiResponse.apiResponse; // Assuming the encrypted response is in response.data
         const decrypted = AES256Util.decryptAES(encryptedResText, aesKeyBase64String, ivHex);
        console.log('decrypted:', decrypted);
        const responseJson = JSON.parse(decrypted);
        return {
            token: responseJson.access_token, // Extract JWT token
            xSbicUserFgp: responseJson["x-sbic-user-fgp"], // Extract 'x-sbic-user-fgp'
          };
    } catch (error) {
        util.inspect(error, { showHidden: true, depth: null })
    }
}

async function postData(body,header,url) {

    const headers = header;
    try {
        const response = await axios.post(url, body, { headers });
        util.inspect(response, { showHidden: true, depth: null });
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

function getPublicKey(inputFile: string): crypto.KeyObject {
    const certPath = path.join(__dirname, inputFile);
    const cert = fs.readFileSync(certPath);
    const publicKey = crypto.createPublicKey(cert);
    return publicKey;
}

const RSAUtil = {
    encrypt: (data: string, publicKey: crypto.KeyObject, algorithm: string) => {
        return crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, Buffer.from(data)).toString('base64');
    }
};

const AES256Util = {
    decryptAES: (encryptedText: string, keyBase64: string, ivHex: string): string => {
        const key = Buffer.from(keyBase64, 'base64');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]);
        return decrypted.toString('utf8');
    }
};
jest.setTimeout(10000);

describe('Module - Encrypt and Decrypt', () => {
    it(' Able to encrypt and decrypt', async () => { 
        try {
            await loginAPI();
        } catch (error) {
            console.log(error); 
        }
    });
});