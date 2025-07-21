import  { Router } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";    
dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// Regular signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      return res.status(409).json({ error: `User with this email address ${email} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: "local", // Mark as local/email registration
      },
    });

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Regular login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "This account uses OAuth login. Please sign in with GitHub." });
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
    console.error("Login Error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// GitHub OAuth callback route (handles GitHub's redirect)
router.get("/github/callback", async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`http://localhost:3000/login?error=${error}`);
  }

  if (!code) {
    return res.redirect("http://localhost:3000/login?error=no_code");
  }

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect("http://localhost:3000/login?error=failed_to_get_token");
    }

    // Step 2: Get user info from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, login, email, name } = userResponse.data;

    // Step 3: Fallback to get email if null
    let userEmail = email;
    if (!userEmail) {
      const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const primaryEmail = emailsResponse.data.find((emailObj: any) => emailObj.primary);
      userEmail = primaryEmail?.email;
    }

    if (!userEmail) {
      return res.redirect("http://localhost:3000/login?error=no_email");
    }

    // Step 4: Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: name || login,
          provider: "github",
          providerId: id.toString(),
        },
      });
    }

    // Step 5: Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/login?token=${token}`);
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    res.redirect("http://localhost:3000/login?error=github_auth_failed");
  }
});

export default router;