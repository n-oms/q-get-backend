import { ClassUtils } from "@/libs/utils/classUtils";
import { JwtService } from "../jwt/jwtService";
import { Users } from "../mongo/schema";

export const GOOGLE_PLAY_TEST_AUTH_NUMBER = "0000000000";
export const GOOGLE_PLAY_TEST_AUTH_OTP = "123456";

export class GooglePlayService {
  private readonly jwtServices: JwtService;

  constructor() {
    this.jwtServices = new JwtService();
    ClassUtils.bindMethods(this);
  }

  async getTestAccountDetails() {
    const user = await Users.findOne({
      phoneNumber: GOOGLE_PLAY_TEST_AUTH_NUMBER,
    });
    const token = await this.jwtServices.createUserToken({
      phoneNumber: GOOGLE_PLAY_TEST_AUTH_NUMBER,
    });
    return { token, user };
  }
}
