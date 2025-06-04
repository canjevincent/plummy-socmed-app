import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  await requireUserSession(event);
  const session = await getUserSession(event);

  try {

    if (session.user) {
      const daily = await prisma.daily.findFirst({
        where:{
          userId:session.user.id,
          isMyDay: true
        },
        include:{
          user:{
            select: {
              avatarUrl: true
            }
          }
        }
      })
      return { dailyUrl:daily.dailyUrl, avatarUrl:daily.avatarUrl }
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