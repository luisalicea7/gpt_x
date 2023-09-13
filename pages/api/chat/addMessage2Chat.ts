import clientPromise from "@/lib/dbconnect";
import { getAuth } from "@clerk/nextjs/server";
import { ObjectId, UpdateFilter } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { userId } = await getAuth(req);
        const client = await clientPromise;
        if (!client) {
          throw new Error("An error ocurred connecting to the database");
        }
        const db = client.db("gptx");

        const { chatId, role, content } = req.body;

    //validate chatId
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (error) {
      res.status(422).json({
        message: "Invalid chatId",
      })
      return
    }

    //validate content data
    if (!content || typeof content !== "string" || (role === 'user' && content.length > 200) || (role === 'assistant' && content.length > 200000)) {
        res.status(422).json({
          message: "Content is required and must be 200 characters or less",
        })
        return
    }

    //validate role
    if (role !== "user" && role !== "assistant") {
            res.status(422).json({
              message: "Invalid role",
            })
            return
    }


        const chat = await db.collection("chats").findOneAndUpdate({
            _id: objectId,
            userId: userId
        }, {
            $push: {
                messages: {
                    role,
                    content
                }
            } as unknown as UpdateFilter<Document>
        }, {
            returnDocument: "after"
        })

        res.status(200).json({
            chat: {
                ...chat.value,
                _id: chat.value?._id.toString()
            }
        })
    } catch (error) {
        res.status(500).json({ error: "An error occurred adding message to chat" });
    }
}