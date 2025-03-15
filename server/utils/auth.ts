import { type User } from '@prisma/client';

export const sanitizeUser = (user: User): Omit<User, 'hashedPassword'> | null => {
  if (!user) return null;

  const { hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
}