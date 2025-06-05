import { ZodError } from "zod";
import prisma from "~/lib/prisma";
import { dailyUploadImage } from "~/server/utils/validations/plummy/dailyUploadImageValidations";

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

    const userId = session.user.id;

    try {
      // Validate the request body
      const { postImages } = await readValidatedBody(event, (body) => dailyUploadImage.parseAsync(body));
      
      // Upload all photos to Cloudinary and create Daily records
      const uploadAndCreatePromises = postImages.map(async (image) => {
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(image.url, {
          folder: 'daily_uploads',
          resource_type: 'auto'
        }) as { secure_url: string };

        // Create Daily record for this photo
        return prisma.daily.create({
          data: {
            title: image.title,
            dailyUrl: uploadResult.secure_url,
            userId: userId
          }
        });

      });

      // Wait for all uploads and creations to complete
      const createdDailies = await Promise.all(uploadAndCreatePromises);
      
      return {
        statusCode: 200,
        data: createdDailies
      };

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
      statusMessage: "Unauthorized",
    });

  }

});