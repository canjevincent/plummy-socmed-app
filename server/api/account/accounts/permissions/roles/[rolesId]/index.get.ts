import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  
  const roleId = event.context.params?.rolesId;

  // Get pagination parameters
  const query = getQuery(event);
  const skip = parseInt(query.skip as string) || 0;
  const take = parseInt(query.take as string) || 100; // Default to 100 if not specified
  const search = (query.search as string) || '';
  
  // Get role with userIds
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      title: true,
      position: true,
      permissions: true,
      userIds: true,
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          roleId: true,
          createdAt: true
        }
      }
    }
  });

  
  if (!role) return null;
  
  // Create a map for quick user lookup
  const userMap = {} as any;
  role.users.forEach(user => {
    userMap[user.id] = user;
  });
  
  // Get ordered users based on userIds
  let allOrderedUsers = role.userIds.map(id => userMap[id]).filter(Boolean);

  // Apply search filter if search term exists
  if (search) {
    const searchLower = search.toLowerCase();
    allOrderedUsers = allOrderedUsers.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply pagination to the ordered users
  const paginatedUsers = allOrderedUsers.slice(skip, skip + take);
  
  
  // Return with ordered users
  return {
    ...role,
    users: paginatedUsers,
    totalCount: allOrderedUsers.length
  };
  
});
