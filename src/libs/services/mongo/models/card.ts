import mongoose from "mongoose";
import { BankCard } from "../types";

const cardSchema = new mongoose.Schema<BankCard>(
  {
    cardId: { type: String },
    categories: [{ type: String, required: false }],
    title: { type: String, required: true },
    link: { type: String, required: true },
    bankName: { type: String, required: true },
    imageUrl: {
      s3Key: { type: String, required: true },
      fileType: { type: String, required: true },
      fileName: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
    bankLogo: {
      s3Key: { type: String, required: false },
      fileType: { type: String, required: false }, // Made optional
      fileName: { type: String, required: false }, // Made optional
      imageUrl: { type: String, required: false }, // Made optional
    },
    type: { type: String, enum: ["CODE", "IMAGE"], required: true },
    orientation: {
      type: String,
      enum: ["PORTRAIT", "LANDSCAPE"],
      required: true,
    },
    redirectParam: { type: String },
    benefits: {
      title: { type: String, required: true },
      items: [{ type: String, required: true }],
    },
    cardCode: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Cards =
  (mongoose.models.cards as mongoose.Model<BankCard>) ||
  mongoose.model<BankCard>("cards", cardSchema);
