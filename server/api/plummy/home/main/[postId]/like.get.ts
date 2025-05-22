import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if (session.user) {
    try {
      const query = getQuery(event);
      const skip = parseInt(query.skip as string) || 0;
      const take = parseInt(query.take as string) || 5;
      const emojiId = query.emojiId as string | undefined;

      const likes = await prisma.postLike.findMany({
        where: {
          postId: event.context.params?.postId,
          ...(emojiId && { emoji_id: emojiId })
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              email: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take        
      });

      return likes;
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