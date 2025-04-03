import { Prisma } from '@prisma/client'
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Pagination
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  
  // Sorting
  const sortBy = query.sortBy as string || 'createdAt';
  const sortOrder = query.sortOrder as string || 'desc';
  
  // Filtering
  const filters = query.filters ? JSON.parse(query.filters as string) : {};
  
  // Build where clause with proper typing
  const where: Prisma.UserWhereInput = {};
  
  if (filters.email) where.email = { contains: filters.email };
  if (filters.firstName) where.firstName = { contains: filters.firstName };
  if (filters.lastName) where.lastName = { contains: filters.lastName };
  if (filters.role) where.role = filters.role;
  
  // Get data and count
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
        createdAt: true
      },
      where,
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    }),
    prisma.user.count({ where })
  ]);
  
  return {
    data: users,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize)
  };
});