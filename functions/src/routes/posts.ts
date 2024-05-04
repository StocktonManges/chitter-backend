import { Router } from "express";
import { validateRequest, validateRequestBody } from "zod-express-middleware";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

export const postsController = Router();
const prisma = new PrismaClient();

// Get all posts
postsController.get("/", async (_req, res) => {
  const allPosts = await prisma.post.findMany();
  res.json(allPosts);
});

// Create a post
postsController.post(
  "/:authorId",
  validateRequest({
    body: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    }),
  }),
  async (req, res) => {
    const authorId = +req.params.authorId;
    const { title, content } = req.body;
    const data = { title: title.trim(), content: content.trim(), authorId };

    if (data.title.trim() === "" || data.content.trim() === "") {
      return res
        .status(400)
        .json({ message: "Title and content must not be empty" });
    }

    const newPost = await Promise.resolve()
      .then(() =>
        prisma.post.create({
          data,
        })
      )
      .catch((err) => {
        console.error(err.message);
        return null;
      });

    if (newPost === null) {
      return res
        .status(404)
        .json({ message: `'${authorId}' is an invalid author id` });
    }
    return res.status(201).json(newPost);
  }
);

// Delete a post by id
postsController.delete("/:id", async (req, res) => {
  const id = +req.params.id;
  const deletedPost = await Promise.resolve()
    .then(() =>
      prisma.post.delete({
        where: {
          id,
        },
      })
    )
    .catch((err) => {
      console.error(err.message);
      return null;
    });

  if (deletedPost === null) {
    return res
      .status(404)
      .json({ message: `'${req.params.id}' is an invalid id` });
  }
  return res.status(200).json(deletedPost);
});

// Update a post
postsController.patch(
  "/:id",
  validateRequestBody(
    z.object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
    })
  ),
  async (req, res) => {
    const id = +req.params.id;
    const data = req.body;

    const isBodyUndefined = Object.values(data).every(
      (value) => value === undefined
    );
    if (isBodyUndefined) {
      return res.status(202).json({ message: "No change was made" });
    }

    const updatedPost = await Promise.resolve()
      .then(() =>
        prisma.post.update({
          where: {
            id,
          },
          data,
        })
      )
      .catch((err) => {
        console.error(err.message);
        return null;
      });

    if (updatedPost === null) {
      return res.status(404).json({ message: `'${id}' is an invalid id` });
    }
    return res.status(200).json(updatedPost);
  }
);
