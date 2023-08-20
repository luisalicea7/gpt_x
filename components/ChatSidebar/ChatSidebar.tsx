import { UserButton } from "@clerk/nextjs";

export const ChatSidebar = () => {
  return (
    <div className="bg-[#292929]">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
