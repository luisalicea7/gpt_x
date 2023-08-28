import { NextApiResponse } from "next";
import { OpenAIEdgeStream } from "openai-edge-stream"


export const config = {
    runtime: "edge",
}

export default async function handler(req: Request, res: NextApiResponse) {
    try {
        const { message } = await req.json()

        const res = await fetch("/api/chat/createNewChat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          });
      
          const data = await res.json();
          console.log("NEW CHAT: ", data);
          
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
        }
        )
        return new Response(stream)
    } catch (error) {
        console.log("An error ocurred on sendMessage", error)
    }
}