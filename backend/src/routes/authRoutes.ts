import  { Router } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";    
dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET! ;

import axios from "axios"; // 👈 Add this at the top with other imports

// GitHub OAuth Route
router.post("/auth/github", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
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
      return res.status(400).json({ error: "Failed to get access token" });
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
      return res.status(400).json({ error: "Unable to fetch email from GitHub" });
    }

    // Step 4: Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: name || login,
          // password: null, // no password for GitHub users
        },
      });
    }

    // Step 5: Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "GitHub login successful", token });
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    res.status(500).json({ error: "GitHub login failed" });
  }
});

export default router;