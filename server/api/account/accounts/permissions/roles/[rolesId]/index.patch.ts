import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if(session.user){
    
    try {
      // Get the array of user IDs from the request body
      const userIds = await readBody(event);
      const roleId = event.context.params?.rolesId;
      
      if (!roleId || !Array.isArray(userIds)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid request data. Role ID or user IDs array missing."
        });
      }

      // Get role with userIds
      const current_role = await prisma.role.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          userIds: true,
          users: {
            select: {
              id: true,
            }
          }
        }
      });

      if (!current_role) {
        throw createError({
          statusCode: 404,
          statusMessage: "Role not found"
        });
      }

      // Type assertion to handle MongoDB ObjectId format
      type MongoId = { $oid: string } | string;
      const userIdsArray = current_role.userIds as unknown as MongoId[];
      
      // Create the new ordered userIds array
      // First add the reordered userIds that were received
      // Then add any existing userIds that weren't in the received list
      const newOrderedUserIds = [
        ...userIds,
        ...userIdsArray
          .filter(id => !userIds.includes(typeof id === 'object' && '$oid' in id ? id.$oid : String(id)))
          .map(id => typeof id === 'object' && '$oid' in id ? id.$oid : String(id))
      ];

      // Convert string IDs to ObjectId format for MongoDB
      const userObjectIds = newOrderedUserIds.map(id => ({ $oid: id }));
      
      // Use $runCommandRaw to directly update the users array in the role document
      // This preserves the exact order of the userIds array
      const result = await prisma.$runCommandRaw({
        update: "Role",
        updates: [
          {
            q: { _id: { $oid: roleId } },
            u: { 
              $set: { 
                userIds: userObjectIds,
                updatedAt: { $date: new Date().toISOString() }
              } 
            }
          }
        ]
      });
      
      if (!result.ok) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to update user order"
        });
      }
      
      // Get the updated role to return
      const updatedRole = await prisma.role.findUnique({
        where: { id: roleId },
        include: { users: true }
      });
      
      return updatedRole;

    } catch (error) {
      console.error("Error updating user order:", error);
      
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