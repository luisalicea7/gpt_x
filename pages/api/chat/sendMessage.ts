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

    const requestData = await req.json();
    const { chatId: chatIdParam, message } = requestData;

    //validate data
    if (!message || typeof message !== "string" || message.length > 200) {
        return new Response(JSON.stringify({
            message: "Message must be 200 characters or less",
        }), {
            status: 422,
        });
        
    }

    let chatId = chatIdParam;
    let newChatId: string
    let chatMessages = []

    if(chatId){ 
        const fetchRes = await fetch(`${origin}/api/chat/addMessage2Chat`, {
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
        const json = await fetchRes.json();
        chatMessages = json.chat.messages || []
    } 
    
    else {
        
    // const { message } = await req.json();

    const fetchRes = await fetch(
        `${origin}/api/chat/createNewChat`,
        {
        method: "POST",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

    const data = await fetchRes.json();
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
        if(tokensUsed <= 4000){
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
    return new Response(JSON.stringify({
        message: "An error ocurred on sendMessage",
    }), {
        status: 500,
    });
    console.log("An error ocurred on sendMessage", error)
}
}

