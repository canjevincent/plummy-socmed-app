import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const roles = await prisma.role.findMany({
    orderBy: {
      position: 'asc'
    }
  });
  return roles;
});