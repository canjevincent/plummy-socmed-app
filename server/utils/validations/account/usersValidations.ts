import { z } from 'zod';
import prisma from '~/lib/prisma';

export const usersCreate = z.object({
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

export const usersUpdate = z.object({
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

export const userRoleUpdate = z.object({
  userId: z.string().min(3, {message: 'User is required with atleast 1 character'}),
  newRoleId: z.string().min(3, {message: 'New role id is required with atleast 1 character'})
});