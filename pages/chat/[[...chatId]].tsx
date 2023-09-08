import Head from "next/head";
import { ChatSidebar, Message } from "../../components";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";

export default function ChatPage({ chatId }: { chatId: string }) {
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

  const router = useRouter();

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneratingResponse(true);
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
      body: JSON.stringify({ message: messageText }),
    });

    const data = res.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log("Message: ", message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
      }
    });

    setGeneratingResponse(false);
  };

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>

      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col bg-[#3d3d3d] overflow-hidden">
          <div className="flex-1 text-white overflow-scroll">
            {newChatMessages.map((message) => (
              <Message
                key={message._id}
                role={message.role}
                content={message.content}
              />
            ))}

            {!!incomingMessage && (
              <Message role="assistant" content={incomingMessage} />
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
  return {
    props: {
      chatId,
    },
  };
};
