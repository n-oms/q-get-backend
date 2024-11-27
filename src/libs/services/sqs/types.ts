export type SendMessageInput = {
    queueUrl: string;
    messageBody: unknown
}
export type QueuePayload = {
    message: Record<string, any>;
    queueUrl?: string;
}