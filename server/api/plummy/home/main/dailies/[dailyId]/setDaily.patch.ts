import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  await requireUserSession(event);
  const session = await getUserSession(event);

  if (session.user) {

    try {

      // Find the existing daily "where userId == current session user and id != event.content.params?.dailyId"
      const find_existing_daily = await prisma.daily.findFirst({
        where: {
          userId: session.user.id,
          isMyDay: true,
          id: {
            not: event.context.params?.dailyId
          }
        }
      });

      // If find_existing_daily exists, then update ismyDay to false with the same "Where Condition"
      if (find_existing_daily?.id) {
        const update_existing_daily = await prisma.daily.update({
          where: {
            id: find_existing_daily.id
          },
          data: {
            isMyDay: false
          }
        });
      }

      // Finally, Update the selected myday to true
      const daily_set = await prisma.daily.update({
        where: {
          userId:session.user.id,
          id:event.context.params?.dailyId
        },
        data: {
          isMyDay:true
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