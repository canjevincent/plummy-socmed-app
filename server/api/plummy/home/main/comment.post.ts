import { ZodError } from "zod";
import prisma from "~/lib/prisma";
import { postComment} from "~/server/utils/validations/plummy/commentValidations";

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

      const { postId, comment } = await readValidatedBody(event, (body) => postComment.parseAsync(body));

      console.log('Check comment: ', comment);

      const getNewComment = await prisma.postComment.create({
        data: {
          comment: comment,
          postId: postId,
          userId: session.user.id,
        }
      });

      return getNewComment;

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
    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: "An unexpected error occurred. Please try again later.",
    });
  }
});
