# Postiz Architecture — Reference for a Payload Content Calendar

> Onderzoeksrapport (opensrc-analyse van github.com/gitroomhq/postiz-app) t.b.v. het Els-dashboard.
> Alle paden relatief aan de repo-root van Postiz. Stack-notitie: actuele Postiz draait scheduling op **Temporal** (niet BullMQ, ondanks oudere docs); `ioredis` alleen nog voor caching/pubsub.

## 1. Post / Content data model
`libraries/nestjs-libraries/src/database/prisma/schema.prisma` — `model Post` (L393-446). Key fields:
- **Scheduling:** `publishDate DateTime` (the scheduled moment, indexed), `delay Int @default(0)` (per-post offset for threads), `intervalInDays Int?` (recurring).
- **Lifecycle:** `state State @default(QUEUE)` — enum `State { QUEUE, PUBLISHED, ERROR, DRAFT }` (L903-908). `error String?` holds the failure message; detailed failures go to `model Errors` (L660-674).
- **Channel linkage:** `integrationId String` → `integration Integration` (one Post targets exactly one channel). Multi-channel publishing = one Post row per channel sharing a `group`.
- **Threads / groups:** `group String` (indexed) ties sibling posts together; `parentPostId String?` + self-relation `childrenPost` (L425-426) model thread chains / the multi-post editor.
- **Client linkage:** everything is scoped by `organizationId`; per-client sub-scoping is `Customer` (L301-312) attached via `Integration.customerId`, not on Post directly.
- **Content:** `content String`, `title`, `description`, `image String?` (JSON array of media refs), `settings String?` (per-provider JSON options), `tags TagsPosts[]`.
- **Provenance:** `creationMethod CreationMethod` — enum `{ UNKNOWN, WEB, MCP, API, AUTOPOST, CLI }` (L943-950).
- Other enums on Post: `APPROVED_SUBMIT_FOR_ORDER` (marketplace approval, L937-941). Soft-delete via `deletedAt` throughout.

**Takeaway voor `contentItems`:** minimum viable = `publishDate`, `state`(enum), `channelId`(FK), `groupId`(threads/multichannel), `content`+`settings`(JSON), `error`, `deletedAt`. Add `delay`/`intervalInDays` only when you build threads/recurring.

## 2. Channels / Integrations
`schema.prisma` — `model Integration` (L314-356). Shape to mirror:
- **Identity:** `providerIdentifier String` (e.g. `"linkedin"`, `"x"` — matches a provider class), `internalId String` (account id on that platform; unique per org via `@@unique([organizationId, internalId])`), `name`, `picture`, `profile`.
- **Auth:** `token String`, `refreshToken String?`, `tokenExpiration DateTime?`, `refreshNeeded Boolean`.
- **State:** `disabled Boolean`, `deletedAt`, `inBetweenSteps` (multi-step OAuth), `type String` (article vs social).
- **Config:** `postingTimes String` (JSON default slots), `additionalSettings String?`, `customInstanceDetails` (self-hosted Mastodon etc.), `customerId String?` (client attribution).
Your `contentItems.channelId` should FK to an equivalent `channels` collection keyed on `(orgId, providerIdentifier, internalId)`.

## 3. Calendar UI
`apps/frontend/src/components/launches/calendar.tsx` (+ `calendar.context.tsx`).
- **Libraries:** `dayjs` for all date math (UTC + `localizedFormat`, multi-locale); `react-dnd` (`useDrag`/`useDrop`, L37) for drag-to-reschedule; `@mantine/hooks` `useInterval` for live refresh; state via a React context (`CalendarContext`).
- **Layouts:** single component switches on a `display` prop `'day' | 'week' | 'month' | 'list'` (L572-576, L985). Week builds 7 day-columns (L351); month builds a 6-week grid from `startOfMonth` (L440-455); a time-axis grid places posts by minute-offset from `startOf('day')` (L277).
- **Drag-to-reschedule:** `useDrop({ accept: 'post', drop: ... })` (L659). On drop it computes the new datetime; if the post is already `PUBLISHED` or a past `QUEUE`, it opens a modal offering "just update details" vs "reschedule" vs cancel (L667-720), then PUTs the new `publishDate`. Draggable cards use `useDrag` with item type `'post'` (L1018).

## 4. Provider abstraction (for later auto-publish)
`libraries/nestjs-libraries/src/integrations/social/social.integrations.interface.ts`; each network implements it in `.../social/<name>.provider.ts`; shared base `libraries/nestjs-libraries/src/integrations/social.abstract.ts`. A `SocialProvider` = `IAuthenticator` + `ISocialMediaIntegration` + metadata:
- **Auth (`IAuthenticator`):** `generateAuthUrl()`, `authenticate({code,codeVerifier,refresh})` → `AuthTokenDetails{accessToken,refreshToken,expiresIn,id,username,...}`, `refreshToken(rt)`, optional `reConnect`, `analytics`, `changeNickname`, `changeProfilePicture`.
- **Publish (`ISocialMediaIntegration`):** `post(id, accessToken, PostDetails[], integration) → PostResponse[]` and optional `comment(...)`. `PostDetails{message, settings, media[], poll?}`; `PostResponse{postId, releaseURL, status}`.
- **Metadata:** `identifier`, `name`, `scopes[]`, `maxLength()`, `checkValidity()`, `editor: 'none'|'normal'|'markdown'|'html'`, `mention()`, `customFields()`.
A future publish-adapter per channel needs, minimally: `generateAuthUrl`/`authenticate`/`refreshToken` and `post(...) → {postId, releaseURL, status}`.

## 5. Scheduling architecture
Execution is a **Temporal** workflow, orchestrated by `apps/orchestrator` (Temporal worker). Deps: `@temporalio/{client,worker,workflow}` + `nestjs-temporal-core` in `package.json`.
- On save, `PostsService.startWorkflow()` (`libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts:694`) terminates any running workflow for that `postId` and starts `postWorkflowV105` (`workflowId: post_<id>`, `taskQueue: 'main'`, `TERMINATE_EXISTING`). `DRAFT` starts nothing; delete terminates via a Temporal query (`deletePost`, L655).
- The workflow (`apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.5.ts`) does a **durable `sleep()` until `publishDate`** (L97-100: `dayjs(publishDate).diff(now,'ms')`), then calls the `postSocial` activity (retry 3× / 2-min backoff); threads sleep `delay` between children (L180, L323). Search attributes let it query workflows by `postId`.
- **Serverless equivalent (NIET nu bouwen):** persistent durable timers don't exist on Vercel functions, so replace the sleep-until-publish with **a cron poller + a queue**: a scheduled function (Vercel Cron / pg_cron / Neon scheduled) runs every ~minute, `SELECT ... WHERE state='QUEUE' AND publishDate <= now()`, enqueues due items to a queue (QStash / Inngest / pg-boss) whose worker calls the publish-adapter, then flips state to `PUBLISHED`/`ERROR` with retry+backoff. Phase 1 needs none of this — just persist `state`, `publishDate`, `channelId` so the poller can be bolted on later.
