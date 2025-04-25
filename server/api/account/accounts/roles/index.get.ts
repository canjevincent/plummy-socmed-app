// PURPOSE - CSR
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const roles = await prisma.role.findMany({
    select: {
      title: true,
      createdAt: true,
      createdBy: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return roles;
});