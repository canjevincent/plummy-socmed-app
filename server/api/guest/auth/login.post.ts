import { authLogin } from "../../../utils/validations";
import { ZodError } from "zod";
import prisma from "~/lib/prisma";
import { type User } from '@prisma/client';

const transformZodErrors = (zodError: ZodError) => {
  const errors: Record<string, string> = {};

  zodError.errors.forEach((error) => {
    const field = error.path[0]; 
    errors[field] = error.message; 
  });

  return errors;
};

export default defineEventHandler(async(event) => {
  try {

    const { email } = await readValidatedBody(event, (body) => authLogin.parseAsync(body));

    const auth_user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        avatarUrl:true,
        role: true,
        email: true,
        createdAt: true,
        followers: true,
        followed: true
      }
    });

    if (auth_user) {
      await setUserSession(event, {
        user: auth_user
      })
    }

    return auth_user;

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
});