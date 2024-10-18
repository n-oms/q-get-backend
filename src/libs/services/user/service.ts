import { users } from "../mongo/schema"

export class UserService {
    async getUserByPhoneNumber({ phoneNumber }: { phoneNumber: string }) {
        const result = await users.findOne({ phoneNumber })
        return result.toJSON()
    }
}