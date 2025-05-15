import { ClassUtils } from "@/libs/utils/classUtils";
import { NotFoundException, NotProvidedError } from "../../error/error";
import { LmsUsers } from "../mongo/models/lms-users";
import { SignInLmsUser } from "./types";
import bcrypt from "bcryptjs";

export class LmsUserService {
  constructor() {
    ClassUtils.bindMethods(this);
  }
  async signInUser(input: SignInLmsUser) {
    if (!input.username || !input.password) {
      throw new NotProvidedError("Username or password is missing");
    }

    const user = await LmsUsers.findOne({ username: input.username });
    console.log("User", user);
    if (!user) {
      throw new NotFoundException(
        `User not found for the username : ${input.username}`
      );
    }
    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    return user;
  }
}
