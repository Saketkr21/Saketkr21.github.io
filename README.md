# saketkr21.github.io

Personal portfolio for **Saket Kumar** — Senior Data Engineer, Bengaluru.
Built with **Astro**, deployed on **Cloudflare Pages**, blog powered by **whiz.pub**.

---

## 🚀 Local development

```bash
npm install
npm run dev
# → http://localhost:4321
```

Build for production:

```bash
npm run build
npm run preview   # serve the dist/ folder locally
```

---

## 📁 Structure

```
.
├── src/
│   ├── config.ts              # ⭐ All content lives here — edit this, not the components
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Projects.astro
│   │   ├── About.astro
│   │   ├── Experience.astro
│   │   ├── Skills.astro
│   │   ├── BlogPreview.astro   # Fetches whiz.pub RSS at build
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── pages/index.astro
│   └── styles/global.css
├── public/
│   ├── favicon.svg
│   └── SaketKumar_Resume_2026.pdf              # replace with your latest résumé PDF
├── astro.config.mjs
├── package.json
├── wrangler.toml               # Cloudflare Pages config (optional)
└── .github/workflows/deploy.yml # Auto-deploy on push
```

### Editing content

Everything customizable is in **`src/config.ts`** — bio, projects, jobs, skills, certs, links, and the whiz.pub blog URL. Components read from it.

---

## 🌐 Deploy — Cloudflare Pages (primary, recommended)

Cloudflare Pages is **free forever, unlimited bandwidth, no credit card**, global edge network. Best host for a job-search portfolio.

### Setup (one time)

1. Push this repo to GitHub (see push instructions at the bottom).
2. Go to <https://dash.cloudflare.com/> → sign up (free, no CC).
3. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
4. Authorize GitHub, select `Saketkr21/Saketkr21.github.io`.
5. In the build settings, choose these values:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (default)
   - **Node.js version**: `22`
6. Click **Save and Deploy**. First build takes ~2 minutes.

Your site is live at `https://saketkr21-portfolio.pages.dev` (or whatever project name you picked). Every push to `main` triggers a new deploy automatically.

### Custom domain (optional, still free)

- **Best**: get a free real domain via [is-a.dev](https://www.is-a.dev/) — submit a PR pointing `saket.is-a.dev` (or similar) at your CF Pages URL.
- Then in Cloudflare Pages → **Custom domains** → add `saket.is-a.dev`.

---

## 🐙 Deploy — GitHub Pages (secondary, if you want the `.github.io` URL)

The included GitHub Actions workflow at `.github/workflows/deploy.yml` builds Astro and publishes to GitHub Pages automatically. Because this is a **user site** (repo named `<user>.github.io`), the deployment target is the root of `https://saketkr21.github.io`.

### Enable GitHub Pages

1. Push this repo (see below).
2. Repo → **Settings** → **Pages** → **Source**: `GitHub Actions`.
3. Push a commit to `main`. The workflow builds Astro and deploys.

Site is live at `https://saketkr21.github.io`. Every push to `main` redeploys.

---

## ✍️ Blog integration (whiz.pub)

The **Blog** section is powered by [whiz.pub](https://whiz.pub) — a free, API-first blogging platform.

### Set it up

1. Sign up at <https://app.whiz.pub/auth/signup> and pick your subdomain (e.g. `saket`).
2. Publish your first post via web dashboard, CLI (`whiz publish post.md`), or API.
3. Edit `src/config.ts`:
   ```ts
   urls: {
     ...
     blogUrl: 'https://saket.whiz.pub',   // ← your subdomain
     blogRssEnabled: true,                 // ← flip to true
   }
   ```
4. Commit + push. The next build fetches your RSS feed at
   `https://saket.whiz.pub/rss.xml` and renders your 4 latest posts inline on the homepage.

Until you set that, the Blog section shows a friendly placeholder and the nav Blog link points to whiz.pub's landing page.

---

## 🎨 Theme (dark / light)

- Dark mode is the default.
- Respects `prefers-color-scheme` on first load.
- Toggle button in the nav flips between dark/light and remembers your choice in `localStorage`.

Colors are defined as CSS variables in `src/styles/global.css` under `:root` and `:root[data-theme='light']`.

---

## 📤 Pushing to GitHub

You said you'd handle the git commits. When you're ready:

```bash
cd Saketkr21.github.io/
git init
git add .
git commit -m "portfolio: initial astro build"
git branch -M main
git remote add origin git@github.com:Saketkr21/Saketkr21.github.io.git
git push -u origin main --force  # --force replaces the existing repo contents
```

> **Note:** the old vanilla-HTML `index.html` at the repo root is a legacy stub that redirects to `/`. After the first successful deploy, safe to remove:
> ```bash
> git rm index.html
> git commit -m "portfolio: remove legacy vanilla index.html"
> git push
> ```

---

## 🛠️ Tech

- **[Astro 5](https://astro.build/)** — static site generator, ships zero JS by default.
- **Vanilla CSS** — custom design system with CSS variables.
- **Google Fonts** — Inter (UI), JetBrains Mono (mono).
- **[whiz.pub](https://whiz.pub)** — API-first blog, RSS-integrated at build time.
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — free static host, unlimited bandwidth.

## 📄 License

Personal portfolio, all rights reserved. Feel free to take inspiration from structure/patterns.
