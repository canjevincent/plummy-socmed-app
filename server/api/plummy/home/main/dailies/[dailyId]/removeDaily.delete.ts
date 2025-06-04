import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);
  if(session.user) {
    const daily = await prisma.daily.delete({
      where: {
        id: event.context.params?.dailyId
      }
    });
    return daily;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized. You don't have admin access."
    })
  }
})