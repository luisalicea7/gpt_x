import Head from "next/head";
import { ChatSidebar, Message } from "../../components";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import { getAuth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/dbconnect";
import { ObjectId } from "mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons/faLightbulb";

export default function ChatPage({
  chatId,
  title,
  messages = [],
}: {
  chatId: string;
  title: string;
  messages: [];
}) {
  console.log("props: ", title, messages);
  const [messageText, setMessageText] = useState("");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [newChatMessages, setNewChatMessages] = useState<
    {
      role: string;
      _id: string;
      content: string;
    }[]
  >([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const [fullMessage, setFullMessage] = useState("");
  const [firstChatId, setFirstChatId] = useState<string | null>(chatId);

  const router = useRouter();

  const routeChange = chatId !== firstChatId;

  //if new chat redirect to chat dynamic route
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  //update when route changes
  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  //save new streamMessage to new chat messages
  useEffect(() => {
    if (!routeChange && !generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        {
          _id: uuidv4(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage, routeChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setFirstChatId(chatId);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuidv4(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");

    const res = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, message: messageText }),
    });

    const data = res.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
      console.log("Message: ", message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
        content = content + message.content;
      }
    });
    setFullMessage(content);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const messagesCollection = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>

      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col bg-[#3d3d3d] overflow-hidden">
          <div className="flex-1 flex flex-col-reverse text-white overflow-scroll">
            {!messagesCollection.length && !incomingMessage && (
              <div className="m-auto justify-center flex flex-col items-center text-center">
                <FontAwesomeIcon
                  icon={faLightbulb}
                  className="text-6xl text-white"
                />
                <h1 className="text-4xl font-bold text-white/50 mt-2">
                  Ask me your question
                </h1>
              </div>
            )}
            {!!messagesCollection.length && (
              <div className="mb-auto">
                {messagesCollection.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {!!incomingMessage && !routeChange && (
                  <Message role="assistant" content={incomingMessage} />
                )}
                {!!incomingMessage && !!routeChange && (
                  <Message
                    role="alert"
                    content="Only one message at a time. Allow any other responses to finish before submitting a new one"
                  />
                )}
              </div>
            )}
          </div>
          <footer className="bg-[#333333] p-9">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-3" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none rounded-md bg-[#3d3d3d] px-3 py-1 text-white focus:border-[#FFFFFF] focus:bg-[#474747] focus:outline focus:outline-[#ffffff]"
                  placeholder={generatingResponse ? "" : "Type a message..."}
                />
                <button type="submit" className="btn">
                  {/* <Image id="send-button" src={Send} alt={"Image"} /> */}
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (error) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
    const { userId } = await getAuth(ctx.req);
    const client = await clientPromise;
    const database = client!.db("gptx");
    const chat = await database!.collection("chats").findOne({
      userId,
      _id: objectId,
    });

    if (!chat) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
    return {
      props: {
        chatId,
        title: chat!.title,
        messages: chat?.messages.map((message: any[]) => ({
          ...message,
          _id: uuidv4(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
