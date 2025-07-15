import  { Router } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET! ;





router.post("/signup", async (req, res) => {
  try {
    const  email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    if(!email || !password || !name) {
      return res.status(400).json({ error: "All fields are requried" });
    }

      const existing = await prisma.user.findUnique({where: { email }});
      
        if (existing) {
            return res.status(409).json({ error: `User with this email address ${email} already exists` });
        }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({ message: "User registered successfully", userId : user.id });
  } catch (error) {
      console.error("Signup Error : : ", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

   
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error : : ", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

export default router;