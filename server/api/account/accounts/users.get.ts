import prisma from "@/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
  return user;
});