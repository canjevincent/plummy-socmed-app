import { z } from 'zod';
import prisma from '~/lib/prisma';

export const authRegister = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  firstName: z.string().min(3, {message: 'First name is requird with atleast 3 characters'}),
  middleName: z.string().min(1, {message: 'Middle name is requird with atleast 1 character'}),
  lastName: z.string().min(3, {message: 'Last name is requird with atleast 3 characters'}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // This associates the error with the `confirmPassword` field
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

export const authLogin = z.object({
  email: z.string().email(),
  password: z.string().min(8),
}).refine(async (data) => {
  // Check if the email exists in the database
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  // If the user does not exist, throw an error
  if (!existingUser) {
    return false;
  }

  // Return the user object for reuse in the next refinement
  return existingUser;
}, {
  message: "Email does not exist.",
  path: ["email"], // Associate the error with the `email` field
}).refine(async (data) => {
  // Reuse the existingUser from the previous refinement
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  // Ensure the user exists and has a hashed password
  if (!existingUser || !existingUser.hashedPassword) {
    return false;
  }

  // Verify the password
  const isPasswordCorrect = await verifyPassword(existingUser.hashedPassword, data.password);
  return isPasswordCorrect;
}, {
  message: "Email or password is incorrect.",
  path: ["password"], // Associate the error with the `password` field
});