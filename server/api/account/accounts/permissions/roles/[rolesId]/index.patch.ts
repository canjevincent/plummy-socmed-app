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
      
      // Convert string IDs to ObjectId format for MongoDB
      const userObjectIds = userIds.map(id => ({ $oid: id }));
      
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