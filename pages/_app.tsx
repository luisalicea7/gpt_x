import "@/styles/globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Open_Sans } from "next/font/google";

config.autoAddCss = false;
const opensans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-os",
});

const publicPages = ["/sign-in/[[...index]]", "/sign-up/[[...index]]", "/"];

export default function App({ Component, pageProps }: AppProps) {
  // Get the pathname
  const { pathname } = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);

  // If the current route is listed as public, render it directly
  // Otherwise, use Clerk to require authentication
  return (
    <ClerkProvider {...pageProps}>
      {isPublicPage ? (
        <main className={`$ opensans.variable}`}>
          <Component {...pageProps} />
        </main>
      ) : (
        <>
          <SignedIn>
            <main className={`$ opensans.variable} font-body`}>
              <Component {...pageProps} />
            </main>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </ClerkProvider>
  );
}
