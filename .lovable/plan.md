

## Admin Dashboard Overhaul Plan

### Problems Identified

1. **Studio Submissions tab** queries `studio_submissions` but the admin user may not have the `admin` role in `user_roles` (only whitelisted by email), causing RLS to block the query. The `StudioSubmissionsTab` component has no error handling for failed queries.
2. **DMCA requests** table exists but there's no admin tab to view/manage them.
3. **Content Reports** tab (`ReportQueue`) exists as a component but is **not wired into the admin page tabs** at all.
4. **Analytics tab** is mostly a placeholder with no real data visualization.
5. **No "add" or "edit" capabilities** on Creators, Series, or Payouts tabs — they're read-only tables with no inline editing.
6. Several tabs lack error state handling (queries fail silently or show infinite loading).

### Plan

#### 1. Fix RLS / data loading issues

- The `useIsOwnerOrAdmin` hook checks owner emails OR `user_roles` admin role. But table RLS policies (e.g., `studio_submissions`, `content_moderation_queue`, `dmca_requests`) only check `has_role(auth.uid(), 'admin')`. **Solution**: Ensure the owner email accounts have the `admin` role in `user_roles` via a migration INSERT, OR create a database function `is_admin_or_owner` that checks both. The cleaner approach is to ensure admin role is assigned to owner accounts.
- Add `onError` callbacks and error UI to all query hooks so failed fetches show an error message instead of infinite spinners.

#### 2. Add missing tabs to the admin sidebar

- **Reports** tab — wire in the existing `ReportQueue` component (it's imported nowhere in AdminPage).
- **DMCA** tab — create a new `DmcaTab` component to list/manage `dmca_requests` (approve, reject, add notes).

#### 3. Add CRUD capabilities to existing tabs

- **Creators tab**: Add inline status toggle (active/suspended), edit display name, and a "Create Payout" button per creator.
- **Series tab**: Add inline status change (pending → approved/rejected), delete series, and click-to-view detail.
- **Payouts tab**: Add "Create Payout" dialog (select creator, amount, method, notes) using the existing `useCreatePayout` hook which is already defined but never used in the UI.
- **Studio Submissions tab**: Add admin notes field and inline edit capability.

#### 4. Enhance Analytics tab

- Replace placeholder with actual data: top series by chapters, top creators by earnings, user signup trend (using `profiles.created_at` grouped by month), content breakdown pie (series by status).
- Use simple CSS bar charts (no external charting library needed).

#### 5. Add DMCA management tab

- New component `src/components/admin/DmcaTab.tsx` querying `dmca_requests` table.
- List with status filters (pending/approved/rejected), admin notes editing, status updates.

#### 6. Wire Reports tab

- Add `{ id: "reports", label: "Reports", icon: Flag }` to TABS array.
- Import and render `ReportQueue` component.

#### 7. Error boundaries per tab

- Wrap each tab render in a try/catch or add `isError` handling from React Query to show actionable error messages.

### Files to modify
- `src/pages/AdminPage.tsx` — Add reports/DMCA tabs, add CRUD dialogs to Creators/Series/Payouts tabs, enhance Analytics
- `src/hooks/useAdminData.ts` — Add DMCA query hooks, add error handling
- `src/components/admin/StudioSubmissionsTab.tsx` — Add admin notes editing, error state
- `src/components/admin/DmcaTab.tsx` — New file for DMCA management

### Database changes
- Migration to ensure owner accounts have admin role in `user_roles` (data insert, not schema change — use insert tool)
- No schema changes needed; all tables already exist

