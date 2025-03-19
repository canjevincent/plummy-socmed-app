import { z } from 'zod';
import prisma from '~/lib/prisma';

export const settingsFormUpdate = z.object({
  email: z.string().email(),
  firstName: z.string().min(3, {message: 'First name is requird with atleast 3 characters'}),
  middleName: z.string().min(1, {message: 'Middle name is requird with atleast 1 character'}),
  lastName: z.string().min(3, {message: 'Last name is requird with atleast 3 characters'}),
}).refine(async (data) => {
  // Check if the email already exists in the database
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  return !existingUser; // Return `true` if the email is unique
}, {
  message: "Email already exists",
  path: ["email"], // Associate the error with the `email` field
});