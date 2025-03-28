import { usersCreate } from "~/server/utils/validations/account/usersValidations";
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

  if(session.user) {

    try {
      const { firstName, middleName, lastName, email } = await readValidatedBody(event, (body) => usersCreate.parseAsync(body));

      const hashedPassword = await hashPassword('admin2025');

      const user = await prisma.user.create({
        data: {
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: email,
          hashedPassword:hashedPassword
        }
      })

      return user;
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
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

});