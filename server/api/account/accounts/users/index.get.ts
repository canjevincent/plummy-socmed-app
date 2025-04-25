// PURPOSE - SSR 
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

  // Handle special case for sorting by role_title
  let orderBy: any = {
    [sortBy]: sortOrder
  };

  // If sorting by role_title, use a different orderBy structure
  if (sortBy === 'roleTitle') {
    orderBy = {
      role: {
        title: sortOrder
      }
    };
  }
  
  // Filtering
  const filters = query.filters ? JSON.parse(query.filters as string) : {};
  const globalSearch = query.search as string || '';
  
  // Build where clause with proper typing
  const where: Prisma.UserWhereInput = {};
  
  // Apply individual filters
  if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
  if (filters.firstName) where.firstName = { contains: filters.firstName, mode: 'insensitive' };
  if (filters.lastName) where.lastName = { contains: filters.lastName, mode: 'insensitive' };
  
  // Handle roleTitle filter - can be array or single value
  if (filters.roleTitle) {
    if (Array.isArray(filters.roleTitle)) {
      where.role = {
        title: { in: filters.roleTitle }
      };
    } else {
      where.role = {
        title: { equals: filters.roleTitle }
      };
    }
  }
  
  // Apply global search across multiple columns if provided
  if (globalSearch) {
    where.OR = [
      { email: { contains: globalSearch, mode: 'insensitive' } },
      { firstName: { contains: globalSearch, mode: 'insensitive' } },
      { lastName: { contains: globalSearch, mode: 'insensitive' } },
      { role: { title: { contains: globalSearch, mode: 'insensitive' } } }
    ];
  }
  
  // Get data and count
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        roleId: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            title: true
          }
        }
      },
      where,
      skip,
      take: pageSize,
      orderBy
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