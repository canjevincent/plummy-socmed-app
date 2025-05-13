import { z } from 'zod';

export const postComment = z.object({
  postId: z.string().min(1, { message: 'Post id is required' }),
  comment: z.string().min(1, { message: 'Comment is required' }),
});