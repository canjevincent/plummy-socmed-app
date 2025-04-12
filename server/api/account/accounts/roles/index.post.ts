import { rolesCreate } from "~/server/utils/validations/account/rolesValidations";
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
  const session = await requireUserSession(event);

  if (session.user) {

    try {

      const { title } = await readValidatedBody(event, (body) => rolesCreate.parseAsync(body));

      const getNewPosition = await prisma.role.findMany({
        orderBy: {
          position: 'desc'
        },
        take: 1,
        select: {
          position: true
        }
      });

      const role = await prisma.role.create({
        data: {
          title: title,
          createdById: session.user.id,
          position: (getNewPosition[0]?.position ?? 0) + 1,
        }
      });

      return role;

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
      statusMessage: "Unauthorized",
    });
  }

});