import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Array to store user creation promises
  const users = [];

  // Loop to create 100 users
  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const hashedPassword = await bcrypt.hash('password', 10); // Hash a default password
    const avatarUrl = faker.image.avatar();

    // Create a user and push the promise to the array
    users.push(
      prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          hashedPassword,
          avatarUrl,
          role: '1', // Default role
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      })
    );
  }

  // Execute all user creation promises
  await Promise.all(users);

  console.log('Seeded 100 users successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });