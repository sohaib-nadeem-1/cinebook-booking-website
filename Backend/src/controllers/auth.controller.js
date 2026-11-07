
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { user } from "../db/schema/user.schema.js";
import config from "../config/config.data.js";

// ==========================================
// REGISTER API
// ==========================================

export const registerApi = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // 2. Check existing user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "customer",
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });

    // 5. Generate JWT
    const token = jwt.sign(
      {
        userid: newUser.id,
        userRole: newUser.role,
        userEmail: newUser.email,
      },
      config.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(201).json({
      message: "User Created Successfully",
      token,
      user: newUser,
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


// ==========================================
// LOGIN API
// ==========================================

export const loginApi = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = existingUser[0];

    // 3. Check account status
    if (currentUser.status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      currentUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        userid: currentUser.id,
        userRole: currentUser.role,
        userEmail: currentUser.email,
      },
      config.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login Successfully",
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


// ==========================================
// CHANGE PASSWORD API
// ==========================================

export const changePasswordApi = async (req, res) => {
  try {
    const { current, next, confirm } = req.body;

    // 1. Get logged-in user ID from JWT
    const userId = req.user.userid;

    // 2. Validate fields
    if (!current || !next || !confirm) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (next.length < 8) {
      return res.status(400).json({
        message: "New password must contain at least 8 characters",
      });
    }

    if (next !== confirm) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (current === next) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // 3. Find logged-in user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      current,
      existingUser[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(next, 12);

    // 6. Update password in database
    await db
      .update(user)
      .set({
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(user.id, userId));

    return res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
