import { z } from "zod";

export const getUploadUrlSchema = z.object({
  s3Key: z.string(),
  fileType: z.string(),
});
