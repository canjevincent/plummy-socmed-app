import { z } from 'zod';

export const postLike = z.object({
  postId: z.string().min(1, { message: 'Post id is required' }),
  emoji: z.string().min(1, { message: 'Emoji is required' }),
  emoji_name: z.string().min(1, { message: 'Emoji name is required' }),
  emoji_id: z.string().min(1, { message: 'Emoji id is required' }),
});
