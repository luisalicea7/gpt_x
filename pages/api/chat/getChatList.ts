import clientPromise from "@/lib/dbconnect";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    try {
        const { userId } = await getAuth(req);


        const dbclient = await clientPromise;
        const db = dbclient?.db("gptx");
        const chats = await db?.collection("chats").find({
            userId: userId
        },{
            projection: {
                // userId: 0,
                messages: 0
            }
        }).sort({
            _id: -1
        }).toArray()
        res.status(200).json({chats})
    } catch (error) {
        res.status(500).json({ error: "An error occurred in getChatList" });
    }
}