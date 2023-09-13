import clientPromise from "@/lib/dbconnect";
import { buildClerkProps, clerkClient, getAuth } from "@clerk/nextjs/server";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next"
import { NextRequest } from "next/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {


  try {
    const { userId } = getAuth(req);
    const { message } = req.body;

    //validate data
    if (!message || typeof message !== "string" || message.length > 200) {
      res.status(422).json({
        message: "Message must be 200 characters or less",
      })
      return
  }

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
    const chat = await db.collection("chats").insertOne({
        userId,
        messages: [newUserMessage],
        title: message
    });
    res.status(200).json({
        _id: chat.insertedId.toString(),
        messages: [newUserMessage],
        title: message
    })
  } catch (e) {
    console.error("An error occurred on createNewChat", e);
    res.status(500).json({ error: "An error occurred in createNewChat" });
  }
}


