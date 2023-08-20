// pages/example.tsx
import { UserButton } from "@clerk/nextjs";
 
export default function Example() {
  return (
    <>
			<header>
				<UserButton afterSignOutUrl="/"/>
			</header>
			<div>Content</div>
    </>
  );
}