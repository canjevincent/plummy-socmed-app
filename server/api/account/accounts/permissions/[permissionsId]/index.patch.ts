import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if (session.user) {

    try {

      const updatedPermissions = await readBody(event);
      const roleId = event.context.params?.permissionsId;
      
      const update_role_permission = await prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: updatedPermissions
        }
      });

      return update_role_permission
      
    } catch (error) {
      
      // Handle other errors
      throw createError({
        statusCode: 500,
        statusMessage: "An unexpected error occurred. Please try again later."
      });

    }

  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
});