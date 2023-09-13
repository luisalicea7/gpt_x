import Image from "next/image";
import { Inter } from "next/font/google";
import { SignIn, SignedIn, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  // In case the user signs out while on the page.
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>GPTX - AI powered assistant</title>
      </Head>

      <div className="flex min-h-screen w-full items-center justify-center bg-[#333333] text-white">
        <div className="flex flex-col items-center">
          <div>
            <FontAwesomeIcon
              icon={faRobot}
              className="text-white text-7xl mb-2"
            />
          </div>
          <h1 className="text-4xl font-bold">Welcome to GPTX</h1>
          {/* <p className="text-lg">An AI powered assistant</p> */}

          <p className="mt-2 text-lg">
            Experience the future of conversation with our AI-powered chatbot.
          </p>
          <p className="mt-0 text-lg">Login or Sign Up to continue</p>
          <div className="mt-2 flex justify-center gap-3">
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
