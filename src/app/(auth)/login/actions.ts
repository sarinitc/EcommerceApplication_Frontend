"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function authenticate(
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  try {
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      redirectTo: "/",
    });

    if (result.includes("error=CredentialsSignin")) {
      return { status: "error", message: "Invalid email or password." };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Unable to sign in right now.",
      };
    }

    return { status: "error", message: "Unable to sign in right now." };
  }
}
