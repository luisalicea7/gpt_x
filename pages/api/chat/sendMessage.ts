import { getAuth } from "@clerk/nextjs/server";
import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { OpenAIEdgeStream } from "openai-edge-stream"

export const config = {
    runtime: "edge",
}

export default async function handler(
  req: NextRequest,
  res: NextApiResponse
) {


// Get Session token to validate user is signed in
  const { getToken } = getAuth(req);
  const token = await getToken();
  const origin = req.headers.get("origin");

  try {
    // const initialChatMessage = {
    //     role: "user",
    //     content: ""
    // }

    const { chatId: chatIdParam, message } = await req.json();
    let chatId = chatIdParam;
    let newChatId: string
    let chatMessages = []

    if(chatId){ 
        const res = await fetch(`${origin}/api/chat/addMessage2Chat`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                chatId,
                role: "user",
                content: message,
            })
        })
        const json = await res.json();
        chatMessages = json.chat.messages || []
    } else {
        
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
    chatId = data._id
    newChatId = data._id
    chatMessages = data.messages || []
    }

    const messages2Send = []
    chatMessages.reverse()
    let tokensUsed = 0
    for (let chatMessage of chatMessages) {
        const messageTokens = chatMessage.content.length / 4
        tokensUsed = tokensUsed + messageTokens
        if(tokensUsed <= 2000){
            messages2Send.push(chatMessage)
        }else{
            break
        }
    }

    messages2Send.reverse()
  
    // Begin Stream Chat
    const stream = await OpenAIEdgeStream(
        "https://api.openai.com/v1/chat/completions", {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            method: "POST",
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [...messages2Send],
                stream: true
            })
    }, {
        onBeforeStream: async ({emit}) => {
            if (newChatId) {
            emit(newChatId, "newChatId")
            }
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

  return res.status(200).json({});
}

