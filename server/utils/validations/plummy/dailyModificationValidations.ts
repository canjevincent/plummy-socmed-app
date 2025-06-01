import { z } from 'zod';

export const dailyModificationUpdate = z.object({
  imageOpacity: z.number().min(0).max(1).optional().default(1),
  imageBlur: z.number().min(0).max(100).optional().default(0),
  imageBlurFace: z.number().min(0).max(100).optional().default(0),
  imageSharpen: z.number().min(0).max(100).optional().default(0),
  imageBrightness: z.number().min(0).max(200).optional().default(100),
  imageVibrance: z.number().min(-100).max(100).optional().default(0),
  imageAngle: z.number().min(-360).max(360).optional().default(0),
  textContent: z.string().optional().default(''),
  textPositionX: z.number().optional().default(0),
  textPositionY: z.number().optional().default(0),
  textFontSize: z.number().min(1).max(200).optional().default(16),
  textColor: z.string().optional().default('#000000'),
  imageRemoveBackground: z.boolean().optional().default(false),
  imageZoomPan: z.boolean().optional().default(false),
  imageGrayScale: z.boolean().optional().default(false),
  isMyDay: z.boolean().optional().default(false)
});