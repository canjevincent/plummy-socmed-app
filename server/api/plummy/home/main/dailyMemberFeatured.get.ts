import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  await requireUserSession(event);
  const session = await getUserSession(event);

  try {

    if (session.user) {
      // Get pagination parameters from query
      const query = getQuery(event);
      const skip = parseInt(query.skip as string) || 0;
      const take = parseInt(query.take as string) || 5;

      const daily = await prisma.daily.findMany({
        where: {
          userId: {
            not: session.user.id
          },
          isMyDay: true
        },
        select: {
          id: true,
          dailyUrl: true,
          user: {
            select: {
              avatarUrl: true,
              firstName: true,
              lastName: true
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      });
      
      return daily
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized"
      });
    }

  } catch (error) {

    console.error('Error fetching posts:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch posts"
    });

  }

});