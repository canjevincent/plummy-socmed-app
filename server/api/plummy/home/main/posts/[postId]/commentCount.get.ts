import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  try {
    const postId = event.context.params?.postId;

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Post ID is required'
      });
    }

    const count = await prisma.postComment.count({
      where: {
        postId: postId
      }
    });

    return { count };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred. Please try again later.'
    });
  }

});