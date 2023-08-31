import { UserButton, useAuth } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { faMessage, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <Link className="side-menu-item" href="/chat">
        <FontAwesomeIcon icon={faPlus} /> Create Chat
      </Link>
      <div className="flex-1 overflow-auto bg-[#1F1F1F]">
        {chatList.map((chat: any) => (
          <Link
            className="side-menu-item"
            key={chat._id}
            href={`/chat/${chat._id}`}>
            <FontAwesomeIcon icon={faMessage} /> {chat.title}
          </Link>
        ))}
      </div>
      <div className="p-4 flex justify-center items-center gap-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};
