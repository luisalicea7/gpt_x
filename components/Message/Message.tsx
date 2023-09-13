import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faRobot } from "@fortawesome/free-solid-svg-icons";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-okaidia.css";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";

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

  // Inside your component
  const router = useRouter();
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleRouteChange = () => {
      Prism.highlightAll();
    };

    // Run Prism.highlightAll() when the component mounts or content changes
    setTimeout(() => {
      Prism.highlightAll();
    }, 100);

    // Subscribe to route changes
    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup subscription on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [content, router, isCopied]);

  const handleCopyClick = (codeString: string, id: string) => {
    navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setIsCopied({ ...isCopied, [id]: true });
        Prism.highlightAll(); // Reapply syntax highlighting immediately
        setTimeout(() => {
          setIsCopied({ ...isCopied, [id]: false });
          Prism.highlightAll(); // Reapply syntax highlighting again
        }, 5000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  let codeBlockCount = 0;

  const components = {
    code({
      node,
      inline,
      className,
      children,
      ...props
    }: {
      node: any;
      inline?: boolean;
      className?: string;
      children: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      const id = `code-block-${codeBlockCount++}`; // Generate a unique ID for each code block

      return !inline && match ? (
        <div
          style={{
            background: "#2d2d2d",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <pre
            className={className || ""}
            {...props}
            style={{
              background: "none",
              margin: 0,
              padding: 0,
              border: "none",
              boxShadow: "none",
            }}>
            <code style={{ background: "none", border: "none" }}>
              {children}
            </code>
          </pre>
          <button
            onClick={() => handleCopyClick(String(children), id)}
            style={{
              background: "#2d2d2d",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}>
            <FontAwesomeIcon icon={isCopied[id] ? faCheck : faCopy} />
          </button>
        </div>
      ) : (
        <code className={className || ""} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-2 p-5 ${
        role === "assistant"
          ? "bg-[#5C5C5C]"
          : role === "alert"
          ? "bg-red-500"
          : ""
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
      <div className="max-w-5xl prose prose-invert px-9">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
