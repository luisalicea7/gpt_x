import Image from "next/image";
import { Inter } from "next/font/google";
import { SignIn, SignedIn, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  // In case the user signs out while on the page.
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Dev</title>
      </Head>

      <div className="flex min-h-screen w-full items-center justify-center bg-[#333333] text-white">
        <div className="flex gap-3">
          {!!userId && <UserButton afterSignOutUrl="/" />}

          {!userId && (
            <>
              <Link className="btn" href="sign-in">
                Login
              </Link>
              <Link className="btn-secondary" href="sign-up">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );

  // return (
  //   <>
  //     <div className='min-h-screen w-full bg-[#191919] text-white text-center'>
  //       <h1>Hello! Welcome to the development phase of your application</h1>
  //     </div>
  //   </>
  // )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!!userId) {
    return {
      redirect: {
        destination: "/chat",
        permanent: false,
      },
    };
  }
  return { props: { ...buildClerkProps(ctx.req) } };
};
