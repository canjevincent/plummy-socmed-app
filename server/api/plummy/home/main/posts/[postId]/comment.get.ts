import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if (session.user) {
    try {
      const query = getQuery(event);
      const skip = parseInt(query.skip as string) || 0;
      const take = parseInt(query.take as string) || 5;

      const comments = await prisma.postComment.findMany({
        where: {
          postId: event.context.params?.postId
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      });
    
      return comments;
    } catch (error) {
      // Handle other errors
      throw createError({
        statusCode: 500,
        statusMessage: "An unexpected error occurred. Please try again later.",
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
});