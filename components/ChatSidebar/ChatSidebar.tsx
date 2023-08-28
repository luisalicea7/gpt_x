import { UserButton, useAuth } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import { useEffect } from "react";

export const ChatSidebar = () => {
  useEffect(() => {
    const loadChats = async () => {
      const res = await fetch("/api/chat/getChatList", {
        method: "POST",
      });
      const data = await res.json();
      console.log("CHAT LIST: ", data);
    };
    loadChats();
  }, []);

  return (
    <div className="bg-[#292929]">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
