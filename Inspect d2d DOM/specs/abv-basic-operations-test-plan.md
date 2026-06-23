# ABV Basic Operations Test Plan

## Application Overview

Test plan for ABV Mail (www.abv.bg) covering basic user operations: account registration, login/logout, composing and sending messages, attachments and drafts, inbox management (read/reply/forward/delete/move), search, settings changes (signature, auto-reply), and password recovery. Assumes a fresh browser session and access to test accounts. Focus: functional happy paths, negative cases, boundary conditions, and error handling.

## Test Scenarios

### 1. ABV Basic Operations

**Seed:** `seed.spec.ts`

#### 1.1. Login - Happy and Negative Paths

**File:** `tests/abv/login.spec.ts`

**Steps:**
  1. Assumptions: fresh browser session, network reachable, test account exists (test.user@abv.bg / Password123).
    - expect: Homepage loads within 10s and primary login UI is visible.
    - expect: Test account credentials are available.
  2. Navigate to https://www.abv.bg and open the login form.
    - expect: Login form is displayed with fields for username and password, and a Submit button.
  3. Enter valid credentials and submit.
    - expect: Successful authentication occurs, user is redirected to Inbox or dashboard, user avatar/name is visible, unread count (if any) is shown.
  4. Log out from the account.
    - expect: User is redirected to public homepage and login entry points are visible.
  5. Attempt login with invalid password for existing account.
    - expect: Error message shown indicating invalid credentials; login is not granted; error is accessible and descriptive.
  6. Attempt login with non-existent username.
    - expect: Appropriate error or 'account not found' message shown; no sensitive info is exposed.

#### 1.2. Registration / New Account - Positive and Negative

**File:** `tests/abv/registration.spec.ts`

**Steps:**
  1. Assumptions: test environment allows new account creation or use a sandbox account flow.
    - expect: Registration entry point is visible from homepage.
  2. Open registration flow and submit valid data (unique username, valid email, strong password).
    - expect: Registration completes, confirmation page/email shown, account can be used to login.
  3. Attempt registration with missing required fields (empty username or password).
    - expect: Inline validation prevents submission and shows helpful messages.
  4. Attempt registration with weak password.
    - expect: Password policy rejected with clear guidance on required strength.

#### 1.3. Compose & Send Email

**File:** `tests/abv/compose.spec.ts`

**Steps:**
  1. Assumptions: sender test account is logged in and recipient test account exists.
    - expect: Inbox or compose control visible.
  2. Open Compose, fill To with valid recipient, Subject and Body; click Send.
    - expect: Send confirmation/toast shown; message appears in Sent folder; recipient receives the message (if reachable) or inbox shows expected message count increment.
  3. Compose and send to invalid email address format.
    - expect: Client-side validation prevents sending and shows an error for invalid recipient.
  4. Try sending an email with very large body (>100k characters).
    - expect: Application either truncates with warning or successfully sends; system remains responsive.

#### 1.4. Attachments and Size Limits

**File:** `tests/abv/attachments.spec.ts`

**Steps:**
  1. Assumptions: test account logged in; test files prepared (small.txt ~1KB, large.zip > allowed size).
    - expect: Compose attachments UI visible.
  2. Attach a small file and send.
    - expect: Attachment uploads succeed, attachment shown in Sent message, recipient can download attachment.
  3. Attach a file exceeding allowed size and attempt to send.
    - expect: User is shown a clear error about size limits; send prevented or file rejected with guidance.
  4. Attach multiple files to test concurrent uploads.
    - expect: Uploads handle multiple files; progress indicators visible; UI remains responsive.

#### 1.5. Drafts / Autosave

**File:** `tests/abv/drafts.spec.ts`

**Steps:**
  1. Assumptions: logged in and compose UI opens.
    - expect: Drafts folder exists and is accessible.
  2. Start composing message and wait without sending to trigger autosave.
    - expect: Draft is saved automatically within expected timeframe (e.g., 10-30s) and appears in Drafts.
  3. Edit saved draft and send it.
    - expect: Draft is removed from Drafts and appears in Sent; recipient receives message.

#### 1.6. Inbox Management (Read/Reply/Forward/Delete/Move/Star)

**File:** `tests/abv/inbox.spec.ts`

**Steps:**
  1. Assumptions: logged in with at least one message present; test messages available.
    - expect: Inbox list loads and messages are visible with sender, subject, date.
  2. Open a message to mark as read; verify read state.
    - expect: Message content displays; message marked as read in list; unread counter decrements.
  3. Reply to a message and send.
    - expect: Reply is sent and appears in Sent; original thread shows reply.
  4. Forward a message including attachments.
    - expect: Forward flow includes attachments (or indicates they won't be forwarded) and send completes.
  5. Delete a message; verify it moves to Trash.
    - expect: Message removed from Inbox and appears in Trash; unread counters updated.
  6. Restore message from Trash back to Inbox.
    - expect: Message restored to Inbox and appears in original folder or a default folder.
  7. Star/Unstar a message and move a message to a custom folder.
    - expect: Star state toggles; moved message appears in target folder; folder counts update accordingly.

#### 1.7. Search and Filters

**File:** `tests/abv/search.spec.ts`

**Steps:**
  1. Assumptions: inbox contains messages with varied senders, subjects, dates, and attachments.
    - expect: Search field is present and searchable.
  2. Search by sender name/email and verify results.
    - expect: Results include messages from that sender; irrelevant messages excluded; results highlight match context.
  3. Search by subject keyword and filter by date range.
    - expect: Results are correctly filtered by subject and date.
  4. Filter for only messages with attachments.
    - expect: Results include only messages that have attachments; filter toggle is accurate.

#### 1.8. Settings: Profile, Signature, Auto-reply

**File:** `tests/abv/settings.spec.ts`

**Steps:**
  1. Assumptions: logged in and settings/profile access allowed.
    - expect: Settings entry point accessible.
  2. Update account display name and signature; save changes.
    - expect: Changes persist after save and signature appears on new composed messages.
  3. Enable auto-reply with custom message and set active dates; save.
    - expect: Auto-reply is enabled; when sending a message to the account from another test account, auto-reply is received.
  4. Change time zone or language preference (if available) and verify UI updates.
    - expect: Preferences persist and UI reflects chosen locale/time settings.

#### 1.9. Password Recovery / Forgot Password

**File:** `tests/abv/password-recovery.spec.ts`

**Steps:**
  1. Assumptions: access to recovery email/phone for test account or sandbox recovery flow.
    - expect: Forgot password entry point available on login form.
  2. Initiate password recovery with valid account email/username.
    - expect: Recovery flow starts (email or SMS sent) and user receives clear next-step instructions.
  3. Attempt recovery with non-existent email.
    - expect: Application responds with neutral messaging (no account enumeration) and guidance for next steps.

#### 1.10. Logout and Session Handling

**File:** `tests/abv/logout.spec.ts`

**Steps:**
  1. Assumptions: logged in session active.
    - expect: User menu and logout option visible.
  2. Click Logout and then try using back button to access inbox.
    - expect: Logout invalidates session; using back should not restore authenticated view; user must re-login.
  3. Check session timeout (if accessible via settings) or simulate idle timeout.
    - expect: After timeout, next action requires re-authentication and sensitive pages are protected.
