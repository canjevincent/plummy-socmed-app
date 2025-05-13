import { z } from 'zod';

// Define the PostImage type schema
const postImageSchema = z.object({
  id: z.string(),
  postId: z.string(), // Required field
  url: z.string().url({ message: 'Valid image URL is required' })
});

// Main validation schema with conditional validation
export const shareContentPost = z.object({
  content: z.string().optional(),
  postImages: z.array(postImageSchema).optional()
})
.refine(
  data => {
    // Require either content or at least one image
    return (!!data.content && data.content.trim().length > 0) || 
           (!!data.postImages && data.postImages.length > 0);
  },
  {
    message: "Content is required.",
    path: ["content"] // Associate error with content field
  }
);