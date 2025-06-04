import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  await requireUserSession(event);
  const session = await getUserSession(event);

  if (session.user) {

    try {

      const daily_set = await prisma.daily.update({
        where: {
          id:event.context.params?.dailyId
        },
        data: {
          isMyDay:false
        }
      });

      return daily_set;

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
    })
  }

});