import { sanitizeUser } from "~/server/utils/auth";
import { authRegister } from "../../../utils/validations/guest/authValidations";
import prisma from "~/lib/prisma";
import { ZodError } from "zod";

const transformZodErrors = (zodError: ZodError) => {
  const errors: Record<string, string> = {};

  zodError.errors.forEach((error) => {
    const field = error.path[0]; 
    errors[field] = error.message; 
  });

  return errors;
};

export default defineEventHandler(async (event) => {
  try {
    const { email, password, firstName, middleName, lastName } = await readValidatedBody(event, (Body) => authRegister.parseAsync(Body));

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        middleName,
        lastName,
      },
    });

    const transformedUser = sanitizeUser(user);

    if (transformedUser) {
      await setUserSession(event, {
        user: transformedUser
      });
    }

    return transformedUser;
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

    // console.log("Check instance of ZodError",error.cause.data instanceof ZodError)
    // console.log("Check instance of ZodError",error.data instanceof ZodError)
    // console.log("Check error", error instanceof Error)
    // console.log(error instanceof Error && 'data' in error && error.data instanceof ZodError)

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: "An unexpected error occurred. Please try again later.",
    });

  }

});