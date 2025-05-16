"use client";
import { signUp } from "@/lib/auth/auth-client"; //import the auth client
import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      reject(reader.error ?? new Error("Error converting image to Base64"));
    };
  });
};

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [image, setImage] = useState<File | null>(null);

  const handleSignUp = async () => {
    await signUp.email({
      email,
      password,
      name,
      image: image ? await convertImageToBase64(image) : "",
      callbackURL: "/",
      fetchOptions: {
        onResponse: () => {
          //
        },
        onRequest: () => {
          //
        },
        onError: (ctx: { error: { message: string } }) => {
          alert(ctx.error.message);
        },
        onSuccess: () => {
          redirect("/");
        },
      },
    });
  };

  return (
    <div>
      <Label>Name</Label>
      <Input
        type="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Label>Email</Label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label>Password</Label>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        onClick={() => void handleSignUp()}
        className="w-full mt-4 flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            fill="currentColor"
            d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          />
        </svg>
        Sign in with Email
      </Button>
    </div>
  );
}
