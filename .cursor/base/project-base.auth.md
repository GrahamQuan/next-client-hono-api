# Project Base — Auth & Identity System

> **Role of this document**
>
> This is a **project base document**.
> It is meant to be reused across multiple projects that share the same stack and security philosophy.
>
> This file is loaded **once during project initialization** (Cursor / LLM context) and defines:
>
> * Global invariants (constitution)
> * System-level architecture boundaries
> * A minimal, canonical skill set derived from those invariants
>
> Stack:
>
> * Next.js (TypeScript, App Router)
> * Hono (embedded as the API layer inside Next.js)
> * Better Auth (session lifecycle)
> * Drizzle ORM
>
> This system is **not** a traditional frontend/backend split.

---

# PART I — CONSTITUTION (Non‑Negotiable Invariants)

## 1. Identity

**Identity answers only one question: *who the user is*.**

* Represented by `userId` / `sub`
* Stable and unique
* Does not encode permissions, roles, or business state

Identity must remain valid even if:

* roles change
* plans change
* sessions are revoked

---

## 2. Authentication

**Authentication answers: *how identity is proven*.**

Supported forms:

* Password
* OAuth (Google, GitHub, WeChat, etc.)
* Magic link
* Email / phone verification codes

Authentication is:

* A **one-time action**
* Never a long-lived state

---

## 3. Authorization

**Authorization answers: *what the user can do*.**

* Role-based (`free`, `pro`, `admin`)
* Scope-based (API permissions)
* Policy-based (RBAC / ABAC)

Rules:

* Authorization must be evaluated server-side
* JWTs may carry minimal claims only
* Business state must not live in auth primitives

---

## 4. Session (Better Auth Default)

**Session = login context + lifecycle + revocability**

Properties:

* One session per login
* Web and App logins are **separate sessions**
* Stored in Postgres (Redis optional cache)
* Long-lived
* Fully server-side
* Revocable at any time

Clients never store session state.

Session is the **only source of truth** for login status.

---

## 5. Tokens vs Sessions

| Concept | Responsibility            |
| ------- | ------------------------- |
| Token   | Fast access credential    |
| Session | Trust, lifecycle, control |

Tokens optimize performance.
Sessions define trust.

---

## 6. Access Token

* Short-lived: **5–15 minutes**
* Stateless
* Usually JWT
* No session lookup required

Used for:

* Fast authorization
* Identity assertion

Properties:

* Naturally expires
* Acceptable leak risk (short TTL)
* Renewed via refreshToken

---

## 7. Refresh Token

* Long-lived: **7–30 days**
* Stateful
* Always bound to a session
* Requires server validation

Capabilities:

* Revocation
* Rotation
* Lifecycle control

Rotation rule:

* Old refreshToken → new refreshToken
* Missing / invalid refreshToken → re-login

---

## 8. JWT Definition

```
JWT = header.payload.signature
```

* Header: fixed metadata
* Payload: minimal access claims (`sub`, `scope`, `exp`)
* Signature: server secret

JWTs are **access tokens only**.
JWTs are **not sessions**.

---

## 9. Cookie vs Bearer Token

### Web (Cookie-based)

* Cookies carry accessToken + refreshToken
* refreshToken must be `HttpOnly`
* Server refreshes automatically

### App (Bearer Token)

```
Authorization: Bearer <accessToken>
```

* accessToken only
* refreshToken stored in secure storage
* App controls refresh timing

---

## 10. Browser Constraints

* Third-party cookies disabled → first-party cookies still work
* All cookies disabled → bearer tokens only, forced re-login on expiry

---

## 11. OAuth

* OAuth is only a login method
* Does not alter session or token model
* Represented by `account` table

---

## 12. API Tokens (Third‑party Access)

Used for:

* Integrations
* Automation

Properties:

* Short-lived
* Scoped
* Revocable
* Re-created on expiry or revoke

---

## 13. User Profile Snapshot

Business state (credits, plans, flags) **must not live in auth tables**.

Solution:

* Separate `user_profiles` table
* FK: `userId`
* Load via accessToken → userId

---

## 14. Database Responsibility Split

### user

* Minimal identity unit

### session

* One row per login
* Revocable
* Expirable

### account

* Login methods
* OAuth bindings

### verification

* One-time verification flows

---

# PART II — ARCHITECTURE (System Boundaries)

## 15. Next.js + Hono Model

* Single server system
* Hono replaces Next.js API routes
* Next.js handles rendering and server actions
* Hono enforces auth and authorization

Next.js:

* Does not parse JWTs
* Does not manage sessions

Hono:

* Auth boundary
* Token validation
* Session lookup

---

## 16. Session Access Flow

```
Client → Next.js → Hono → Session Store
```

All session validation happens in Hono.

---

## 17. User Profile Loading Flow

```
accessToken → userId → Redis / Postgres → userProfileSnapshot
```

Profile data is returned only when client needs refresh.

---

# PART III — CANONICAL SKILLS (Derived, Reusable)

These are **true skills**, derived from the constitution.

### Auth Skills

* `verifyAccessToken`
* `requireAuth`
* `rotateRefreshToken`
* `revokeSession`

### Session Skills

* `getSessionByRefreshToken`
* `invalidateAllSessionsForUser`

### Profile Skills

* `loadUserProfileSnapshot`
* `refreshClientUserProfile`

Skills may evolve.
The constitution must not.

---

# FINAL PRINCIPLE

> **Sessions define trust.**
> **Tokens optimize performance.**
> **Profiles represent business state.**
> **Architecture enforces boundaries.**
> **Skills do the work.**
