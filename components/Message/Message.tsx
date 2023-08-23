// import { UserButton, clerkClient } from "@clerk/nextjs";
// import { Clerk, buildClerkProps, getAuth } from "@clerk/nextjs/server";
// import { profile } from "console";
// import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
// import Image from "next/image";

// const getProfilePicUrl = async (req: NextApiRequest, res: NextApiResponse) => {
//   const { userId } = getAuth(req);
//   const resp = await fetch(`https://api.clerk.com/v1/users/${userId}`);
//   const data = await resp.json();
//   const profilePicUrl = data.imageUrl;

//   return profilePicUrl;
// };

// export const Message = ({
//   role,
//   content,
// }: {
//   role: string;
//   content: string;
// }) => {
//   return (
//     <div className="grid grid-cols-[30px_1fr] gap-5 p-5 ">
//       {/* <div>{role === "user" && <Image src={""} alt={""} />}</div> */}
//       <div></div>
//       <div>{content}</div>
//     </div>
//   );
// };

import { UserButton, clerkClient } from "@clerk/nextjs";
import { Clerk, buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { profile } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export const Message = ({
  role,
  content,
}: {
  role: string;
  content: string;
}) => {
  const { user } = useUser();

  return (
    <div className="grid grid-cols-[30px_1fr] gap-5 p-5 ">
      <div>
        {role === "user" && (
          <Image src={user.imageUrl} alt={""} width={30} height={30} />
        )}
      </div>
      <div>{content}</div>
    </div>
  );
};
