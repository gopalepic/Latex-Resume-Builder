import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
const router = Router();

async function getUserIdFromRequest(req: any): Promise<number | null> {
  try {
    // If the user is already injected by the auth middleware
    if (req.user && req.user.userId) {
      return req.user.userId;
    }

    // Else: use Authorization Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId || null;
  } catch (err) {
    return null;
  }
}

router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, content } = req.body;

    const resume = await prisma.resume.create({
      data: {
        title,
        content,
        userId: userId,
      },
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: "Failed to create resume" });
  }
});
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const resumes = await prisma.resume.findMany({
      where: { userId },
    });

    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// ✅ PUT /api/resumes/:id – Update a resume
router.put("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const resumeId = Number(req.params.id);
    const { title, content } = req.body;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { title, content },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resume" });
  }
});

// ✅ DELETE /api/resumes/:id – Delete a resume
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const resumeId = Number(req.params.id);

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;