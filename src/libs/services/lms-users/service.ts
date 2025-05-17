import { ClassUtils } from "@/libs/utils/classUtils";
import { NotFoundException, NotProvidedError } from "../../error/error";
import { LmsUsers } from "../mongo/models/lms-users";
import { SignInLmsUser } from "./types";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { env } from "@/env/env";

export class LmsUserService {
  constructor() {
    ClassUtils.bindMethods(this);
  }
  async signInUser(input: SignInLmsUser) {
    if (!input.username || !input.password) {
      throw new NotProvidedError("Username or password is missing");
    }

    const user = await LmsUsers.findOne({ username: input.username });

    if (!user) {
      throw new NotFoundException(
        `User not found for the username : ${input.username}`
      );
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }
    
    const token = this.createUserToken(input.username)
    return { token, user };
  }

  private createUserToken(username: string) {
    return jwt.sign({ username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY })
  }
}
