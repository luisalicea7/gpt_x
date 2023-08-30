import { UserButton, useAuth } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { json } from "stream/consumers";

export const ChatSidebar = () => {
  const [chatList, setChatList] = useState([]);
  useEffect(() => {
    const loadChats = async () => {
      const res = await fetch("/api/chat/getChatList", {
        method: "POST",
      });
      const data = await res.json();
      console.log("CHAT LIST: ", data);
      setChatList(data?.chats);
    };
    loadChats();
  }, []);

  return (
    <div className="flex flex-col overflow-hidden text-white bg-[#292929]">
      <Link href="/chat">Create Chat</Link>
      <div className="flex-1 overflow-auto bg-[#1F1F1F]">
        {chatList.map((chat: any) => (
          <Link key={chat._id} href={`/chat/${chat._id}`}>
            {chat.title}
          </Link>
        ))}
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
