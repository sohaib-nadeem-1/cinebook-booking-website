import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { user } from "../db/schema/user.schema.js";

export const profileApi = async (req, res) => {
  try {
    const userid = req.user.userid;

    const [profile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      })
      .from(user)
      .where(eq(user.id, userid))
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        message: "User Profile Not Found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      data: profile,
    });

  } catch (error) {
    console.error("Profile API Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};