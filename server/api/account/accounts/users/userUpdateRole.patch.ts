import { userRoleUpdate } from "~/server/utils/validations/account/usersValidations";
import { ZodError } from "zod";
import prisma from "~/lib/prisma";

const transformZodErrors = (zodError: ZodError) => {
  const errors: Record<string, string> = {};

  zodError.errors.forEach((error) => {
    const field = error.path[0]; 
    errors[field] = error.message; 
  });

  return errors;
};

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const session = await getUserSession(event);

  if(session.user){
    
    try {
      const { userId, newRoleId } = await readValidatedBody(event, (body) => userRoleUpdate.parse(body));

      const user = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          roleId: newRoleId,
        }
      });
      
      return user;

    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && 'data' in error && error.data instanceof ZodError) {
        const errors = transformZodErrors(error.data);
        
        throw createError({
          statusCode: 400,
          statusMessage: "Validation failed",
          data: { errors }, // Return structured error messages
        });
      }

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