import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center py-10">
      <SignUp />
    </div>
  );
}
