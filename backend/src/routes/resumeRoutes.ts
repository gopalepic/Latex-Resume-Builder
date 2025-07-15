import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import prisma from "../config/prisma";

const router = Router();

router.get('/me', authenticate, async (req, res) => {
  try{
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.userId},
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
  );

  if (!user) {
   return res.status(404).json({ error: "User not found" });
   
  }
  res.json(user);
}
  catch (error) {
    res.status(500).json({error: "Failed to fetch user" });
}
});
  

router.post("/", authenticate , async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const resume = await prisma.resume.create({
      data: {
        title,
        content,
        userId: req.user!.userId, // Use authenticated user's ID
      },
    });

    res.status(201).json(resume);
  } catch (error) {
  
    res.status(500).json({ error: "Failed to create resume" });
  }
});

router.get("/", authenticate , async (_req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      include: {
        user: true,
      },
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update a resume by ID
 */

router.put("/:id",authenticate, async (req, res) => {
  try {
    const resumeId = Number(req.params.id);
    const { title, content } = req.body;

    const Updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { title, content },
    });

    res.json(Updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resume" });
  }
});

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume by ID
 */

router.delete("/:id", authenticate , async (req, res) => {
  try {
    const resumeId = Number(req.params.id);

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

// router.post("/create-test-user", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const existing = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existing) {
//       return res
//         .status(409)
//         .json({
//           error: `User with this email address ${email} already exists`,
//         });
//     }

//     const user = await prisma.user.create({
//       data: {
//         email,
//         password,
//       },
//     });

//     res.status(201).json({ message: "Test user created successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create test user" });
//   }
// });
export default router;
