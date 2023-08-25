import { UserButton, clerkClient } from "@clerk/nextjs";
import { Clerk, buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { profile } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

export const Message = ({
  role,
  content,
}: {
  role: string;
  content: string;
}) => {
  const { user } = useUser();

  function getImgUrl() {
    return user?.imageUrl;
  }

  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-2 p-5 ${
        role === "assistant" ? "bg-[#5C5C5C]" : ""
      } `}>
      <div>
        {role === "user" && (
          <Image
            src={getImgUrl()!}
            alt="user avatar"
            width={30}
            height={30}
            className="rounded-full shadow-md shadow-black/0.5"
          />
        )}

        {role === "assistant" && (
          <div className="flex items-center justify-center rounded-full w-[30px] h-[30px]">
            <FontAwesomeIcon icon={faRobot} />
          </div>
        )}
      </div>
      <div className="max-w-none prose prose-invert px-9">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
