import Head from "next/head";
import { ChatSidebar, Footer } from "../../components";

export default function Home() {
  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>

      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="flex flex-col bg-[#3d3d3d]">
          <div className="flex-1">chat window</div>
          <Footer />
        </div>
      </div>
    </>
  );
}
