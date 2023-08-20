import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center p-24 gap-20">
        <h1 className="font-bold text-2xl">Sign up to begin testing</h1>
        <SignUp />
    </div>
  )
}