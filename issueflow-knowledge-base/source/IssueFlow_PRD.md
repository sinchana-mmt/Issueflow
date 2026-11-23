# IssueFlow — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Product specification  
**Product type:** Multi-user, self-hosted web application  
**Deployment:** Local deployment with Docker Compose  
**Default appearance:** Dark theme  
**Tagline:** Your work. Your issues. Your control.

---

## 1. Product vision

IssueFlow is a clean, modern, self-hosted issue-tracking application for teams. It provides a straightforward place to create projects, manage issues, track progress, collaborate, and organize work without the complexity and clutter of traditional project-management software.

IssueFlow is **manual-first**: users explicitly create issues, assign people, select priorities, update statuses, add tags, create subtasks, and mark work complete. The system may perform supporting operations such as generating issue IDs, recording activity, calculating dashboard statistics, persisting data, and sending reminders based on dates users entered. It must not independently make project-management decisions.

### 1.1 Product goals

1. Provide a premium, minimalist user interface.
2. Make issue creation and management fast and intuitive.
3. Support multiple team members with role-based permissions.
4. Provide essential project-management and collaboration functionality.
5. Keep application data on the user's own infrastructure.
6. Make installation and operation simple through Docker.
7. Avoid unnecessary automation and feature complexity.

### 1.2 Non-goals for v1

- AI-generated issues or descriptions.
- Automatic issue assignment.
- Automatic status changes.
- Automatic issue creation.
- GitHub/GitLab integrations.
- Slack integrations.
- External Jira synchronization.
- Sprint planning and velocity tracking.
- Time tracking and billing.
- Public issue portals.
- Complex workflow automation.
- Email automation.

---

## 2. Target users and roles

IssueFlow is designed for small and medium-sized teams working on shared projects.

| Role | Permissions |
|---|---|
| Admin | Full application access, user management, project management, and settings |
| Manager | Create projects, manage issues, assign members, and manage tags and workflows |
| Member | View permitted projects, create and update permitted issues, comment, and upload attachments |

### 2.1 Authentication requirements

- Email and password authentication.
- Secure password hashing.
- Session-based authentication.
- No public registration.
- Admin-controlled account creation.
- Admin can deactivate or reactivate users.
- Inactive users cannot log in.
- Users can change their own passwords.
- Role-based access control on every protected operation.

---

## 3. Core product principles

| Principle | Requirement |
|---|---|
| Manual-first | Users explicitly perform all work-management actions |
| Minimalist | Show only relevant information |
| Consistent | Use the same interaction patterns across screens |
| Fast | Avoid unnecessary page loads and complicated workflows |
| Secure | Verify permissions for every operation |
| Self-hosted | Keep data in the user's infrastructure |
| Reliable | Preserve data across container restarts |
| Transparent | Record who changed what and when |

### 3.1 Manual versus automatic behavior

| Operation | Behavior |
|---|---|
| Create issue | Manual |
| Assign issue | Manual |
| Change status | Manual |
| Set priority | Manual |
| Add tags | Manual |
| Set due date | Manual |
| Add comments | Manual |
| Create subtasks | Manual |
| Add dependencies | Manual |
| Upload attachments | Manual |
| Complete issue | Manual |
| Delete issue | Manual confirmation |
| Generate issue ID | Automatic |
| Record timestamps | Automatic |
| Record activity | Automatic |
| Calculate statistics | Automatic |
| Send due-date reminders | Automatic, based on user-entered dates |
| Persist data | Automatic |

No background process may autonomously change an issue's status, assignee, priority, or other business fields.

---

## 4. Functional requirements

### 4.1 Dashboard / Overview

The dashboard provides a concise overview of project activity and assigned work.

**Requirements**
- Total active issues.
- Issues assigned to the current user.
- Issues in progress.
- Blocked issues.
- Completed issues.
- Upcoming deadlines.
- Recently updated issues.
- My assigned issues.
- Quick access to projects.
- Notifications and reminders.

Dashboard values are calculated from existing records. The dashboard must not create or modify issues.

### 4.2 Project management

Users with appropriate permissions can create and manage projects.

**Project fields**

| Field | Description |
|---|---|
| Project name | Human-readable project name |
| Project key | Unique short identifier, e.g. `ECOM` |
| Description | Optional project description |
| Members | Users participating in the project |
| Tags | Project-specific tags |
| Status | Active or archived |
| Created by | Project creator |
| Created at | Creation timestamp |

**Project functionality**
- Create and edit projects.
- Archive projects.
- View project overview.
- Add and remove members.
- View project issues and board.
- Manage project tags.
- View project activity.

Project keys must be unique. Once issues exist, changing a project key requires a safe migration mechanism; otherwise, the key should be immutable.

### 4.3 Issue management

Issue management is the central module of IssueFlow.

**Issue fields**

| Field | Type | Required |
|---|---|---|
| Issue title | Text | Yes |
| Description | Markdown | No |
| Project | Project reference | Yes |
| Issue key | Generated ID | Automatic |
| Issue type | Enum | Yes |
| Status | Enum | Yes |
| Priority | Enum | Yes |
| Assignee | User reference | No |
| Reporter | User reference | Automatic |
| Tags | Multiple references | No |
| Due date | Date | No |
| Parent issue | Issue reference | No |
| Created at | Timestamp | Automatic |
| Updated at | Timestamp | Automatic |

**Issue types**
- Bug
- Task
- Story
- Feature
- Research

**Default statuses**
- Backlog
- To Do
- In Progress
- In Review
- Blocked
- Done

**Priorities**
- Critical
- High
- Medium
- Low

**Issue key format**

```text
ECOM-001
ECOM-002
ECOM-003

WEB-001
WEB-002
```

Issue numbers must be generated transactionally and remain unique when multiple users create issues simultaneously.

**Issue actions**
- Create and edit an issue.
- Change status and priority.
- Assign a member.
- Add or remove tags.
- Set or update a due date.
- Create subtasks.
- Add dependencies.
- Add comments.
- Upload attachments.
- Duplicate an issue.
- Archive or restore an issue.
- Delete an issue with confirmation.

Every action that changes issue data must be explicitly initiated by a user.

### 4.4 All Issues page

This is the primary issue discovery and management screen.

**Requirements**
- Display issues in a clean, configurable table.
- Search by issue key and title.
- Filter by project, status, priority, assignee, tags, and due date.
- Sort by creation date, update date, priority, and due date.
- Pagination.
- Configurable visible columns.
- Saved filters.
- Explicit selection for bulk actions.

Bulk actions apply only to issues the user explicitly selects and is authorized to modify.

### 4.5 Kanban board

The Kanban board displays issues organized by status.

**Default columns**
1. Backlog
2. To Do
3. In Progress
4. In Review
5. Blocked
6. Done

**Requirements**
- Drag-and-drop issue cards.
- Manually initiated status changes.
- Cards show title, issue key, priority, assignee, and tags.
- Filter by project, assignee, priority, and tags.
- Open issue details by selecting a card.
- Persist card ordering.
- Provide clear feedback after a successful status update.

Dragging a card is a user action. The application must not move cards automatically.

### 4.6 Issue details

The issue detail view uses a clean two-column layout.

**Main content**
- Issue title.
- Markdown description.
- Subtasks.
- Dependencies.
- Attachments.
- Comments.
- Activity history.

**Properties panel**
- Status.
- Priority.
- Assignee.
- Reporter.
- Project.
- Tags.
- Due date.
- Issue type.

All properties must be editable through clear, direct interactions, subject to permissions.

### 4.7 Subtasks

Users can manually create subtasks under a parent issue.

**Requirements**
- Each subtask receives its own issue key.
- Subtasks have their own status, priority, assignee, and due date.
- Users can edit and delete subtasks.
- Parent issues display subtask completion statistics.

Example:

```text
ECOM-101  Implement checkout
  ECOM-102  Create checkout UI
  ECOM-103  Integrate payment API
  ECOM-104  Add payment validation
```

Parent completion statistics are calculated automatically, but the parent issue is never automatically marked Done.

### 4.8 Issue dependencies

Users can manually link related issues.

**Supported relationship types**
- Blocks.
- Is blocked by (the inverse representation of Blocks).
- Relates to.
- Duplicates.

**Requirements**
- Search for existing issues.
- Select a related issue and relationship type.
- View linked issues in issue details.
- Remove dependencies.
- Prevent self-dependencies.
- Prevent circular blocking relationships.

The system must not automatically change issue status because of dependencies.

### 4.9 Comments and activity history

**Comments**
- Add comments.
- Edit own comments, subject to permissions.
- Delete own comments, subject to permissions.
- Display author and timestamp.
- Support Markdown formatting.

**Activity history records**
- Issue created.
- Issue title or description changed.
- Status changed.
- Priority changed.
- Assignee changed.
- Tags changed.
- Due date changed.
- Comment added.
- Attachment uploaded.
- Dependency added or removed.
- Issue archived or restored.

Each activity record includes actor, action, previous value when applicable, new value when applicable, and timestamp. Activity entries must be generated by the server, not trusted from the client.

### 4.10 Markdown editor

Descriptions and comments support:
- Headings.
- Bold and italic.
- Strikethrough.
- Bulleted and numbered lists.
- Checklists.
- Links.
- Inline code.
- Code blocks.
- Blockquotes.

Markdown must be sanitized before rendering to prevent script injection and unsafe HTML.

### 4.11 Attachments

Users can upload files to issues.

**Initial supported formats**
- PNG
- JPG / JPEG
- WEBP
- PDF
- TXT
- CSV
- DOCX
- XLSX
- ZIP

**Requirements**
- Default maximum file size: 20 MB.
- Display file name, size, and uploader.
- Download attachments.
- Delete attachments with permission checks.
- Store files on persistent Docker storage.
- Store attachment metadata in PostgreSQL.
- Serve files through authenticated, authorized endpoints.
- Validate MIME type, extension, and file size.

Attachments must survive container restarts and application upgrades.

### 4.12 Tags

Tags are created and managed manually.

**Requirements**
- Project-specific tags.
- Custom tag names and selectable colors.
- Multiple tags per issue.
- Search and filter by tag.
- Rename tags.
- Delete tags with appropriate handling of linked issues.

### 4.13 Search and saved filters

Search supports issue key and title. Filters support project, status, priority, assignee, tags, and due date.

Users can save frequently used filter combinations.

**Example saved filters**
- My Open Issues.
- Critical Bugs.
- Blocked Issues.
- Overdue Issues.
- Issues Due This Week.

### 4.14 Notifications and reminders

MVP notifications are in-app only.

**Notification types**
- Issue assigned.
- Comment added.
- User mentioned, if mentions are implemented.
- Due tomorrow.
- Due today.
- Overdue issue.

**Requirements**
- Notification center.
- Unread count.
- Mark one notification as read.
- Mark all as read.
- Periodic background reminder checks.
- Prevent duplicate reminders for the same event and user.

Due-date reminders use dates manually entered by users. Notifications must not change the underlying issue.

### 4.15 Export

Users with appropriate permissions can export:
- All permitted issues.
- Filtered issues.
- Project issues.
- Individual issue data.

**Supported formats:** CSV and JSON.

Exports must respect project permissions and applied filters.

---

## 5. UI and UX requirements

### 5.1 Design direction

The visual direction is **minimalist dark SaaS**. IssueFlow should feel like a modern professional productivity application, not a feature-heavy enterprise dashboard.

**Visual characteristics**
- Deep charcoal background.
- Slightly lighter sidebar.
- Dark gray surfaces.
- Subtle borders.
- Indigo primary accent.
- Green success indicators.
- Amber warning indicators.
- Red critical indicators.
- Inter typography.
- 8–12 px border radii.
- Minimal icon usage.
- Consistent spacing.
- Clear typography hierarchy.
- Subtle hover and focus states.

**Avoid**
- Excessive gradients.
- Bright colors everywhere.
- Too many dashboard cards.
- Heavy borders.
- Unnecessary animations.
- Cluttered navigation.
- Overloaded issue forms.

### 5.2 Main application layout

**Sidebar navigation**
1. Overview
2. All Issues
3. My Issues
4. Board
5. Projects
6. Tags
7. Team
8. Settings

**Top navigation**
- Current page title.
- Search.
- Notifications.
- User profile.
- Primary action, such as Create Issue.

### 5.3 Required screens

| Screen | Priority |
|---|---|
| Login | P0 |
| Overview dashboard | P0 |
| All Issues | P0 |
| Create Issue | P0 |
| Issue Details | P0 |
| Projects | P0 |
| Project Details | P0 |
| Kanban Board | P0 |
| My Issues | P0 |
| Team Management | P0 |
| Notifications | P1 |
| Settings | P1 |
| Saved Filters | P1 |

P0 screens are essential for the first usable MVP. P1 screens complete the planned MVP experience.

### 5.4 Responsive behavior

- Desktop-first experience.
- Support tablet layouts.
- Support mobile browsing and basic issue operations.
- Sidebar collapses on smaller screens.
- Tables adapt to smaller widths.
- Issue detail panels stack vertically on mobile.
- Kanban supports horizontal scrolling.

---

## 6. Technical requirements

### 6.1 Architecture

Use a **modular monolith**. The application should be easy to develop, deploy, test, and maintain without unnecessary microservices.

Main components:
- Browser-based web interface.
- Next.js application containing UI and REST API.
- PostgreSQL database.
- Separate worker process using the same application code and database.
- Persistent file storage for attachments.

### 6.2 Technology stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Icons | Lucide |
| Backend | Next.js Route Handlers |
| API validation | Zod |
| Forms | React Hook Form |
| Authentication | Better Auth |
| ORM | Prisma |
| Database | PostgreSQL 17 |
| Kanban drag-and-drop | dnd-kit |
| Markdown editor | TipTap |
| Background jobs | pg-boss |
| File storage | Docker persistent volume |
| Unit testing | Vitest |
| E2E testing | Playwright |
| Containerization | Docker + Docker Compose |

Use compatible stable package versions, pin dependencies in the lockfile, and keep database, ORM, authentication adapter, and framework versions consistent.

### 6.3 Docker requirements

**Key installation requirement:** users should not need to install Node.js, npm, or PostgreSQL on their computer. Only Docker Desktop or Docker Engine with Docker Compose is required.

**Required services**

| Container | Responsibility |
|---|---|
| app | Main web application |
| db | PostgreSQL database |
| migrate | Database migrations and bootstrap |
| worker | Reminder processing |

**Persistent volumes**
- `postgres_data`
- `attachments`

The database should not be publicly exposed by default.

The application should be accessible at:

```text
http://localhost:3000
```

**Installation workflow**

```bash
git clone <repository-url>
cd issueflow
cp .env.example .env
docker compose up --build
```

The application should:
1. Start PostgreSQL.
2. Wait for database health.
3. Run database migrations.
4. Initialize required application data.
5. Start the application.
6. Start the background worker.

A secure initial admin account must be created through a documented bootstrap process. Do not hardcode default production credentials.

For LAN access, users may publish the application port and restrict access using their firewall. Public internet deployment requires HTTPS and additional security configuration.

---

## 7. Database requirements

The initial database model should include:

| Entity | Purpose |
|---|---|
| User | User accounts and roles |
| Account | Authentication provider credentials |
| Session | Authentication sessions |
| Verification | Authentication verification tokens |
| Project | Project information |
| ProjectMember | Project membership |
| Issue | Main issue records |
| Tag | Project tags |
| IssueTag | Issue/tag relationship |
| Comment | Issue comments |
| ActivityLog | Issue history |
| Attachment | File metadata |
| Dependency | Issue relationships |
| Notification | User notifications |
| SavedFilter | Saved search filters |

Authentication-related entities must follow the actual Better Auth adapter schema.

### 7.1 Important database rules

1. Issue IDs must be generated safely inside transactions.
2. Issue keys must be unique.
3. Project and issue relationships must be validated.
4. Circular blocking dependencies must be rejected.
5. Activity records must be written in the same transaction as the relevant issue update.
6. Deactivated users must not lose historical activity records.
7. Common filters must have suitable database indexes.
8. Attachments must be stored outside the database, with metadata in PostgreSQL.
9. Database and attachment backups must be coordinated.

---

## 8. API requirements

All application APIs use the `/api/v1` prefix.

**Success response**

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error response**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

### 8.1 Main API endpoint groups

| Module | Endpoint examples |
|---|---|
| Authentication | Better Auth-managed sign-in, sign-out, and session endpoints |
| Users | `GET/POST /users`, `PATCH /users/:id` |
| Projects | `GET/POST /projects`, `PATCH /projects/:id` |
| Project members | `/projects/:id/members` |
| Issues | `GET/POST /issues`, `GET/PATCH/DELETE /issues/:id` |
| Subtasks | `/issues/:id/subtasks` |
| Tags | `/projects/:id/tags`, `/tags/:id` |
| Comments | `/issues/:id/comments` |
| Attachments | `/issues/:id/attachments` |
| Dependencies | `/issues/:id/dependencies` |
| Activity | `/issues/:id/activity` |
| Notifications | `/notifications` |
| Saved filters | `/filters` |
| Exports | `/exports/issues.csv`, `/exports/issues.json` |

All endpoints must validate inputs, authenticate the user, check permissions, and call the appropriate service layer. Business logic must not be implemented directly inside route handlers.

---

## 9. Security requirements

Security is essential even for local self-hosted installations.

- Secure password hashing.
- HTTP-only authentication cookies with appropriate security settings.
- Role-based access control.
- Project-level authorization.
- Input validation with Zod.
- File upload validation.
- Markdown sanitization.
- Protection against SQL injection.
- Login rate limiting.
- Secure secret management.
- Audit logging for important administrative actions.
- No public attachment URLs.
- No hardcoded credentials.
- No database port exposure by default.

Every issue, project, attachment, comment, and notification access must be checked against the authenticated user's permissions.

---

## 10. Backup and recovery

IssueFlow must protect user data.

**Backup requirements**
- PostgreSQL database backup.
- Attachment directory backup.
- Daily automated backup capability.
- Keep seven daily backup sets by default.
- Allow backups to be stored outside Docker volumes.
- Document restoration steps.
- Test restoration before declaring the product production-ready.

A database backup without its corresponding attachments is not a complete backup.

---

## 11. Non-functional requirements

| Requirement | Initial target |
|---|---|
| Dashboard loading | Under 2 seconds under normal test conditions |
| Issue detail loading | Under 1 second under normal test conditions |
| Typical issue search | Under 1 second under normal test conditions |
| Typical API response | Under 500 ms, excluding file transfers |
| Initial concurrent users | 10–20 |
| Initial data target | 50,000+ issues |
| Maximum attachment size | 20 MB by default |
| Data persistence | Across container restarts |
| Browser support | Current Chrome, Firefox, Edge, and Safari |

These are initial performance targets, not guaranteed limits. Validate them on representative hardware and datasets.

---

## 12. Acceptance criteria

The MVP is considered functionally complete when this end-to-end scenario succeeds:

1. An admin starts IssueFlow using Docker Compose.
2. The admin logs in.
3. The admin creates a project.
4. The admin creates team members.
5. The admin adds members to the project.
6. A member manually creates an issue.
7. The application generates a unique issue key.
8. The member sets status, priority, assignee, tags, and due date.
9. The member creates subtasks.
10. The member adds issue dependencies.
11. The member adds a Markdown comment.
12. The member uploads an attachment.
13. The member manually moves the issue across Kanban columns.
14. The activity history records the changes.
15. The dashboard reflects the updated issue data.
16. Due-date reminders appear when appropriate.
17. The member exports permitted issue data.
18. The containers restart without losing application data.

Tests must also verify that unauthorized users cannot access or modify restricted resources.

---

## 13. Development roadmap

| Phase | Scope | Priority |
|---|---|---|
| 1 | Docker setup, database, migrations, app foundation | P0 |
| 2 | Authentication, users, roles, and permissions | P0 |
| 3 | Projects and project membership | P0 |
| 4 | Issue CRUD and issue details | P0 |
| 5 | Search, filters, tags, and saved filters | P0 |
| 6 | Kanban board | P0 |
| 7 | Comments, activity, and Markdown | P0 |
| 8 | Subtasks and dependencies | P0 |
| 9 | Attachments | P1 |
| 10 | Dashboard and reminders | P1 |
| 11 | Export and backup/restore | P1 |
| 12 | Testing, security review, and production packaging | P0 |

---

## 14. Definition of done

The IssueFlow MVP is complete when:

- All core features work end to end.
- The UI is consistent with the approved dark design.
- All work-management changes are user-initiated.
- Role and project permissions are enforced.
- Important issue changes are recorded.
- Attachments are securely stored.
- Data persists across restarts.
- Docker installation works without host Node.js or PostgreSQL.
- Database migrations work on both fresh and existing installations.
- Automated tests cover critical workflows.
- Backup and restore procedures are documented and tested.

---

## 15. Final product direction

IssueFlow should be built as a polished, practical issue tracker rather than a feature-heavy Jira clone.

The most important priorities are:

1. **Excellent UI:** The application should look and feel premium.
2. **Simple workflows:** Common operations should require as few interactions as possible.
3. **Manual control:** Users own every project-management decision.
4. **Reliable functionality:** Issues, comments, attachments, and activity must work correctly.
5. **Easy deployment:** Docker should handle the entire technology stack.
6. **Maintainable architecture:** The codebase should be structured for future development.

**Product success means a team can manage its issue-tracking workflow through IssueFlow without needing Jira, while retaining full control of its data and decisions.**
