import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if(session.user) {
    try {
        const postId = event.context.params?.postId;
        const { likeId } = await readBody(event);
        
        if (!postId || !likeId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Post ID and Like ID are required'
          });
        }

        const removeLike = await prisma.postLike.delete({
          where: {
            id: likeId,
            postId: postId
          }
        });

      return removeLike;
    } catch (error) {

      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred. Please try again later.'
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
});
