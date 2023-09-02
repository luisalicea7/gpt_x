import { buildClerkProps, clerkClient, getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps, NextApiResponse } from "next";
import { OpenAIEdgeStream } from "openai-edge-stream"

export const config = {
    runtime: "edge",
}

export default async function handler(req: Request) {

    try {
        const { message } = await req.json();

        const res = await fetch(
            `${req.headers.get("origin")}/api/chat/createNewChat`,
            {
            method: "POST",
            headers: {
              "content-Type": "application/json",
              cookie: req.headers.get("cookie") || ""
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
                await fetch(`${req.headers.get("Origin")}/api/chat/addMessage2Chat`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        cookie: req.headers.get("Cookie") || ""
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
}

