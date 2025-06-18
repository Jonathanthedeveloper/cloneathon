"use client";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AuthPage() {
    const { signIn } = useAuthActions();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md [&>*]:w-full space-y-8 w-full">
        <Button onClick={() => void signIn("google")}>Signin With Google</Button>
      </div>
    </div>
  );
}
