"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  redirectTo?: string;
};

export async function authenticate(
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const isAdminLogin = formData.get("account") === "admin";
  const redirectTo = isAdminLogin ? "/admin" : "/";
  const invalidMessage = isAdminLogin ? "Invalid credentials or this account does not have administrator access." : "Invalid email or password.";
  try {
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      account: isAdminLogin ? "admin" : "customer",
      redirect: false,
      redirectTo,
    });

    if (result.includes("error=CredentialsSignin")) {
      return { status: "error", message: invalidMessage };
    }

    return { status: "success", redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message:
          error.type === "CredentialsSignin"
            ? invalidMessage
            : "Unable to sign in right now.",
      };
    }

    return { status: "error", message: "Unable to sign in right now." };
  }
}
