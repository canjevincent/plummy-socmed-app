import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  console.log("Check role permissions id: ",event.context.params?.permissionsId);
  const role_permissions = await prisma.role.findUnique({
    where: {
      id: event.context.params?.permissionsId
    },
    select: {
      title: true,
      permissions: true
    }
  });
  return role_permissions || {};
})