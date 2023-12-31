import Image from "next/image";
import Send from "../../public/send.svg";
import { useState } from "react";
import { streamReader } from "openai-edge-stream";

export const Footer = () => {
  const [messageText, setMessageText] = useState("");
  const [incomingMessage, setIncomingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(messageText);
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
      console.log(message);
    });
  };

  return (
    <footer className="bg-[#333333] p-9">
      <form onSubmit={handleSubmit}>
        <fieldset className="flex gap-3">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full resize-none rounded-md bg-[#3d3d3d] px-3 py-1 text-white focus:border-[#FFFFFF] focus:bg-[#474747] focus:outline focus:outline-[#ffffff]"
            placeholder="Send a message..."
          />
          <button type="submit" className="btn">
            {/* <Image id="send-button" src={Send} alt={"Image"} /> */}
            Send
          </button>
        </fieldset>
      </form>
    </footer>
  );
};
