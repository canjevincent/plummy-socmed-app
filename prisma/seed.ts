import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function seedRoles(){
  await prisma.role.create({
    data: {
      title: 'User',
      position: 1,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })

  await prisma.role.create({
    data: {
      title: 'Administrator',
      position: 2,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })

  await prisma.role.create({
    data: {
      title: 'Chief Executive Officer',
      position: 3,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })

  await prisma.role.create({
    data: {
      title: 'President',
      position: 4,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })

  await prisma.role.create({
    data: {
      title: 'Manager',
      position: 5,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })

  await prisma.role.create({
    data: {
      title: 'Software Engineer',
      position: 6,
      createdById: '507f1f77bcf86cd799439011',
      updatedAt: faker.date.recent(),
    },
  })
}

async function seedUsers() {
  // Array to store user creation promises
  const users = [];

  // Loop to create 100 users
  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const hashedPassword = '$scrypt$n=16384,r=8,p=1$Lv4ryvKO5ytyxs9MDQasfw$1Ngn5mD/f2/c4IlzFI6sz/nZzHuhJLlCoj3HWp3hEDPq+t7hBIzyK776xCBp3UbVUraICG2VMYulDdcEYmoHrQ'; // Hash a default password admin2025
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
          roleId: faker.helpers.arrayElement([
            '67f628d466fee5445f017012',
            '67f628d466fee5445f017013',
            '67f628d466fee5445f017014',
            '67f628d466fee5445f017015',
            '67f628d466fee5445f017016',
            '67f628d466fee5445f017017'
          ]),
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

seedUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// seedRoles()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });