import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if(session.user){
    
    try {

      const roleIds = await readBody(event);
      
      // Create a transaction to update all role positions
      const updates = await prisma.$transaction(
        roleIds.map((id: string, index: number) => 
          prisma.role.update({
            where: { id },
            data: { position: index + 1 }
          })
        )
      );
      
      return updates;

      // console.log('Check role ids: ',roleIds);

    } catch (error) {

      // Handle other errors
      throw createError({
        statusCode: 500,
        statusMessage: "An unexpected error occurred. Please try again later.",
      });
    }

  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

});