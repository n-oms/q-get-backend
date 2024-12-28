import mongoose from "mongoose";
import { BlogPost } from "../types";

const blogPostSchema = new mongoose.Schema<BlogPost>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["CREDIT_CARD", "LOAN", "INSURANCE", "CIBIL"],
    },
    tags: [String],
    author: {
      name: { type: String, required: true },
      avatar: String,
    },
    publishedAt: { type: Date, default: Date.now },
    readingTime: Number,
    imageUrl: String,
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

export const BlogsModel = mongoose.model<BlogPost>("Posts", blogPostSchema);
