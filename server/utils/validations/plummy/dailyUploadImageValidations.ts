import { z } from "zod";

const postImageSchema = z.object({
  title: z.string(),
  url: z.string().min(1, { message: 'Image URL is required' })
});

export const dailyUploadImage = z.object({
  postImages: z.array(postImageSchema).min(1, { message: 'At least one photo is required' })
});