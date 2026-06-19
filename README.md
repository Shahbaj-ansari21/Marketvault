# MarketVault v3 — Free Design Marketplace

A production-ready design marketplace with admin approval workflow, database indexing for high traffic, comment & rating system, and a no-code ad manager.

---

## What's New in v3

| Feature | Description |
|---------|-------------|
| **Admin Approval System** | New uploads are pending until an admin approves them |
| **Database Indexing** | 20+ indexes on all hot query paths for high-traffic performance |
| **Comment System** | Users can comment on any design |
| **Rating System** | 1-5 star ratings per user per design, with average displayed |
| **Admin-Gated Panel** | `/admin` only opens for whitelisted admin emails; regular users only see ads |
| **No-Code Ad Manager** | Add/edit/delete ads from the admin panel — zero code changes |
| **40+ File Formats** | CorelDRAW, Adobe Suite, Figma, Microsoft Office, CAD, and more |

---

## Features Overview

### Admin Approval Workflow
1. User uploads a design → status = `pending`
2. Design is hidden from public browsing
3. Admin sees it in the Approval Queue at `/admin`
4. Admin clicks Approve → design goes live
5. Admin clicks Reject → design stays hidden
6. Users see their own pending designs in "My Designs" with a badge

### Rating System
- Any signed-in user can rate a design 1-5 stars
- One rating per user per design (upsert)
- Average rating + total count displayed on card and detail page
- Star input on the design detail page

### Comment System
- Any signed-in user can post comments
- Users can delete their own comments
- Comments sorted newest first
- Author name links to their profile

### Admin Access Control
- Admin access is controlled by the `admin_emails` table in Supabase
- When you first sign in with your special admin email, you add it to `admin_emails`
- After that, ANY login from that email always has admin access — no code changes
- Regular users visiting `/admin` see only active advertisements (no ad manager)
- The "Admin Panel" link in the header only appears for admin users

### No-Code Ad Manager
- Add ads via the admin panel — no code changes needed
- Positions: Sidebar, Banner, Inline, Footer
- Toggle active/inactive with one click
- Auto-tracks views and clicks
- Ads auto-render on pages based on position

### Database Indexing
20+ B-tree indexes on:
- `designs`: approval_status, is_public, category_id, user_id, created_at, download_count (+ composite indexes)
- `design_ratings`: design_id + unique (design_id, user_id)
- `design_comments`: design_id + created_at
- `profiles`: email
- `admin_emails`: email (unique)
- `follows`, `downloads`, `ads`, `design_likes`

---

## Supported File Formats (40+)

| Category | Formats |
|----------|---------|
| CAD & Engineering | DWG, DXF, STL, STEP, STP, OBJ, 3MF, IGES, IGS, F3D, SKP, GCODE, NC |
| CorelDRAW | CDR, CDRX, CMX |
| Adobe Suite | AI, EPS, PSD, PSB, INDD, XD |
| Figma | FIG |
| Images & PDF | PDF, PNG, JPG, JPEG, SVG, WEBP, GIF |
| Microsoft Office | DOCX, DOC, XLSX, XLS, PPTX, PPT |
| Archives | ZIP, RAR, 7Z |

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (dark theme design system)
- **Database & Auth:** Supabase (free tier)
- **File Storage:** Telegram Bot API (completely free, unlimited)
- **Routing:** React Router v6

---

## Complete Setup Guide (Download to GitHub Public)

### Step 1 — Download the Code

1. In Bolt, click the **Download** button (top-right menu)
2. Extract the `.zip` file
3. Open the extracted folder in VS Code or your editor

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Fill in:
   - **Name:** MarketVault
   - **Database Password:** (set a strong password, save it)
   - **Region:** Choose closest to you
4. Click **Create new project** (takes ~2 minutes)
5. Once ready, go to **Settings → API**
6. Copy these values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)

### Step 4 — Run Database Migrations

In your Supabase dashboard, go to **SQL Editor** and run these SQL files IN ORDER. For each one, click **New query**, paste the SQL, and click **Run**:

1. **First**: Run `supabase/migrations/001_init.sql` — creates profiles, designs, categories, follows, downloads tables
2. **Second**: Run `supabase/migrations/20260618135432_v2_ads_likes_comments.sql` — creates ads, likes, comments tables (if not already applied)
3. **Third**: Run `supabase/migrations/20260618135639_v2_ad_click_function.sql` — ad click tracking function
4. **Fourth**: Run `supabase/migrations/20260618135935_v2_new_categories.sql` — adds CorelDRAW, Adobe, Office, Figma categories
5. **Fifth — MOST IMPORTANT**: Run the v3 migration (this adds admin approval, ratings, comments, indexing, admin emails table). The SQL is in `supabase/migrations/v3_admin_approval_ratings_indexing.sql` — copy and run the ENTIRE file.

> Alternatively, the migrations are already applied via the Supabase MCP tool in this project. If you are setting up fresh, run them in the SQL Editor.

### Step 5 — Create a Telegram Bot (Free File Storage)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "MarketVault Storage Bot")
4. Choose a username (must end with `bot`, e.g., `marketvault_bot`)
5. Copy the **Bot Token** (looks like `1234567890:ABCdefGHIjklMNO...`)

### Step 6 — Create a Telegram Channel

1. In Telegram, create a **New Channel** (private)
2. Add your bot as an **Administrator** (it needs permission to post files)
3. Get the **Channel ID**:
   - Forward a message from your channel to `@userinfobot`
   - It will reply with the chat ID (looks like `-1001234567890`)
   - OR use the channel username like `@yourchannel`

### Step 7 — Create `.env` File

In the project root (same folder as `package.json`), create a file named `.env` and add:

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHANNEL_ID=@yourchannel_or_-1001234567890
```

Replace each value with what you copied in Steps 3 and 5-6.

### Step 8 — Run Locally

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Step 9 — Set Up Admin Access (One-Time)

1. Register an account using your special admin email (e.g., `admin@yourdomain.com`)
2. Sign in with that account
3. Go to the Supabase dashboard → **SQL Editor**
4. Run this SQL (replace with YOUR email):

```sql
INSERT INTO public.admin_emails (email)
VALUES ('admin@yourdomain.com')
ON CONFLICT (email) DO NOTHING;
```

5. That's it! Now whenever you sign in with `admin@yourdomain.com`, you will:
   - See the "Admin Panel" link in the header dropdown
   - See the full `/admin` page with Approval Queue + Ad Manager
   - Be able to approve/reject uploads
   - Be able to add more admin emails from the panel itself

> To add more admins later, either run the SQL above with a new email, or use the "Add Admin Email" form in the admin panel.

### Step 10 — Test the App

1. **Register** a new user
2. **Upload** a design (it will show as "Pending Approval")
3. **Sign in as admin** → go to `/admin` → approve the design
4. The design now appears publicly in Browse and Home
5. **Rate** and **comment** on designs
6. **Add an ad** via the admin panel

### Step 11 — Push to GitHub

1. Create a GitHub account if you don't have one
2. Go to [github.com/new](https://github.com/new)
3. Repository name: `marketvault`
4. Set to **Public** (or Private if you prefer)
5. Click **Create repository**
6. In your project folder, run:

```bash
git init
git add .
git commit -m "MarketVault v3 — admin approval, ratings, comments, indexing"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/marketvault.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 12 — Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Import your `marketvault` repository
4. In the **Environment Variables** section, add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://yourproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key` |
| `VITE_TELEGRAM_BOT_TOKEN` | `your_bot_token` |
| `VITE_TELEGRAM_CHANNEL_ID` | `@yourchannel` |

5. Click **Deploy**
6. Wait ~1 minute — your live URL will be `https://marketvault.vercel.app` (or similar)
7. Your app is now live on the internet!

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User info (name, profession, bio, avatar) |
| `designs` | Uploaded designs with approval_status |
| `design_categories` | 20+ profession categories |
| `design_likes` | Like tracking per design |
| `design_comments` | User comments on designs |
| `design_ratings` | 1-5 star ratings (unique per user+design) |
| `follows` | Follow relationships |
| `downloads` | Download tracking |
| `ads` | Advertisements (no-code managed) |
| `admin_emails` | Whitelist of admin email addresses |
| `activity_log` | User activity tracking |

### Key Columns

**designs.approval_status:**
- `pending` — New upload, awaiting admin review
- `approved` — Visible publicly
- `rejected` — Hidden from public

---

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx           # Header, nav, footer (admin link conditional)
│   ├── DesignCard.tsx        # Card with likes, rating, download
│   ├── AdDisplay.tsx         # Auto-render ads by position
│   └── CommentSection.tsx    # Comments + star ratings
├── hooks/
│   ├── useAuth.ts            # Auth state
│   ├── useAdmin.ts          # Admin detection + approval queue
│   ├── useAds.ts            # Ads fetch + management
│   ├── useCategories.ts     # Categories
│   └── useRatings.ts        # Ratings + comments
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── telegram.ts          # Telegram Bot API
├── pages/
│   ├── HomePage.tsx         # Hero, trending, latest
│   ├── BrowsePage.tsx       # Search + filters + banner ad
│   ├── CategoriesPage.tsx   # All categories
│   ├── UploadPage.tsx       # Upload (sets pending status)
│   ├── DesignDetailPage.tsx # Detail + comments + ratings
│   ├── ProfilePage.tsx       # User profile
│   ├── MyDesignsPage.tsx    # My designs with approval badges
│   ├── AdminPage.tsx        # Approval queue + ad manager
│   ├── LoginPage.tsx        # Sign in
│   └── RegisterPage.tsx     # Sign up
└── types/
    └── index.ts             # All types + file format utils
```

---

## Admin FAQ

**Q: How does admin access work?**
A: The `admin_emails` table in Supabase holds whitelisted emails. When you sign in, the `is_admin()` SQL function checks if your email is in that table. If yes, you see the admin panel. No code changes needed.

**Q: How do I add more admins?**
A: Run this SQL in Supabase SQL Editor:
```sql
INSERT INTO public.admin_emails (email) VALUES ('newadmin@email.com');
```
Or use the "Add Admin Email" form in the admin panel.

**Q: What do regular users see at `/admin`?**
A: Regular users see only active advertisements on a dashboard page. They do NOT see the ad manager, approval queue, or admin controls.

**Q: How do I remove admin access?**
A: Delete the email from the `admin_emails` table:
```sql
DELETE FROM public.admin_emails WHERE email = 'email@to-remove.com';
```

---

## License

MIT — Free to use, fork, modify, and deploy.
