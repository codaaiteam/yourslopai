---
description: Create a new game for the yourslopai platform (API + game component + page + i18n + logo + sitemap)
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
---

# New Game Creation Skill

You are creating a new game for the "Your AI Slop Bores Me" game platform. The user will describe the game concept. Follow ALL steps below precisely.

**IMPORTANT**: Do NOT push code without explicit user permission.

## Input

The user should provide:
- Game name / slug (e.g. "guess-prompt")
- Game concept / mechanics description

If not provided, ask before proceeding.

## Step-by-step Process

### 1. Research existing patterns

Before writing any code, read these reference files to understand the conventions:

**Game component pattern:**
- `src/app/games/ai-or-human/AiOrHumanGame.js` — client game component with GameFrame wrapper
- `src/app/games/ai-or-human/AiOrHuman.module.css` — game-specific CSS module
- `src/app/games/ai-or-human/page.js` — server page with SEO content, ads, FAQ
- `src/app/games/ai-or-human/layout.js` — metadata export

**Shared components:**
- `src/app/Components/GameFrame.js` — wrapper with cover screen, play button, score display
- `src/app/Components/GameWithSidebarAds.js` — layout with sidebar ads
- `src/app/games/gamePage.module.css` — shared page styles (hero, about, howto, faq sections)

**i18n pattern:**
- `src/app/[lang]/games/ai-or-human/page.js` — language route wrapper
- `src/locales/en.json` — English translations (check existing game sections for structure)

**API pattern:**
- `src/app/api/ai-or-human/route.js` or `src/app/api/guess-prompt/route.js` — game API endpoints

**Other:**
- `src/app/Components/MoreGames.js` — game list with ALL_GAMES array and FALLBACK object
- `next-sitemap.config.js` — sitemap gamePages array

### 2. Create API route (if needed)

Create `src/app/api/{slug}/route.js`:
- Use Supabase for database queries: `import { createClient } from '@supabase/supabase-js'`
- Supabase URL: `process.env.NEXT_PUBLIC_SUPABASE_URL`
- Supabase key: `process.env.SUPABASE_SERVICE_KEY`
- Main table: `youraislop_prompts` (has columns: id, question, answer_text, answer_image_url, prompt_source, status, etc.)
- Export async GET/POST functions with `NextResponse.json()` responses
- Add error handling and edge cases

### 3. Create game component

Create `src/app/games/{slug}/{GameName}Game.js`:
- `'use client'` directive at top
- Import `GameFrame` from `../../Components/GameFrame`
- Import game-specific CSS module
- Use `GameFrame` wrapper with props: `logo`, `title`, `subtitle`, `score`, `scoreLabel`, `onPlay`, `siteLink`
- `siteLink` format: `https://youraislopboresmegame.com/games/{slug}?utm_source=embed&utm_medium=game_cover&utm_campaign=play_btn`
- Implement game state machine with phases (idle, playing, gameover, etc.)
- Use `localStorage` for persisting best scores
- Use `shareCard` from `@/lib/shareImage` for share functionality

### 4. Create game CSS module

Create `src/app/games/{slug}/{GameName}.module.css`:
- Use CSS variables: `var(--font-mono)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--bg-card)`, `var(--border-color)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--shadow-sm)`, `var(--shadow-md)`
- Include responsive styles with `@media (max-width: 600px)`
- Follow existing game CSS patterns for gameOver, score display, buttons, animations

### 5. Create page.js (server component)

Create `src/app/games/{slug}/page.js`:
- Server component (no 'use client')
- Import: Header, Footer, MoreGames, QuestionFAQ, AdSense, AdsterraNativeBanner, AdsterraBanner300x250, GameWithSidebarAds, EmbedDetect
- Import the game component and locale files
- Use `params?.lang || 'en'` for locale detection
- Use `getTranslation(locale)` from `@/lib/i18n`
- Define FALLBACK object with all English text for hero, about, howToPlay, tips, faq
- Read translations from `t?.{gameName} || {}`
- Structure: GameWithSidebarAds > GameComponent, then MoreGames, ads, hero, about, howto, tips, faq sections
- Use shared styles from `../gamePage.module.css`

### 6. Create layout.js

Create `src/app/games/{slug}/layout.js`:
```js
export const metadata = {
  title: '{Game Title} – Your AI Slop Bores Me',
  description: '{Game description}',
};

export default function {GameName}Layout({ children }) {
  return children;
}
```

### 7. Create language route wrapper

Create `src/app/[lang]/games/{slug}/page.js`:
```js
import {GameName}Page from '../../../games/{slug}/page'

export default function Page({ params }) {
  return <{GameName}Page params={params} />
}
```

### 8. Generate logo

Use the KIE API to generate a logo matching the existing doodle style:

```bash
# Source env for API key
source .env.local 2>/dev/null || source .env 2>/dev/null

# Create task
curl -s -X POST 'https://api.kie.ai/api/v1/jobs/createTask' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${KIE_API_KEY}" \
  -d '{
    "model": "google/nano-banana",
    "input": {
      "prompt": "crude simple hand-drawn black ink doodle on pure white background, messy wobbly lines, childlike scribble style, no shading, no details, amateur sketch, absolutely no text or words or letters: {SUBJECT DESCRIPTION}, minimal icon logo",
      "output_format": "png",
      "image_size": "1:1"
    }
  }'

# Poll (wait ~8-10s, then check)
curl -s "https://api.kie.ai/api/v1/jobs/recordInfo?taskId={TASK_ID}" \
  -H "Authorization: Bearer ${KIE_API_KEY}"

# Download to public/logo-{slug}.png
curl -s -o public/logo-{slug}.png "{RESULT_URL}"
```

- Show the generated logo to the user for approval
- Compare with existing logos (logo-site.png, logo-ai-or-human.png, logo-ai-roast.png, logo-story-chain.png, logo-guess-prompt.png) to ensure it's visually distinct
- Regenerate if the user is not satisfied

### 9. Add translations to ALL 7 locale files

For each locale file in `src/locales/` (en.json, zh.json, ja.json, ko.json, es.json, fr.json, de.json):

**a) Add to `moreGames` section:**
```json
"{slug}Title": "Game Title",
"{slug}Desc": "Short game description."
```
Add BEFORE the `aiBananaTitle` entry.

**b) Add game-specific section** (after the `moreGames` closing brace, or after existing game sections):
```json
"{gameName}": {
  "seoTitle": "...",
  "seoDescription": "...",
  "hero": { "title": "...", "subtitle": "..." },
  "about": { "sectionTitle": "...", "p1": "...", "p2": "...", "p3": "..." },
  "howToPlay": { "sectionTitle": "...", "step1Title": "...", "step1Desc": "...", "step2Title": "...", "step2Desc": "...", "step3Title": "...", "step3Desc": "..." },
  "tips": { "sectionTitle": "...", "tip1Title": "...", "tip1Desc": "...", "tip2Title": "...", "tip2Desc": "...", "tip3Title": "...", "tip3Desc": "..." },
  "faq": { "sectionTitle": "...", "q1": "...", "a1": "...", "q2": "...", "a2": "...", "q3": "...", "a3": "...", "q4": "...", "a4": "..." }
}
```

Translate all text naturally for each language. Supported languages:
- en: English
- zh: Chinese (Simplified)
- ja: Japanese
- ko: Korean
- es: Spanish
- fr: French
- de: German

### 10. Register in MoreGames

Edit `src/app/Components/MoreGames.js`:

**a) Add to ALL_GAMES array** (before the aiBanana entry):
```js
{ slug: '{slug}', path: '/games/{slug}', logo: '/logo-{slug}.png', titleKey: '{camelSlug}Title', descKey: '{camelSlug}Desc' },
```

**b) Add to FALLBACK object:**
```js
{camelSlug}Title: 'Game Title',
{camelSlug}Desc: 'Short game description.',
```

### 11. Add to sitemap

Edit `next-sitemap.config.js` — add `'/games/{slug}'` to the `gamePages` array.

### 12. Verify

Run `npx next build` to check for errors. Fix any issues found.

### 13. Summary

Report to the user:
- Files created/modified
- The new game URL: `/games/{slug}`
- Remind them to test locally before pushing
- Do NOT commit or push unless explicitly asked
