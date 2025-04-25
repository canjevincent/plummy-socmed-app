import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  
  const roleId = event.context.params?.rolesId;
  
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
  
  // Return with ordered users
  const orderedUsers = role.userIds.map(id => userMap[id]).filter(Boolean);
  
  
  // Return with ordered users
  return {
    ...role,
    users: orderedUsers
  };
  
});
