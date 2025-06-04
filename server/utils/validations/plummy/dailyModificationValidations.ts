import { z } from 'zod';

export const dailyModificationUpdate = z.object({
  imageOpacity: z.number().min(0).max(100).optional().default(100),
  imageBlur: z.number().min(0).max(1000).optional().default(0),
  imageBlurFace: z.number().min(0).max(1000).optional().default(0),
  imageSharpen: z.number().min(0).max(1000).optional().default(0),
  imageBrightness: z.number().min(0).max(100).optional().default(100),
  imageVibrance: z.number().min(0).max(100).optional().default(0),
  imageAngle: z.number().min(0).max(100).optional().default(0),
  textContent: z.string().optional().default(''),
  textPositionX: z.number().min(0).max(1000).optional().default(5),
  textPositionY: z.number().min(0).max(1000).optional().default(5),
  textFontSize: z.number().min(0).max(1000).optional().default(200),
  textColor: z.string().optional().default('#000000'),
  imageRemoveBackground: z.boolean().optional().default(false),
  imageZoomPan: z.boolean().optional().default(false),
  imageGrayScale: z.boolean().optional().default(false),
  isMyDay: z.boolean().optional().default(false)
});