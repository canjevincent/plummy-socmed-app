import { dailyModificationUpdate } from "~/server/utils/validations/plummy/dailyModificationValidations"
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
  
  await requireUserSession(event)
  const session = await getUserSession(event);

  if(session.user){
    
    try {

      const { 
        imageOpacity, imageBlur, imageBlurFace, imageSharpen, imageBrightness, imageVibrance, imageAngle,
        imageRemoveBackground, imageZoomPan, imageGrayScale, textContent, textPositionX, textPositionY, 
        textFontSize, textColor,
      } = await readValidatedBody(event, (body) => dailyModificationUpdate.parseAsync(body));

      const daily = await prisma.daily.update({
        where: {
          id: event.context.params?.dailyId
        },
        data:{
          imageOpacity:imageOpacity,
          imageBlur:imageBlur,
          imageBlurFace:imageBlurFace,
          imageSharpen:imageSharpen,
          imageBrightness:imageBrightness,
          imageVibrance:imageVibrance,
          imageAngle:imageAngle,
          textContent:textContent,
          textPositionX:textPositionX,
          textPositionY:textPositionY,
          textFontSize:textFontSize,
          textColor:textColor,
          imageRemoveBackground:imageRemoveBackground,
          imageZoomPan:imageZoomPan,
          imageGrayScale:imageGrayScale
        }
      });

      return daily;

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