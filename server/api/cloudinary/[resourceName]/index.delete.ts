import { deleteResourceFromCloudinary } from "~/server/utils/cloudinary";

// Delete file inside cloudinary account
export default defineEventHandler(async (event) => {
  console.log(event)
  await requireUserSession(event);
  const session = await getUserSession(event);
  if(session.user) {
    const resourceName = getRouterParams(event, 'resourceName')
    if (resourceName) {
      await deleteResourceFromCloudinary(resourceName.resourceName);
    }  
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized. You don't have admin access.",
    });
  }

});