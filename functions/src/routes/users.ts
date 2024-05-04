import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  validateRequest,
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware";
import { z } from "zod";
import bcrypt from "bcrypt";

export const usersController = Router();
const prisma = new PrismaClient();

// Get all users
usersController.get("/", async (_req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

// Get user by email
usersController.get("/:email", async (req, res) => {
  const email = req.params.email;
  const user = await Promise.resolve()
    .then(() =>
      prisma.user.findUnique({
        where: {
          email,
        },
      })
    )
    .catch((err) => {
      console.error(err.message);
      return null;
    });

  if (user === null) {
    return res
      .status(404)
      .json({ message: `'${req.params.email}' is not a valid email` });
  }
  return res.status(200).json(user);
});

// Get one user's posts
usersController.get(
  "/:email/posts",
  validateRequestParams(
    z.object({
      email: z.string().email(),
    })
  ),
  async (req, res) => {
    const email = req.params.email.toLowerCase();
    const userPosts = await Promise.resolve()
      .then(() =>
        prisma.post.findMany({
          where: {
            author: {
              email,
            },
          },
        })
      )
      .catch((err) => {
        console.error(err.message);
        return null;
      });

    if (userPosts === null || userPosts.length === 0) {
      return res
        .status(404)
        .json({ message: `'${req.params.email}' is not a valid email` });
    }
    return res.status(200).json(userPosts);
  }
);

// Delete all of one user's posts
usersController.delete(
  "/:email/posts",
  validateRequestParams(
    z.object({
      email: z.string().email(),
    })
  ),
  async (req, res) => {
    const email = req.params.email.toLowerCase();
    const userPosts = await Promise.resolve()
      .then(() =>
        // Returns { count: 0 } if "where" filter finds no matches.
        prisma.post.deleteMany({
          where: {
            author: {
              email,
            },
          },
        })
      )
      .catch((err: Error) => {
        return err.message;
      });

    if (typeof userPosts === "string") {
      return res.status(400).json({ message: userPosts });
    }
    if (userPosts.count === 0) {
      return res.status(200).json({ message: "Nothing deleted" });
    }
    return res.status(200).json({
      message: `All user posts deleted (posts deleted: ${userPosts.count})`,
    });
  }
);

// Create a user
usersController.post(
  "/signup",
  validateRequestBody(
    z.object({
      email: z.string().email(),
      name: z.string(),
      password: z.string(),
    })
  ),
  async (req, res) => {
    const { email, name, password } = req.body;
    const newUser = await Promise.resolve()
      .then(() =>
        bcrypt.hash(password, 11).then((result) => {
          console.log({ password, result });
          return result;
        })
      )
      .then((passwordHash) => {
        return prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name,
            passwordHash,
          },
        });
      })
      .catch((err) => {
        console.error(err.message);
        return null;
      });
    if (newUser === null) {
      return res.status(400).json({ message: "Email unavailable" });
    }
    return res.status(201).json(newUser);
  }
);

// Update a user
usersController.patch(
  "/:email",
  validateRequest({
    body: z.object({
      email: z.string().email().optional(),
      name: z.string().optional(),
      password: z.string().optional(),
    }),
    params: z.object({
      email: z.string().email(),
    }),
  }),
  async (req, res) => {
    const data = req.body;
    const email = req.params.email;

    const isBodyUndefined = Object.values(data).every(
      (value) => value === undefined
    );
    if (isBodyUndefined) {
      return res.status(202).json({ message: "No change was made" });
    }
    if (data.email === email) {
      return res.status(400).json({ message: "Must enter a new email" });
    }

    const updatedUser = await Promise.resolve()
      .then(() =>
        prisma.user.update({
          where: {
            email,
          },
          data,
        })
      )
      .catch(() => null);

    if (updatedUser === null) {
      return res.status(404).json({ message: `'${email}' not found` });
    }
    return res.status(200).json(updatedUser);
  }
);

// Delete a user
usersController.delete(
  "/:email",
  validateRequestParams(
    z.object({
      email: z.string().email(),
    })
  ),
  async (req, res) => {
    const email = req.params.email;
    const deletedUser = await Promise.resolve()
      .then(() =>
        prisma.post.deleteMany({
          where: {
            author: {
              email,
            },
          },
        })
      )
      .then((posts) => {
        console.log(posts);
        return {
          ...prisma.user.delete({
            where: {
              email,
            },
          }),
        };
      })
      .catch((err) => {
        console.error(err.message);
        return null;
      });

    if (deletedUser === null) {
      return res.status(404).json({ message: `'${email}' not found` });
    }
    return res.status(200).json(deletedUser);
  }
);
