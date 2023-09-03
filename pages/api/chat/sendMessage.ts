import { buildClerkProps, clerkClient, getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { OpenAIEdgeStream } from "openai-edge-stream"

export const config = {
    runtime: "edge",
}

export default async function handler(
  req: NextRequest,
  res: NextApiResponse
) {


  const { getToken } = getAuth(req);
  const token = await getToken();
  const origin = req.headers.get("origin");

//   const { userId } = getAuth(req);
//   if (!userId) {
//     return res.status(401).json({ error: "Not authenticated" });
//   }

  try {
    const { message } = await req.json();

    const res = await fetch(
        `${origin}/api/chat/createNewChat`,
        {
        method: "POST",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

    const data = await res.json();
    const chatId  = data._id
  
    
    const stream = await OpenAIEdgeStream(
        "https://api.openai.com/v1/chat/completions", {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            method: "POST",
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{content: message, role: "user"}],
                stream: true
            })
    }, {
        onBeforeStream: async ({emit}) => {
            emit(chatId, "newChatId")
        },

        onAfterStream: async ({fullContent}) => {
            await fetch(`${origin}/api/chat/addMessage2Chat`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    chatId,
                    role: "assistant",
                    content: fullContent,
                })
            })
        }, 
    })
    return new Response(stream)
} catch (error) {
    console.log("An error ocurred on sendMessage", error)
}
  // Retrieve the data from your database
  return res.status(200).json({});
}

