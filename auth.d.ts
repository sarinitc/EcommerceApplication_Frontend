import "next-auth";
import "@auth/core/types";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    backendAccessToken?: string;
    backendUserId?: string | number;
    roles?: string[];
  }

  interface Session {
    backendAccessToken?: string;
    backendUserId?: string | number;
  }
}

declare module "@auth/core/types" {
  interface User {
    backendAccessToken?: string;
    backendUserId?: string | number;
    roles?: string[];
  }

  interface Session {
    backendAccessToken?: string;
    backendUserId?: string | number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    backendAccessToken?: string;
    backendUserId?: string | number;
    roles?: string[];
  }
}
