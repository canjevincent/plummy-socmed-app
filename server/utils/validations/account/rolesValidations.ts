import { z } from 'zod';
import prisma from '~/lib/prisma';

export const rolesCreate = z.object({
  title: z.string().min(3, { message: 'Title is required with atleast 3 characters' }),
});

export const rolesUpdate = z.object({
  title: z.string().min(3, { message: 'Title is required with atleast 3 characters' }),
}).refine(async (data) => {
  const existingRole = await prisma.role.findUnique({
    where: {
      title: data.title,
    },
  });
  return !existingRole;
}, {
  message: "Title already exists",
  path: ["title"], // Associate the error with the `title` field
});