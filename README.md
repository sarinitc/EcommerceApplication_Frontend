This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

and what about this should be add styles for interested add like real email send ?styles 

Yes bro — start with the Login page first.

That is the best first frontend page because after login works, you can reuse the JWT for Cart, Orders, Address, Admin, and other protected APIs.

The flow you should understand first is:

User enters:
email
password

      ↓

Login Page

      ↓

auth.service.ts

      ↓

POST /api/v1/auth/login

      ↓

Spring Boot checks:
- email exists?
- password correct?
- email verified?

      ↓

Backend returns JWT

      ↓

Frontend stores JWT

      ↓

Redirect user
For now, I recommend building only these frontend pieces:

src/
├── app/
│   └── login/
│       └── page.tsx
│
├── services/
│   └── auth.service.ts
│
├── lib/
│   └── api.ts
│
└── types/
    └── auth.ts
First create your API connection:

// src/lib/api.ts

import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8081/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
Then create the login types:

// src/types/auth.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
If your backend JWT response uses another field such as:

{
  "token": "..."
}
then your TypeScript should use:

export interface LoginResponse {
  token: string;
}
The frontend type must match your backend response.

Then create:

// src/services/auth.service.ts

import { api } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(
  request: LoginRequest
) {
  const response = await api.post(
    "/auth/login",
    request
  );

  return response.data;
}
Then your page.tsx will roughly do:

Email input
Password input
      ↓
Click Login
      ↓
handleSubmit()
      ↓
login({email, password})
      ↓
Receive JWT
The important thing is: don't start with styling first.

Start with this goal:

Can my Next.js Login page successfully call
Spring Boot /api/v1/auth/login?
Once that works, then we add:

JWT storage
↓
Axios Authorization header
↓
Redirect
↓
Error messages
↓
Nice UI
So yes: Login page first.

After Login works, I recommend:

1. Login          ← now
2. Register
3. Verify OTP
4. Forgot Password
5. Reset Password
6. Products
7. Cart
8. Address
9. Checkout
10. My Orders
If you want, the next step is for me to give you the full Next.js Login page code step-by-step, including the form, calling your Spring Boot API, storing the JWT, and showing login errors.



nd other protected APIs. The flow you shou

Start writing

and other protected APIs.

The flow you should understand first is:

You can create an file read.md for me for that rule for codex and when i give something to do it i don't want to codex scanner all file again and agian it it so wested my token . 

Done bro. I created a README.md with clear Codex rules to avoid scanning the whole repository repeatedly and wasting tokens.

It tells Codex to:

search exact files/classes first

read only target files and direct dependencies

avoid re-reading files already inspected

make focused changes only

run targeted tests instead of full-project checks

follow your backend/frontend architecture and business rules

Download README.md

One extra tip: for Codex, an AGENTS.md file is often even better for repository-level coding instructions. If you want, I can also create an AGENTS.md version from this same rule set. 


README.md
Document


Library
/
README.md


Codex Working Rules
This file defines how Codex should work on this project while avoiding unnecessary repository scans and token usage.

Main Rule
Do not scan or read the entire repository for every task.

Use the smallest amount of context needed to complete the requested change correctly.

Read Only What Is Needed
Before making changes:

Read this README.md once.

Read only the file(s) explicitly mentioned by the user.

Read direct dependencies only when required.

Do not recursively scan every folder unless the user explicitly asks for a full project review.

Do not repeatedly reopen files already read in the current task unless they changed or more context is needed.

Example:

If the user says:

Add getMyOrders() to OrderService

Start with:

OrderService

OrderRepository

related Order DTOs only if needed

Do not automatically scan authentication, products, categories, cart, address, every controller, or every entity.

Search Before Scanning
If a class, method, DTO, endpoint, or variable location is unknown:

Search for the exact class/method name first.

Open only matching files.

Avoid listing or reading the whole repository.

Broaden the search only if the exact search is insufficient.

Examples:

Search OrderService

Search mapToOrderResponse

Search AddressRequest

Search /api/v1/orders

Reuse Existing Project Patterns
Before creating a new class or endpoint, inspect one similar existing feature and follow its pattern.

Reuse existing conventions for:

ApiResponse<T>

DTO naming

exception handling

security annotations

package structure

repository style

response format

Do not create duplicate services, controllers, repositories, mappers, or DTOs if an existing one should be modified.

Keep Changes Focused
For every task:

Change only files required for that task.

Do not refactor unrelated code.

Do not rename unrelated classes.

Do not reformat the whole project.

Do not upgrade dependencies unless requested.

Do not change the database schema unless required.

After changes, summarize:

files changed

what was added or updated

any important follow-up action

Backend Architecture
Follow this flow:

Client Request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
    ↓
Service maps Entity → Response DTO
    ↓
Controller returns ApiResponse
Controller
Receive HTTP requests

Validate request DTOs

Read path/query parameters

Read authenticated user when needed

Call Service

Return HTTP status and ApiResponse

Service
Business logic

Ownership and permission checks

Entity lookup

Validation

Create/update/delete logic

Entity → Response DTO mapping

Repository
Database access only

JPA queries

No business logic

Entity
Represents database structure and relationships

Request DTO
Contains only data the client is allowed or required to send

Response DTO
Contains only data the frontend needs

Security Rules
For protected resources:

Prefer authenticated JWT identity instead of trusting user ID/email from the request.

Customers must not access another customer's private data.

ADMIN endpoints may access all records only when explicitly intended.

Never hardcode one specific email for authentication.

Examples:

GET /orders/my-orders
→ user comes from JWT

GET /addresses
→ ADMIN can retrieve all
E-Commerce Business Rules
Cart
Cart is temporary shopping data.

cart_items may be cleared after successful checkout.

Keep the Cart itself unless the design says otherwise.

Checkout
Checkout should:

Find authenticated User

Find Cart

Verify ownership

Ensure Cart is not empty

Find Payment method

Calculate or confirm totals on the backend

Create Order

Convert CartItems → OrderItems

Save Order + OrderItems

Clear CartItems

Reset Cart total

Return OrderResponse

Do not trust the frontend to provide the final order total.

Order
orders and order_items are permanent purchase history.

Prefer status changes such as CANCELLED instead of hard deletion in production.

Use enums for controlled statuses when possible.

Address
Address data belongs to users through the existing relationship.

Do not expose user_address as a controller unless there is a real use case.

Frontend Rules
Frontend should follow:

Page / Component
    ↓
Service
    ↓
API Client
    ↓
Spring Boot Backend
Suggested folders:

src/
├── app/
├── components/
├── services/
├── types/
├── lib/
├── store/
└── utils/
Rules:

Do not put all API logic inside pages/components.

Put API calls in services/.

Put shared Axios/fetch configuration in lib/api.ts.

TypeScript types should match backend Request/Response DTOs, not JPA entities.

Reuse the backend ApiResponse<T> structure.

Start with authentication before protected features.

Recommended frontend order:

1. Login
2. Register
3. Verify OTP
4. Forgot Password
5. Reset Password
6. Products
7. Cart
8. Address
9. Checkout
10. My Orders
11. Admin pages
Token-Saving Workflow
For each user request:

1. Understand the exact task
2. Identify likely target file(s)
3. Search exact class/method names
4. Read only those files
5. Read direct dependencies only if necessary
6. Make the smallest correct change
7. Run targeted checks/tests
8. Stop
Do not do this by default:

scan entire repository
↓
read every source file
↓
read all configs
↓
read all DTOs
↓
repeat for every small task
Broader scanning is allowed only when the user explicitly asks for:

full code review

architecture review

security audit

project-wide refactor

dependency migration

full test coverage analysis

Testing Rules
Run the smallest useful test first.

Examples:

Changed one service → run its unit test

Changed one controller → run its controller test if available

Changed one module → compile/test that module

Run the full test suite only when necessary

Do not repeatedly run expensive project-wide checks for a tiny isolated change.

When More Context Is Needed
If a change cannot be completed safely with the currently inspected files:

Identify the missing dependency.

Search for that exact dependency.

Read only the relevant result.

Continue.

Broad repository scanning should be the last option, not the first.

Important Instruction for Codex
Assume relevant files already read during the current task are still understood. Do not reread them without a reason.

When the user gives a specific file, class, endpoint, or error:

Start there.

When the user asks for one feature:

Work only on that feature.

When the user asks for a full review:

Broader scanning is allowed.

Quick Rule
TARGETED SEARCH
    ↓
TARGETED READ
    ↓
SMALL CHANGE
    ↓
TARGETED TEST
    ↓
DONE
Never scan the whole repository by default.

