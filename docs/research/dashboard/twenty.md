# Twenty CRM — Reference Architecture for a Payload CRM

> Onderzoeksrapport (opensrc-analyse van github.com/twentyhq/twenty) t.b.v. het Els-dashboard.
> Paden zijn repo-relatief. Server entities: `packages/twenty-server/src/modules/*/standard-objects/*.workspace-entity.ts`; view metadata: `packages/twenty-server/src/engine/metadata-modules/`.

Note: the `.workspace-entity.ts` files in this checkout are type-declaration-stripped (field names + TS types, no `@WorkspaceField` decorators). Field metadata (select options, defaults) comes from the `twenty-standard-application/utils/field-metadata/compute-*.util.ts` files instead — cross-referenced both.

## 1. Core data model

All records extend `BaseWorkspaceEntity` (`engine/twenty-orm/base.workspace-entity.ts`): `id`, `createdAt`, `updatedAt`, `deletedAt` (soft delete). Company/Person/Opportunity also carry `position: number` (record ordering for boards/lists) plus `createdBy`/`updatedBy` actor metadata.

**Company** (`company/.../company.workspace-entity.ts`) → Payload `organisations`

| field | type |
|---|---|
| name | text |
| domainName | links (url + label) |
| linkedinLink | links |
| annualRevenue | currency (amount + code) |
| address | address (composite) |
| accountOwner | relation → workspaceMember (`accountOwnerId`) |

Relations: `people[]`, `opportunities[]`, plus `taskTargets[] / noteTargets[] / timelineActivities[] / attachments[]` (activity pattern, §2).

**Person** (`person/.../person.workspace-entity.ts`) → Payload `contacts`

| field | type |
|---|---|
| name | fullName (first + last) |
| emails | emails (primary + additional) |
| phones | phones |
| jobTitle | text |
| linkedinLink | links |
| avatarFile | file |
| company | relation → company (`companyId`, many people → one company) |

Also `pointOfContactForOpportunities[]` and the same activity relations.

**Opportunity** (`opportunity/.../opportunity.workspace-entity.ts`) → Payload `deals`

| field | type |
|---|---|
| name | text |
| amount | currency |
| closeDate | date |
| stage | **select** (default `'NEW'`) — the pipeline column, see §4 |
| pointOfContact | relation → person (`pointOfContactId`) |
| company | relation → company (`companyId`) |
| owner | relation → workspaceMember (`ownerId`) |

**Note** (`title`, `bodyV2` richText) and **Task** (`title`, `bodyV2`, `dueAt`, `status` select, `assignee` → workspaceMember) have **no direct FK** to company/person/opportunity — they attach only through their target join tables (§2).

## 2. Activities / timeline (polymorphic pattern)

Twenty does **not** use a single `(targetType, targetId)` generic column. Each activity type gets a dedicated **join entity with one nullable FK per possible parent**:

- `note/.../note-target.workspace-entity.ts` — `noteId` + `targetPersonId` | `targetCompanyId` | `targetOpportunityId` (+ `custom`). One NoteTarget row = "this note links to this one record". A note on 3 records = 3 rows.
- `task/.../task-target.workspace-entity.ts` — identical shape with `taskId`.
- `timeline/.../timeline-activity.workspace-entity.ts` — an event-log row: `happensAt` (date), `name` (event type), `properties` (JSON diff/payload), `linkedRecordCachedName`/`linkedRecordId`/`linkedObjectMetadataId`, `workspaceMemberId` (actor), plus the same per-type `target…Id` columns.

**Payload-replicatie:** one `activities` collection with a `type` select (note/task/event) and a **polymorphic relationTo array** `targets: relationship({ relationTo: ['organisations','contacts','deals'], hasMany: true })`. Payload stores `{relationTo, value}` pairs natively — cleaner than Twenty's one-column-per-type table, which only exists because Twenty must express relations as physical FK columns. Keep `happensAt`, `actor`, `properties` (JSON) for the timeline log.

## 3. Views-as-data / configurable kanban columns

Views are stored as data in the `core` schema, not code:

- **`view`** (`view/entities/view.entity.ts`) — `type` enum (`TABLE`/`KANBAN`/`CALENDAR`), `objectMetadataId`, `mainGroupByFieldMetadataId` (the **select field** the kanban groups by), `position`, `kanbanColumnWidth`, `shouldHideEmptyGroups`, `kanbanAggregateOperation`. Has many `viewFields`, `viewGroups`, `viewFilters`, `viewSorts`.
- **`viewGroup`** (`view-group/entities/view-group.entity.ts`) = **one kanban column**. Fields: `fieldValue` (string — matches a select option's `value`), `position` (column order), `isVisible`, `viewId`. That is the whole column model.
- **`viewSort`** (`fieldMetadataId` + `direction` enum), **`viewFilter`** (`fieldMetadataId` + `operand` enum + JSONB `value` + optional `viewFilterGroupId` for AND/OR groups).

**Column ↔ select option:** a kanban column binds to a select option purely by string match `viewGroup.fieldValue === option.value`. Column order = `viewGroup.position`. **Card order within a column = the record's own `position` field** (not stored on the view).

**When a select option is added / renamed / deleted** — `flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util.ts` diffs old vs new options and, per affected view:
- **deleted** option → delete viewGroups where `fieldValue === option.value`;
- **renamed** (value changed) → update those viewGroups' `fieldValue`;
- **created** option → insert a viewGroup at `highestPosition + index + 1`, visible up to `VIEW_GROUP_VISIBLE_OPTIONS_MAX`.

So "client adds/renames/reorders/deletes a stage" = editing the deals `stage` select options; columns follow automatically. Records keep their old stage string on delete (orphans are your problem to handle).

**Payload-replicatie:** copy the select-options-as-source-of-truth idea, but skip Twenty's `viewGroup` table + diff engine. Since we have one fixed pipeline (not per-user saved views), model **stages as a `stages` collection** (`{ label, value, color, position }`) the client CRUDs directly, with `deals.stage` a relationship to it. That gives add/rename/reorder/delete for free. Card order = a numeric `position` on `deals` (use fractional/lexical positions to avoid renumbering — Twenty uses a float `position`).

## 4. Pipeline stage modeling

Stage is a **SELECT field, not an entity** (`.../utils/field-metadata/compute-opportunity-standard-flat-field-metadata.util.ts` ~L164-210): options `NEW`(red)/`SCREENING`(purple)/`MEETING`(sky)/`PROPOSAL`(turquoise)/`CUSTOMER`(yellow), each `{id, value, label, position, color}`, default `'NEW'`. Standard kanban columns seeded to match in `.../utils/view-group/compute-standard-opportunity-view-groups.util.ts` (one viewGroup per stage, same `fieldValue`, same order). A stage change = an update to the record's `stage` string; it is logged as a `timelineActivity` row (`properties` JSON holds before/after) rather than a dedicated stage-history table.

## 5. Frontend board (drag-and-drop)

Library: **`@hello-pangea/dnd`** (maintained react-beautiful-dnd fork; `@dnd-kit/react` is also in `package.json` but the board uses hello-pangea) — `object-record/record-board/components/RecordBoardDragDropContext.tsx` (`<DragDropContext onDragEnd={handleDragEnd}>`). On drop, `handleDragEnd` → `useProcessBoardCardDrop` → `updateDroppedRecordOnBoard({ recordId, position }, targetRecordGroupValue)`: it writes the destination column's `fieldValue` into the record's group field (stage) **and** the new `position` in one `updateOneRecord`. Optimistic update is Apollo-cache-based — group field + position updated in the local store immediately, request fires in background (acknowledged-imperfect comment at `useProcessBoardCardDrop.ts:33`). Sorted boards block manual drops and prompt to remove sorting (`getBoardCardDropBehavior`).

**Payload-replicatie:** hello-pangea/dnd (of dnd-kit) on the client; on drop, one update setting `deal.stage` + `deal.position`; optimistic move in local React state, reconcile on response.

## 6. What NOT to copy

- **Metadata-driven dynamic object engine** (`engine/metadata-modules/*`, `twenty-orm`, `workspace-migration`, per-workspace schemas, `flat-entity-maps`) — Twenty lets users invent objects/fields at runtime and live-migrates Postgres. We have fixed collections; Payload static config + `generate:types` is the right tool. Skip entirely.
- **Multi-workspace tenancy** (`workspaceId` on every row, per-tenant schema isolation) — single-tenant for one consultancy. Drop all `workspaceId`.
- **Views-as-data machinery** (`view`/`viewField`/`viewGroup`/`viewFilter`/`viewSort` + recompute engine) — overkill for one fixed pipeline; use the `stages` collection (§3). Revisit only if the client needs multiple saved board layouts.
- **`OverridableEntity`/`SyncableEntity`/universalIdentifier/upgrade-command versioning** — infra for shipping schema to self-hosted tenants. Irrelevant on Vercel + one Neon DB.
- **Per-type FK join tables** for activities (§2) — replace with Payload's native polymorphic relationship.

**Wel kopiëren:** the three-object core (organisations/contacts/deals), composite fields (currency/links/emails/phones → Payload group fields), select-options-as-stage-source-of-truth, the polymorphic activities/timeline concept, float `position` for ordering, and soft-delete (`deletedAt`).
