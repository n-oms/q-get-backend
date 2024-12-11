import mongoose from "mongoose";

const messageSchema = new mongoose.Schema( {},{ timestamps: true, strict: false });

export const Messages = mongoose.model("usermessages", messageSchema);
