# Image loading repair

**Goal:** Repair confirmed product filename encoding, profile URL resolution, and admin customer photo persistence bugs without changing page layouts.

**Approach:** Keep raw backend image values for persistence and normalize them at display boundaries. Reuse one product URL resolver across list, detail, arrivals, and dashboard routes. Proxy backend upload paths through authenticated same-origin routes without allowing arbitrary destinations or redirects. Send actual customer image files using the backend's documented multipart endpoint.

**Constraints:** Read installed Next.js route-handler docs; preserve the existing `ShopPage.tsx` edit; no backend data changes or new dependencies; no commits. The original failing browser URL is unavailable, so report live verification limits.

- [x] Add regression tests reproducing encoded product filenames, already-proxied URLs, and relative profile upload URLs.
- [x] Implement shared URL helpers and wire product routes, session/profile upload responses, and customer avatar displays.
- [x] Test and implement the bounded upload-image proxy, including authentication, invalid paths, redirects, and non-image responses.
- [x] Fix customer forms to retain files separately from previews, upload after save, and handle partial success without duplicate creation.
- [x] Run all Node regression tests, TypeScript, relevant lint checks, and an independent review.

**Verification:** 79 Node tests pass; TypeScript passes; targeted ESLint has no errors (existing native-image warnings). Live development routes return the expected 401 without a session. Signed-in visual verification and backend file existence require the user's browser session or a failing image URL.

**Review focus:** URL encoding round trips; credential forwarding only to configured backend; expired blob URLs; existing sessions; customer creation followed by upload failure.
