# Local mirror — not the source of truth, the sibling FE repo is

Copied from `D2D Repo\microfrontend-door2door-main\src\frontend\shared\testIds\` on
**2026-09-18**. This is a static snapshot, not live-synced.

- If the sibling `D2D Repo` checkout is available on this machine, read it directly instead —
  it may have newer id constants than this copy.
- If it isn't available (different machine, or the checkout was removed/relocated), this
  mirror is the fallback: still real, git-verified id constants as of the capture date above,
  just possibly missing anything added to the FE repo after that date.
- **To refresh:** re-copy this entire folder from the live sibling path and update the date
  above. Do this whenever new FE stable-id work (a new POSS-34xx ticket) lands and this mirror
  is being relied on for that page/section.
- Never import from this folder in test/page-object code — per the project's no-cross-repo-
  dependency rule, any id needed at runtime gets hardcoded as a plain string constant in
  `src/constants/*.ts`. This folder is for humans/assistants to read, not for code to import.
