import { UserButton } from "@clerk/nextjs";

export const Message = ({
  role,
  content,
}: {
  role: string;
  content: string;
}) => {
  return (
    <div className="grid grid-cols-[30px_1fr] gap-5 p-5 ">
      <div>avatar</div>
      <div>{content}</div>
    </div>
  );
};
