import clientPromise from "@/lib/dbconnect";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { user } = await getAuth(req);
    const { message } = req.body;

    // Create a new user message
    const newUserMessage = {
      content: message,
      role: "user",
    };

    const client = await clientPromise;
    if (!client) {
      throw new Error("An error ocurred connecting to the database");
    }
    const db = client.db("gptx");
  } catch (e) {
    console.error("An error occurred on sendMessage", e);
    res.status(500).json({ error: "An error occurred" });
  }
}
