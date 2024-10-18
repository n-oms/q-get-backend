
export enum OtpHandlerActions {
    SEND_OTP = "SEND_OTP",
    VERIFY_OTP = "VERIFY_OTP"
}

export type OtpApiHandlerRequest = {
    body: OtpApiHandlerInput
}

export type OtpApiHandlerInput = {
    action:OtpHandlerActions
    phoneNumber: string
    code?: string
}