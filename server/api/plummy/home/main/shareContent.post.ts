import { ZodError } from "zod";
import prisma from "~/lib/prisma";
import { shareContentPost } from "~/server/utils/validations/plummy/sharedContentValidations";

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

      // Validate the request body
      const { content, postImages } = await readValidatedBody(event, (body) => 
        shareContentPost.parseAsync(body)
      );

      // Create the post first to get its ID
      const post = await prisma.post.create({
        data: {
          content: content || '',
          userId: session.user.id,
          // Don't create postImages yet
        }
      });

      // Array to store Cloudinary image URLs
      const cloudinaryImages = [];

      // Upload images to Cloudinary if they exist
      if (postImages && postImages.length > 0) {
        for (const img of postImages) {
          try {
            // Check if the image URL is a base64 string (needs uploading)
            if (img.url.startsWith('data:')) {
              // Upload to Cloudinary
              const uploadResult = await uploadToCloudinary(img.url, {
                folder: `posts/${post.id}`,
                public_id: img.id
              });
              
              // Add to our array with the Cloudinary URL
              cloudinaryImages.push({
                id: img.id,
                postId: post.id, // Use the actual post ID
                url: (uploadResult as any).secure_url
              });
            } else {
              // If it's already a URL, just use it
              cloudinaryImages.push({
                id: img.id,
                postId: post.id, // Use the actual post ID
                url: img.url
              });
            }
          } catch (uploadError) {
            console.error('Error uploading image to Cloudinary:', uploadError);
            // Continue with other images even if one fails
          }
        }
      }

      // Update the post with the Cloudinary image URLs
      const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: {
          postImages: cloudinaryImages
        }
      });

      return updatedPost;

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