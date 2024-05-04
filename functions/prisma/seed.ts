import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const randomPosts = [
  {
    title: "Lorem, ipsum dolor.",
    content: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
  },
  {
    title: "Lorem, ipsum dolor.",
    content:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum dicta asperiores nam, voluptatem atque quae.",
  },
  {
    title: "Lorem ipsum dolor sit amet.",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates harum praesentium vitae officiis facilis ratione quidem provident vel placeat dolor. Ex officiis quae earum autem!",
  },
];

const clearDb = async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
};

const seed = async () => {
  console.log("Seeding the database...");
  await clearDb();

  const universalPassword = await bcrypt.hash("Password", 11);

  // Create Jon
  await prisma.user.create({
    data: {
      email: "jon@gmail.com",
      name: "Jon Higger",
      passwordHash: universalPassword,
    },
  });
  // create peter
  await prisma.user.create({
    data: {
      email: "peter@gmail.com",
      name: "Peter Petigrue",
      passwordHash: universalPassword,
    },
  });

  // create jason
  await prisma.user.create({
    data: {
      email: "jason@gmail.com",
      name: "Jason Stathom",
      passwordHash: universalPassword,
    },
  });

  // create tom
  await prisma.user.create({
    data: {
      email: "tom@gmail.com",
      name: "Tom Holland",
      passwordHash: universalPassword,
    },
  });

  // create donny
  await prisma.user.create({
    data: {
      email: "donny@gmail.com",
      name: "Donny Osmond",
      passwordHash: universalPassword,
    },
  });

  // create britney
  await prisma.user.create({
    data: {
      email: "britney@gmail.com",
      name: "Britney Spears",
      passwordHash: universalPassword,
    },
  });

  // CREATE POSTS

  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    const randIndex = Math.round(Math.random() * 2);
    await prisma.post.create({
      data: {
        authorId: user.id,
        ...randomPosts[randIndex],
      },
    });
  }

  for (const user of allUsers) {
    if (user.id % 2 === 0) {
      const randIndex = Math.round(Math.random() * 2);
      await prisma.post.create({
        data: {
          authorId: user.id,
          ...randomPosts[randIndex],
        },
      });
    }
  }
};

seed()
  .then(() => {
    console.log("🌱 Seeding complete 🌱");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
