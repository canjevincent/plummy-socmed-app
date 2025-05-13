import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
const config = useRuntimeConfig(); 
cloudinary.config({
  cloud_name: config.public.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret
});

/**
 * Uploads an image to Cloudinary
 * @param imageData Base64 encoded image data or URL
 * @param options Cloudinary upload options
 * @returns Promise resolving to Cloudinary upload result
 */
export const uploadToCloudinary = async (imageData: string, options: any = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imageData, options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Deletes a resource from Cloudinary
 * @param publicId The public ID of the resource to delete
 * @returns Promise resolving to Cloudinary deletion result
 */
export const deleteResourceFromCloudinary = async (resourceName: string, resource_type: string | undefined = 'image') => {

  await cloudinary.uploader.destroy(resourceName, {
    resource_type
  })
  
}

// export const deleteResourceFromCloudinary = async (publicId: string) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.destroy(publicId, (error, result) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };