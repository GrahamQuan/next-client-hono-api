# Auth Constitution (Project Init Only)

> **Purpose**
> This document defines the *non-negotiable invariants* of authentication, session, and token handling for this project.
>
> It is loaded **once at project initialization** (Cursor / LLM context) and is **not a reusable skill**.
>
> Stack assumptions:
>
> * Next.js (TypeScript)
> * Hono (used *inside* Next.js, replacing the API layer)
> * Better Auth (session management)
> * Drizzle ORM
>
> This is **not** a traditional frontend/backend split. Next.js and Hono form a single server system.

---

## 1. Core Definitions

### Identity

**Who the user is**

* Represented by `userId` or `sub`
* Stable and unique
* Does not encode permissions or state

---

### Authentication

**How the user proves identity**

* Password
* OAuth (Google, GitHub, WeChat, etc.)
* Magic link
* Email / phone verification codes

Authentication is a **one-time action**, not a persistent state.

---

### Authorization

**What the user is allowed to do**

* Role-based (`free`, `pro`, `admin`)
* Scope-based (API permissions)
* Policy-based (RBAC / ABAC)

Authorization decisions must **not** live in JWTs beyond minimal claims.

---

### Session

**Login context + lifecycle + revocability**

This project uses **Better Auth default sessions**.

Session properties:

* One session per login
* Web and App logins create **separate sessions**
* Stored in Postgres (optionally cached in Redis)
* Long-lived
* Fully server-side
* Can be revoked at any time

Clients **never store session data**.

---

## 2. Session Access Model

* Web clients store **only a session identifier**

  * `refreshToken` or `sessionId`
* `getSession()` always means:

  * Lookup in Redis or Postgres

```text
getSession() → Redis / Postgres
```

Session is the **only source of truth** for login state.

---

## 3. Token Model

### Token vs Session

| Concept | Meaning           |
| ------- | ----------------- |
| Token   | Access credential |
| Session | Login state       |

* Tokens optimize performance
* Sessions control trust and lifecycle

---

### Access Token

* Short-lived: **5–15 minutes**
* Stateless
* Usually JWT
* Does **not** require session lookup
* Used for fast authorization

Properties:

* Proves identity quickly
* Expires naturally
* Acceptable risk if leaked (short TTL)
* Renewed via refreshToken

#### Web

* Refreshed **on the server**
* Server updates cookies
* May be mirrored in memory (e.g. Zustand)
* **Never use localStorage**

#### App

* App sends refresh request
* Server returns new token
* App updates in-memory state

---

### Refresh Token

* Long-lived: **7–30 days**
* Stateful
* **Always bound to a session**
* Requires server validation

Capabilities:

* Lifecycle control
* Revocable
* Rotatable

Rotation rule:

* Old refreshToken → issue new refreshToken
* Missing or invalid refreshToken → force re-login

#### Web

* Must be stored in `HttpOnly` cookie
* Automatically refreshed by server
* Browser does not manage token logic

#### App

* Stored in secure storage (Keychain / Keystore)
* App explicitly triggers refresh

---

## 4. JWT Definition

```text
JWT = header.payload.signature
```

* `header`: fixed metadata
* `payload`: minimal access claims (e.g. `sub`, `scope`, `exp`)
* `signature`: signed with server secret

JWTs are **access tokens only**.
JWTs are **not sessions**.

---

## 5. Cookie vs Bearer Token

### Cookie-based Auth (Web)

* Cookies carry:

  * accessToken
  * refreshToken
* refreshToken must be `HttpOnly`
* Server handles refresh automatically

Used for:

* Web apps
* Same-site or first-party contexts

---

### Bearer Token Auth (App)

```http
Authorization: Bearer <accessToken>
```

* Carries **accessToken only**
* refreshToken is never sent automatically
* App controls refresh timing

Used for:

* Mobile apps
* Third-party clients

---

## 6. Browser Cookie Constraints

### Case 1: Third-party cookies disabled

* First-party cookies allowed
* Cookie-based auth continues to work

### Case 2: All cookies disabled

* Cookie-based auth impossible
* System must:

  * Rely on bearer tokens
  * Force re-login when accessToken expires

Re-login frequency depends on accessToken TTL.

---

## 7. OAuth

* OAuth is **only a login method**
* Does not change auth / session / token model
* Represented by the `account` table

---

## 8. API Tokens (Third-party Access)

Used for:

* Integrations
* Automation

Properties:

* Short expiration
* Scoped permissions
* Revocable
* Re-created after revoke or expiry

---

## 9. User Profile Snapshot

### Problem

Some systems (e.g. AI chatbots) require business state:

* Credits
* Plan (`free` / `pro`)
* Feature flags

These **must not** live in the auth `user` table.

---

### Solution

Create a separate table:

```sql
user_profiles
- userId (FK)
- role
- credits
- metadata
```

Access pattern:

* Extract `userId` from accessToken
* Load profile from Redis or Postgres

---

### API Response Convention

```json
{
  "code": 0,
  "msg": "ok",
  "data": {},
  "user": {
    "role": "pro",
    "credits": 120
  }
}
```

* `user` is optional
* Returned only when client needs profile refresh

---

## 10. Database Schema Responsibilities

### user

* Minimal identity unit
* Authentication-agnostic

### session

* One row per login
* Web and App are separate sessions
* Revocable
* Expirable

### account

* Login methods
* OAuth providers
* Email / password bindings

### verification

* One-time verification
* Email / phone codes
* Registration and recovery flows

---

## 11. Precise Terminology

| Term           | Meaning                   |
| -------------- | ------------------------- |
| Identity       | Who you are               |
| Authentication | How you prove it          |
| Authorization  | What you can do           |
| Session        | Login context + lifecycle |
| Access Token   | Short-term proof          |
| Refresh Token  | Long-term control         |

---

## Final Invariant

> **Sessions define trust.**
> **Tokens optimize performance.**
> **Profiles describe business state.**
> **Never mix these responsibilities.**
