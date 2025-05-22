import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => { 
  await requireUserSession(event);
  const session = await getUserSession(event);
  if (session.user) {
    try {
      const postId = event.context.params?.postId;

      if (!postId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Post ID and User ID are required'
        });
      }
      
      const postLiked = await prisma.postLike.findFirst({
        where: {
          postId: postId,
          userId: session.user.id
        }
      });
      
      return postLiked;

    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred. Please try again later.'
      });
    }
  }
});
