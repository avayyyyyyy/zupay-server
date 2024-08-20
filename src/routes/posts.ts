import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import Post, { IPost } from "../models/Post";

const router = express.Router();

const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  bannerImage: z.string().url(),
  author: z.string().min(1).max(50),
});

const postUpdateSchema = postSchema.partial();

const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    next();
  };

async function fetchPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.locals.post = post;
    next();
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.search as string) || "";

    const filter = searchQuery
      ? {
          $or: [
            { title: { $regex: new RegExp(searchQuery, "i") } },
            { content: { $regex: new RegExp(searchQuery, "i") } },
          ],
        }
      : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: (err as Error).message });
  }
});

router.get("/:id", fetchPost, (req: Request, res: Response) => {
  res.json(res.locals.post);
});

router.post(
  "/",
  validateRequest(postSchema),
  async (req: Request, res: Response) => {
    try {
      const post = new Post(req.body);
      const newPost = await post.save();
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

router.put(
  "/:id",
  fetchPost,
  validateRequest(postUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      Object.assign(res.locals.post, req.body);
      const updatedPost = await res.locals.post.save();
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

router.delete("/:id", fetchPost, async (req: Request, res: Response) => {
  try {
    await res.locals.post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
