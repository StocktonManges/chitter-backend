import { Router } from "express";
import { validateRequestBody } from "zod-express-middleware";
import { z } from "zod";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

export const authController = Router();
const prisma = new PrismaClient();

// Login
authController.post(
  "/login",
  validateRequestBody(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async ({ body: { email, password } }, res) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user === null) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const { passwordHash, ...userNoHash } = user;

    return res.status(200).json({
      user: userNoHash,
    });
  }
);

authController.post(
  "/sign-up",
  validateRequestBody(
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async ({ body: { name, email, password } }, res) => {
    const isEmailUsed = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailUsed) {
      return res
        .status(405)
        .json({ message: `'${email}' already belongs to an account` });
    }

    const encryptedPass = await bcrypt.hash(password, 11);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: encryptedPass,
      },
    });

    const { passwordHash, ...userNoHash } = newUser;

    return res.status(201).json(userNoHash);
  }
);
