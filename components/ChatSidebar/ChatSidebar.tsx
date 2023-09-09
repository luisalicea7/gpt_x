import { UserButton, useAuth } from "@clerk/nextjs";
import { faMessage, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar = ({ chatId }: { chatId: string }) => {
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
  }, [chatId]);

  return (
    <div className="flex flex-col overflow-hidden text-white bg-[#292929]">
      <Link className="new-chat-btn" href="/chat">
        <FontAwesomeIcon icon={faPlus} /> Create Chat
      </Link>
      <div className="flex-1 overflow-auto bg-[#1F1F1F]">
        {chatList.map((chat: any) => (
          <Link
            className={`side-menu-item ${
              chatId === chat._id ? "bg-[#5C5C5C] hover:bg-[#5C5C5C]" : ""
            }`}
            key={chat._id}
            href={`/chat/${chat._id}`}>
            <FontAwesomeIcon icon={faMessage} />
            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap">
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <div className="p-3 flex justify-center items-center gap-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};
