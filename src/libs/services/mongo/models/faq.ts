import mongoose from "mongoose";
import { Faqs as FaqsType } from "../types";

export const Faqs = new mongoose.Schema<FaqsType>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      required: false,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const FaqModel = mongoose.model<FaqsType>("Faqs", Faqs);
