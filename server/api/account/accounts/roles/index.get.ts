import prisma from "~/lib/prisma";
import { z } from "zod";

const orderByFields = [
  'id',
  'email',
  'firstName',
  'lastName',
  'role',
  'createdAt',
  'updatedAt'
] as const;

const roleValues = [
  'ADMIN',
  'USER'
] as const;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Validate and parse query parameters
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(10),
      sortColumn: z.enum(orderByFields).optional().default('createdAt'),
      sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
      search: z.string().optional(),
      role: z.enum(roleValues).optional()
    });

    const parsedQuery = querySchema.parse(query);

    // Build dynamic where clause for filtering
    const whereClause: any = {};
    
    if (parsedQuery.search) {
      whereClause.OR = [
        { firstName: { contains: parsedQuery.search, mode: 'insensitive' } },
        { lastName: { contains: parsedQuery.search, mode: 'insensitive' } },
        { email: { contains: parsedQuery.search, mode: 'insensitive' } }
      ];
    }
    
    if (parsedQuery.role) {
      whereClause.role = parsedQuery.role;
    }

    // Build dynamic orderBy clause
    const orderBy = {
      [parsedQuery.sortColumn]: parsedQuery.sortDirection
    };

    // Fetch total count for pagination
    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy,
        skip: (parsedQuery.page - 1) * parsedQuery.pageSize,
        take: parsedQuery.pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    return {
      data: users,
      meta: {
        page: parsedQuery.page,
        pageSize: parsedQuery.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / parsedQuery.pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch users'
    });
  }
});