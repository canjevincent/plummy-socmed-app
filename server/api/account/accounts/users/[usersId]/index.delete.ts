import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);
  if(session.user) {
    const user = await prisma.user.delete({
      where: {
        id: event.context.params?.usersId
      }
    });
    return user;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized. You don't have admin access."
    })
  }
})