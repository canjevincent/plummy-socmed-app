import { z } from 'zod'

export type SafeAuthUser = {
  firstName: string
  middleName: string
  lastName: string,
  avatarUrl:string,
  role: string,
  email: string,
  createdAt: string,
  followers: [],
  followed: [],
};

export const userSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  email: z.string(),
});