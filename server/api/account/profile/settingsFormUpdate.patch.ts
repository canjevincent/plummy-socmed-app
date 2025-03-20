import { settingsFormUpdate } from "~/server/utils/validations/account/profileValidations";
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
  
  if (session) {

    try {
      const { email, firstName, middleName, lastName, avatarUrl } = await readValidatedBody(event, (body) => settingsFormUpdate.parseAsync(body))
      const updateUser = await prisma.user.update({
        where: {
          id: session.user?.id
        },
        data: {
          email,
          firstName,
          middleName,
          lastName,
          avatarUrl
        }
      });

      // Update the session with the new user data
      await replaceUserSession(event, {
        user: {
          ...session.user,
          email: updateUser.email,
          firstName: updateUser.firstName,
          middleName: updateUser.middleName,
          lastName: updateUser.lastName,
        }
      });

      return updateUser
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && 'data' in error && error.data instanceof ZodError) {
        const errors = transformZodErrors(error.data);
        
        // console.log(errors)

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
    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: "An unexpected error occurred. Please try again later.",
    });
  }

});