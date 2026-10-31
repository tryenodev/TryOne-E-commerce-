# Chess + MBA Platforms — Architecture & Cost-Saving Plan

## Goal

Deliver **two complete digital products** — Chess Platform and MBA Platform — built together in a **single repository** with one shared backend API, one shared database, and one shared design system. Both platforms use the **same 17-page structure**, so the UI is built once and themed for each brand.

**First phase: build the UI for all 17 pages.** Backend wiring follows once the UI is approved.

---

## 1. Website Scope — 17 Pages (Per Platform)

Each platform (Chess and MBA) has the same set of pages, so design and front-end code are reused 1:1.

### Dynamic Pages (13)

**Home**
1. Home — main content, header, footer (all manageable from admin)

**Student Module**
2. Student Login — secure login
3. Feedback List — student sees feedback received
4. Feedback Details — full view of a single feedback item
5. Homework List — list of assigned homework
6. Homework Details — full view of a single homework item (with image)
7. E-Books & Resources — view and access ebooks and learning materials

**Admin Module**
8. Admin Login — secure admin login
9. Admin Dashboard — overview of students, homework, feedback
10. Admin Profile — edit name, phone number
11. Feedback Management — send feedback (text only) to selected students
12. Homework Management — post homework (title, description, image) to specific students
13. Student List — view all students; activate / reactivate / verify; share credentials (name, email, user ID, password)

### Static Pages (4)

14. About Us
15. Programs
16. Testimonials
17. Contact Us

**Total: 17 pages per platform.** Same 17 pages for Chess and MBA → built once, themed twice.

---

## 2. What We Will Build (All Apps)

| #  | Application            | Purpose                                                              | Platform        |
| -- | ---------------------- | -------------------------------------------------------------------- | --------------- |
| 1  | **Chess Web — User**   | Public + student pages for Chess (Home, Login, Feedback, Homework, E-Books, About, Programs, Testimonials, Contact) | Web (browser) |
| 2  | **Chess Web — Admin**  | Chess admin: Login, Dashboard, Profile, Feedback Mgmt, Homework Mgmt, Student List | Web (browser) |
| 3  | **Chess Mobile App**   | Same student pages as Chess web, native mobile experience            | iOS + Android   |
| 4  | **MBA Web — User**     | Public + student pages for MBA (same structure as Chess)             | Web (browser)   |
| 5  | **MBA Web — Admin**    | MBA admin (same structure as Chess admin)                            | Web (browser)   |
| 6  | **MBA Mobile App**     | Same student pages as MBA web, native mobile experience              | iOS + Android   |
| 7  | **Shared Backend API** | One backend serving all six apps                                     | Server          |

---

## 3. UI-First Approach (Phase 1)

We build the **UI of all 17 pages first**, before any backend wiring. This lets the client see and approve the full product visually before development cost grows.

**Phase 1 — UI Only (build & approve)**
- All 17 page layouts (Chess + MBA themed)
- All mobile screens for Chess and MBA
- Mock/dummy data populated so the screens look real
- Navigation between pages working end-to-end
- Responsive on mobile, tablet, desktop
- Nice clean titles, professional typography, consistent spacing on every page
- Client review and sign-off

**Phase 2 — Backend wiring**
- Connect each UI page to the shared backend API
- Authentication (student + admin login)
- Database read/write for feedback, homework, students, resources
- File uploads for homework images and e-books
- Email / credential sharing

**Phase 3 — Polish & launch**
- Final testing
- Deploy each app to its own domain
- Mobile app store submissions

### "Nice title" pass — applied to every page

Every page gets a consistent treatment:
- Clear, professional page title (H1) at the top
- Subtitle / description line under the title
- Consistent header + breadcrumb on every page
- Consistent typography, spacing, and section dividers
- Empty states with friendly messages
- Loading states (skeleton screens)
- Clear call-to-action buttons

---

## 4. Single Repository — One Source of Truth

```
project-repo/
│
├── apps/
│   ├── chess-web-user/       Chess public + student pages (10 pages)
│   ├── chess-web-admin/      Chess admin pages (6 pages)
│   ├── chess-mobile/         Chess Flutter mobile app
│   ├── mba-web-user/         MBA public + student pages (10 pages)
│   ├── mba-web-admin/        MBA admin pages (6 pages)
│   ├── mba-mobile/           MBA Flutter mobile app
│   └── api/                  Shared backend API
│
├── packages/                 Shared code — written once, used everywhere
│   ├── db/                   Database schema + client
│   ├── auth/                 Login, sessions, role-based access
│   ├── ui/                   Shared UI components
│   ├── api-contracts/        API definitions (auto-generates web + mobile clients)
│   └── config/               Shared styling, design tokens, themes
│
├── infra/                    Deployment scripts
└── docs/
```

**Benefits of a single repo:**

- One clone, one install, one CI/CD pipeline for all six products.
- A bug fix in shared code instantly applies to every app.
- Mobile and web developers always see the same up-to-date API contract.
- One place for issues, pull requests, and code reviews.

---

## 5. Hosting — Cloud-Agnostic

The same repo can be deployed to **any** provider: Vercel, AWS, DigitalOcean, Google Cloud, or a self-hosted VPS with Docker.

Each app deploys independently to its own domain:

| App                  | Example Domain          |
| -------------------- | ----------------------- |
| Chess Web — User     | chess.client.com        |
| Chess Web — Admin    | chess-admin.client.com  |
| Chess Mobile App     | App Store / Play Store  |
| MBA Web — User       | mba.client.com          |
| MBA Web — Admin      | mba-admin.client.com    |
| MBA Mobile App       | App Store / Play Store  |
| Shared Backend API   | api.client.com          |

---

## 6. The Shared Backend — One API for Everyone

A **single backend API** serves all six applications. This is where most of the savings come from.

**Shared backend handles:**

- Student authentication (login, session)
- Admin authentication (roles & permissions)
- Database access (students, feedback, homework, resources, content)
- File uploads (homework images, e-books, resources)
- Email sending (credential sharing, notifications)
- Push notifications to mobile apps
- Static page content management (Home, About, Programs, Testimonials, Contact)
- Admin profile management

Each request includes a `platform` indicator (`CHESS` or `MBA`) so the backend serves the right data. **Business logic is written once, never duplicated.**

---

## 7. What Is Shared Across All Apps

| Component                              | Shared Across All 6 Apps                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Student authentication**             | One login system with a `platform` field                                                       |
| **Admin authentication**               | One admin login + role engine                                                                  |
| **Database server**                    | One database instance with separate logical sections (`chess`, `mba`, `shared`)                |
| **File upload system**                 | One storage service for homework images, e-books, resources                                    |
| **Email service**                      | One email service for credential sharing, contact form, notifications                          |
| **Admin panel layout**                 | Sidebar, header, tables, forms used by both Chess and MBA admin                                |
| **Public site layout**                 | Header, footer, hero, content blocks reused between Chess user site and MBA user site          |
| **Mobile app shell**                   | Navigation, theming, API client, auth flow shared between Chess and MBA mobile                 |
| **All 17 page templates**              | Built once, themed twice                                                                       |
| **API framework & error handling**     | One backend framework, one response format                                                     |
| **CI/CD pipeline**                     | One build & deploy process                                                                     |
| **Monitoring, logging, error tracking**| One set of tools, one dashboard                                                                |
| **Domain, SSL, CDN**                   | Subdomains under one main domain                                                               |

---

## 8. Shared Design System

Defined in `packages/ui` and `packages/config`, used by **all six apps**:

- **Design tokens** (colors, spacing, typography, shadows) — defined once, consumed by web (Tailwind) and mobile (Flutter theme).
- **Component library** for the 17 pages: Header, Footer, Hero, Login Form, FeedbackCard, HomeworkCard, ResourceCard, StudentTable, AdminSidebar, DashboardStat, FileUploader, TextEditor, etc.
- **Per-brand theme override**: each product (Chess / MBA) gets its own colors and logo via a single theme file — without changing any component code.
- **One designer** can maintain look & feel for **all six products**.

---

## 9. Cost Savings Summary

| Area                            | Without Sharing                | With This Plan                  |
| ------------------------------- | ------------------------------ | ------------------------------- |
| Designing 17 pages              | 17 × 2 = 34 designs            | 17 designs, themed twice        |
| Building 17 page UIs            | Built 2x                       | Built once                      |
| Authentication                  | Built 2x                       | Built once                      |
| Admin portal shell              | Built 2x                       | Built once, themed twice        |
| Mobile app shell                | Built 2x                       | Built once, themed twice        |
| Database hosting                | 2 instances                    | 1 shared instance               |
| File storage                    | 2 accounts                     | 1 shared account                |
| Email service                   | 2 subscriptions                | 1 subscription                  |
| Monitoring/logging              | 2 setups                       | 1 setup                         |
| CI/CD pipelines                 | 2 pipelines                    | 1 pipeline                      |
| Domain & SSL                    | Multiple separate              | Subdomains, no extra cost       |
| Bug fixes in shared code        | Multi-repo release             | One commit, fixes everywhere    |

**Estimated initial development effort reduction: 35–45%.**
**Estimated monthly hosting cost reduction: 40–50%.**

---

## 10. Future Scalability — Clean Separation Path

Although everything starts shared for cost reasons, either platform can be **split into its own infrastructure later without rewriting**:

- **Database** uses separate logical sections per platform → exported & moved with one command.
- **API routes** prefixed per platform (`/api/chess/*`, `/api/mba/*`) → split = move folders + change one config.
- **Apps** are already independent deployments → no change needed.
- **Shared packages** can be promoted to private packages if the repos ever split.

Low cost today, no rewrite later.

---

## 11. Summary for the Client

> Both platforms — **Chess** and **MBA** — will be built inside one Git repository, each with the same **17-page structure** (13 dynamic + 4 static). All six apps (Chess web user, Chess web admin, Chess mobile, MBA web user, MBA web admin, MBA mobile) will share one backend API, one database, one authentication system, one file storage, and one design system.
>
> **Phase 1 builds the UI of all 17 pages first**, so you can see and approve the full product visually before any backend cost. Backend wiring follows in Phase 2, deployment and launch in Phase 3.
>
> Each app deploys independently to its own domain and can be hosted on any cloud provider. This approach delivers a faster launch, a consistent experience across products, significantly lower hosting and maintenance costs, and a clean path to separate either platform into its own infrastructure in the future without any rewrite.
