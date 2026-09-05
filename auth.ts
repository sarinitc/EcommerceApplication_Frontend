import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

type AuthPayload = {
  accessToken?: string;
  token?: string;
  username?: string;

  user?: {
    id?: string | number;
    email?: string;
  };
};

type CurrentUserResponse = {
  userId?: string | number;
  username?: string;
  email?: string;
  roles?: string[];
  avatarUrl?: string;
  profileImage?: string;
};

type LoginResponse = AuthPayload & {
  data?: AuthPayload;
  payload?: AuthPayload;
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({

  ...authConfig,

  providers: [

    Credentials({

      credentials: {

        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

      },

      async authorize(credentials) {

        // 1. Get email
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim()
            : "";

        // 2. Get password
        const password =
          typeof credentials.password === "string"
            ? credentials.password
            : "";

        // 3. Validate
        if (!email || !password) {
          return null;
        }

        try {

          // 4. Send ONLY email + password
          // to Spring Boot
          const apiUrl =
            process.env.API_URL ??
            "http://localhost:8081/api/v1";
          const response = await fetch(
            `${apiUrl}/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                email,
                password,
              }),

              cache: "no-store",
            }
          );

          // 5. Login failed
          if (!response.ok) {
            return null;
          }

          // 6. Read Spring Boot response
          const result =
            (await response.json()) as LoginResponse;
          const payload =
            result.payload ??
            result.data ??
            result;

          // 7. Get JWT
          const accessToken =
            payload.accessToken ??
            payload.token;

          if (!accessToken) {
            return null;
          }

          const currentUserResponse = await fetch(
            `${apiUrl}/auth/me`,
            {
              headers: { Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, "")}` },
              cache: "no-store",
            },
          );
          const currentUserResult = currentUserResponse.ok
            ? (await currentUserResponse.json()) as { payload?: CurrentUserResponse }
            : null;
          const currentUser = currentUserResult?.payload;

          // 8. Login successful
          return {
            id: String(
              currentUser?.userId ?? payload.user?.id ?? email
            ),

            email:
              currentUser?.email ??
              payload.user?.email ??
              payload.username ??
              email,

            name:
              currentUser?.username ??
              payload.username ??
              email,

            image: currentUser?.profileImage ?? currentUser?.avatarUrl,

            backendAccessToken:
              accessToken,

            backendUserId: currentUser?.userId,

            roles: currentUser?.roles ?? [],
          };

        } catch (error) {

          console.error(
            "Login error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {

    jwt({ token, user, trigger, session }) {

      const accessToken =
        (
          user as {
            backendAccessToken?: string;
          } | undefined
        )?.backendAccessToken;

      if (accessToken) {
        token.backendAccessToken =
          accessToken;
      }

      if (typeof user?.image === "string") token.picture = user.image;
      if (trigger === "update" && typeof session?.user?.image === "string") token.picture = session.user.image;
      if (trigger === "update" && session?.user?.image === null) token.picture = undefined;

      const roles = (user as { roles?: unknown } | undefined)?.roles;
      if (Array.isArray(roles) && roles.every((role) => typeof role === "string")) {
        token.roles = roles;
      }

      const backendUserId = (user as { backendUserId?: unknown } | undefined)?.backendUserId;
      if (typeof backendUserId === "string" || typeof backendUserId === "number") {
        token.backendUserId = backendUserId;
      }

      return token;
    },

    session({ session, token }) {

      if (typeof token.picture === "string") session.user.image = token.picture;
      if (token.picture === undefined) session.user.image = null;

      if (
        typeof token.backendAccessToken
        === "string"
      ) {
        (
          session as typeof session & {
            backendAccessToken?: string;
          }
        ).backendAccessToken =
          token.backendAccessToken;
      }

      if (Array.isArray(token.roles) && token.roles.every((role) => typeof role === "string")) {
        (session.user as typeof session.user & { roles?: string[] }).roles = token.roles;
      }

      if (typeof token.backendUserId === "string" || typeof token.backendUserId === "number") {
        (session as typeof session & { backendUserId?: string | number }).backendUserId = token.backendUserId;
      }

      return session;
    },

  },

});
