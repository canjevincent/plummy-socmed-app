import { ZodError } from "zod";
import prisma from "~/lib/prisma";
import { postLike } from "~/server/utils/validations/plummy/likeValidations";
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

  if (session.user) {
    try {

      const { postId, emoji, emoji_name, emoji_id } = await readValidatedBody(event, (body) => postLike.parse(body));
      const createNewLike = await prisma.postLike.create({
        data: {
          emoji:emoji,
          emoji_name:emoji_name,
          emoji_id:emoji_id,
          postId: postId,
          userId: session.user.id,
        }
      });

      return createNewLike;

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
