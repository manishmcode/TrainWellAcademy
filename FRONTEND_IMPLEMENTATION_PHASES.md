# Frontend implementation phases

This guide records the frontend implemented in this repository and an order for reproducing it in another project. API contracts below are inferred from frontend callers, not verified against a running backend. SEO implementation is deferred. Repository documents are reference material; this guide follows the requested frontend scope.

## Phase 1 — Project foundation and UI

Source: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/main.jsx`.

1. Set up a React application using Vite and ES modules (`"type": "module"`). This project uses JSX, not TypeScript components.
2. Bring over the React Vite plugin, Tailwind 3 configuration, PostCSS, Autoprefixer, shared CSS and required assets from `public/`.
3. Use `lucide-react` for icons. Checkout additionally uses `country-state-city` and `libphonenumber-js`.
4. Recreate shared `Header`, `Footer`, `CTA`, and the homepage sections: `Hero`, `FeaturedCourses`, `LiveClasses`, `ScalingPlan`, and `Mission`.
5. Replace company branding, images, content and navigation with the new project's values.

For this existing checkout:

```powershell
npm ci
npm run dev
```

Use the lockfile when reproducing the exact dependency set: several entries in `package.json` use `latest`. Do not assume a fresh install without the lockfile reproduces this project.

Completion check: the homepage renders at desktop and mobile widths, shared navigation works, and local assets load.

## Phase 2 — API configuration and public site settings

Source: `src/config/apiBase.js`, `src/config/api.js`, `src/config/siteDefaults.js`, `src/config/siteConfigData.js`, `src/config/site.js`, `src/services/siteConfig.js`.

Create `.env.local` from `.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:4000
VITE_API_PREFIX=/learntech-api
```

For production, set the new backend origin through the deployment environment. Restart development after environment changes; rebuild production after changes. These frontend variables are public, so do not put backend secrets in them.

`resolveApiConfig` removes trailing slashes, normalizes the prefix and avoids appending the prefix twice. With the values above, `API_ROOT` is `http://localhost:4000/learntech-api`. Development defaults to localhost; production defaults to the website URL in `siteDefaults.js`. Vite has no API proxy configured here.

Keep endpoint definitions in `api.js`, transport functions in `services/`, and form/loading/error state in components. Some current components fetch directly; their contracts are listed below.

The public settings endpoint is `GET {API_ROOT}/public/site-config`. It returns a configuration object validated by `isPublicSiteConfig`, not the ordinary `{ success, data }` envelope. Copy the validator and normalizer with the provider. The fetch has a five-second timeout, deduplicates concurrent requests and caches successful results for 60 seconds. Development refreshes settings through the provider; production consumes the snapshot produced during the build. Use `useConfigValue('website.name')` or `useSiteConfig()` in UI components.

Completion check: confirm the resolved URL, published configuration, fallback behavior and backend CORS for the new frontend origin.

## Phase 3 — Pages, access rules and redirects

Source: `src/App.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`.

This app does not use React Router. It reads `window.location.pathname`, removes a trailing slash and selects a component. Links and `window.location.href` reload the document; `window.location.replace` is used for access redirects. Query strings do not select pages.

| Route | Current behavior in React |
| --- | --- |
| `/` | Public homepage |
| `/pricing` | Public plans; admins redirect to `/live-classes/` |
| `/login`, `/signup` | Guest forms; signed-in members redirect to `/library/`; admins to `/live-classes/` |
| `/library` | Guests redirect to `/pricing/`; members wait for account data and need an active plan; admins redirect to `/live-classes/` |
| `/profile` | Guests redirect to `/login/`; signed-in users can view their account |
| `/live-classes` | Admin management page; guests redirect to `/login/`; non-admin members to `/library/` |
| `/checkout` | Guest or member checkout; admins redirect to `/live-classes/` |
| `/unsubscribe` | Public cancellation form |
| `/imprint` | Public company details |
| `/privacy`, `/privacy-policy` | Same privacy component |
| `/terms`, `/terms-conditions` | Same terms component |
| Other paths | `NotFound` component |

The homepage `LiveClasses` section is separate from the admin route. Members join live classes from inside `Library`.

Implement these access decisions only after auth helpers exist. While loading account information, render a loading state before deciding plan access. Frontend guards control the UI; the backend must enforce authentication, roles and subscription access independently.

Completion check: navigate directly and refresh each route as a guest, member without a plan, member with a plan and admin. Check the deployment caveat in Phase 10 before expecting these browser rules to work on hosting.

## Phase 4 — Login, signup and session handling

Source: `src/components/Login.jsx`, `src/components/Signup.jsx`, `src/services/auth.js`.

| API relative to `API_ROOT` | Method | JSON body | Expected success |
| --- | --- | --- | --- |
| `/auth/login` | POST | `email`, `password` | `{ success: true, data: { token, user } }` |
| `/auth/signup` | POST | `name`, `email`, `password` | `{ success: true, data: { token, user } }` |

1. Build controlled forms, password visibility controls, submit loading and error messages.
2. Signup compares confirmation locally and combines first/last name into `name`; it does not send the confirmation field.
3. Send JSON with `Content-Type: application/json`. Login and standalone signup do not attach a bearer token.
4. Call `saveAuthSession(result.data)` after success.
5. Login sends admins to `/live-classes/`, other users to `/library/`. Signup sends users to `/library/`, where access guards run again.

Storage keys are `learntechlive_token` and `learntechlive_user` in localStorage. The token is also written to a JavaScript-accessible cookie with `path=/`, a 30-day maximum age and `SameSite=Lax`. `getToken` checks JWT expiry and clears an expired session. This is an expiry convenience check, not signature verification; malformed/non-JWT tokens are not reliably rejected locally. Admin detection reads `user.is_admin`.

Rename keys consistently when reusing the implementation. `clearAuthSession` removes user, token, cached active-plan flag and cookie. Profile logout clears the local session and navigates to login; no logout API is implemented. No password-reset or email-verification API caller was found.

Completion check: valid/invalid credentials, mismatched passwords, expired token, logout and role-based destinations.

## Phase 5 — Dashboard, profile and plan access

Source: `src/services/account.js`, `src/components/Profile.jsx`, `src/components/FeaturedCourses.jsx`, `src/App.jsx`.

| API | Method | Request | Usage |
| --- | --- | --- | --- |
| `/user/dashboard` | GET | Bearer token | Account data, subscriptions and access decisions |
| `/user/profile` | PUT | Bearer token; `firstname`, `lastname`, `display_name` | Edit profile |
| `/auth/change-password` | POST | Bearer token; `old_password`, `new_password` | Change password |

Dashboard expects `{ success: true, data: ... }`. `hasActivePlan` accepts `data.user_meta.subscription_status === 'active'`, or a subscription with `status: 'active'`, or `payment_status: 'active'/'paid'` (case/whitespace normalized). The cached flag is `learntechlive_has_active_plan`.

`fetchDashboard` clears auth for missing tokens and HTTP 401/403. It also validates JSON responses and certain token-related failures. `App` fetches dashboard for signed-in non-admin users; `Profile` additionally has its own dashboard request. Profile contains account details, subscription information and password change. Its billing-address rows currently display placeholders. A successful profile edit shows a message but does not refresh the stored user automatically.

Completion check: active/inactive plan states, dashboard failure, unauthorized responses, profile save and password mismatch. Do not treat cached plan access as backend authorization.

## Phase 6 — Plans and checkout/payment APIs

Source: `src/components/Pricing.jsx`, `src/components/Checkout.jsx`, `src/config/plans.js`, `src/services/checkout.js`, `src/services/classes.js`.

`GET /plans` supplies plan data. Pricing initially uses `DEFAULT_PLANS`, then replaces it with active API plans when usable data arrives. Selecting a plan stores its ID under `learntechlive_checkout_plan_id` in sessionStorage and links to checkout. Checkout fetches active plans independently; it chooses the stored plan or the first active plan. Checkout does not use the pricing fallback if its API fails.

The implemented submission sequence is:

1. Validate the form, phone number, terms checkbox and guest password; normalize IBAN by removing spaces and uppercasing.
2. For a guest, `POST /auth/signup` with `name`, `email`, `password`, numeric `plan_id`, and `user_meta: { first_name, last_name, phone, country }`. Save the returned session.
3. `POST /subscriptions/validate-iban` with `{ iban }`. Require `data.valid`; show `data.message` when invalid.
4. `POST /subscriptions/create-payment-session` with `plan_id`, `plan_name`, `amount`, `first_name`, `last_name`, `email`, `country`, `address`, `city`, `postal_code`, and `phone`. Read `data.sessionToken`.
5. `POST /subscriptions/submit-payment` with `session_token`, `iban`, and `iban_holder_name`.
6. `POST /subscriptions/verify-payment` with `session_token` from submission, falling back to the created session token.
7. Navigate to `/profile/` after verification resolves successfully.

The checkout service sends JSON, attaches a bearer token when available, rejects non-JSON responses and HTTP failures or `success === false`, and returns `result.data`. The UI sends requests to this project's backend; it does not integrate a payment-provider browser SDK or open a hosted payment redirect. Provider settlement and verification behavior cannot be established from the frontend alone. The backend must determine authoritative price and entitlement.

Country detection additionally calls `GET https://api.ipinfo.io/lite/me?token=...`, reads `country_code`, and falls back to India on a request failure. The current browser token is hardcoded; use the new project's own configuration when porting. Country flags load from `flagcdn.com`.

Completion check: selected/missing plan, guest and member checkout, invalid phone/IBAN, failures at each payment step and successful account navigation. Use backend sandbox/test fixtures for payment verification; building the frontend does not verify payments.

## Phase 7 — Library and live-class access

Source: `src/components/Library.jsx`, `src/services/library.js`, `src/services/classes.js`.

| API | Method | Integration status |
| --- | --- | --- |
| `/library` | GET | Used by `Library`; grouped categories with `cards` |
| `/library/categories` | GET | Service helper exists; no component caller found |
| `/library/items?page=1&limit=24&category=...` | GET | Paginated helper exists; no component caller found; category is optional |
| `/classes` | GET | Used by member library and admin screen |
| `/plans` | GET | Used for plan information alongside classes |
| `/classes/:id/join` | POST | Used by the member join action; no JSON body |

Services attach a bearer token when available. Library fetch maps card image/link URLs through `withAssetQuery`, adding a project-specific cache query. Review that behavior for your new asset host. Reproduce loading, error and empty states along with category/card presentation.

Joining a class receives `data.join_path`, prefixes it with `API_ROOT`, and opens it in a new tab using `noopener,noreferrer`. Ended classes show a message. Verify the backend join-path format and enforce eligibility server-side.

Completion check: empty categories, unavailable API, expired auth, card destinations, upcoming/past classes and eligible/ineligible join attempts.

## Phase 8 — Admin class management

Source: `src/components/AdminLiveClasses.jsx`, `src/services/classes.js`, `AdminRoute` in `src/App.jsx`.

1. Restrict the screen to admin users and load classes/plans together.
2. Provide create/edit controls with validation and saving/error/success state.
3. Create with `POST /classes`; update with `PUT /classes/:id`.
4. Send `name`, `url`, `class_date`, `end_date`, `end_time`, `timezone`, `is_active`, and `plan_ids`. The form converts start/end dates to ISO strings.
5. Refresh displayed records after saving.

There is no delete-class API helper in this frontend. Do not describe class deletion as implemented.

Existing defect to fix when implementing: `src/services/classes.js` calls `clearAuthSession()` on unauthorized responses but only imports `getToken`. Import the missing function so error handling does not throw `ReferenceError`. This analysis task does not change that existing service.

Completion check: admin create/edit, invalid dates, plan associations and unauthorized API behavior.

## Phase 9 — Unsubscribe and supporting pages

Source: `src/components/Unsubscribe.jsx`, `Imprint.jsx`, `PrivacyPolicy.jsx`, `TermsConditions.jsx`, `NotFound.jsx`.

The unsubscribe form calls `POST /subscriptions/unsubscribe` without a bearer header and sends:

```json
{
  "first_name": "Example",
  "last_name": "User",
  "email": "user@example.com",
  "iban_last_5": "12345",
  "is_unsubscribe": true
}
```

It collects only the last five IBAN digits, displays the API message and resets on success. This is a subscription cancellation request, not a newsletter integration.

Supporting information pages read shared site/company configuration. No dedicated API fetch is implemented for each legal page. The base HTML also loads the Google Translate widget; this is an external script integration rather than an application business API.

Completion check: cancellation success/failure, field handling, support links and route aliases.

## Phase 10 — Build creation and hosting redirects

Source: `scripts/build.js`, `scripts/fetch-build-config.js`, `scripts/prerender.js`, `src/entry-server.jsx`, `src/main.jsx`, `vercel.json`, `public/_redirects`, `public/_headers`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm test` | Existing Node configuration regression tests |
| `npm run build` | Production configuration fetch, client bundle, SSR bundle and prerender |
| `npm run build:development` | Same pipeline in development mode; launcher defaults API origin to localhost |
| `npm run preview` | Serve the generated output locally; does not emulate hosting redirect rules |

The current production pipeline:

1. Load environment values and fetch published build configuration into `.build-data/`.
2. Run Vite client build into `dist/`.
3. Run Vite SSR build for `src/entry-server.jsx` into `dist-ssr/`.
4. Prerender routes to `dist/<route>/index.html`; the home output is `dist/index.html`.
5. Emit shared configuration scripts and remove temporary `.build-data/` and `dist-ssr/` after successful prerendering.
6. Deploy `dist/`, including copied public assets and host configuration as appropriate.

The SSR entry provides browser/storage stubs and renders an anonymous visitor. `main.jsx` hydrates pre-rendered markup when present, or mounts React into an empty root. Account pages are deliberately excluded from static prerendering.

Existing build dependency, even though SEO implementation is deferred: the script currently requires both `/public/site-config` and `/public/seo` to respond successfully within five seconds with valid objects. It derives prerender routes from `config.seo.pages`. Clearing that object would remove generated page output, so it is not the empty placeholder used for this task. A standalone Vite build can check compilation, but is not equivalent to this full deployment build.

For another project that initially has no SEO pipeline, start with a plain Vite build and configure the host to serve the application entry for known app routes. If adopting this repository's prerender pipeline, bring over its complete dependencies or first separate an explicit public-route list from metadata. Do not copy only the build command.

### Hosting behavior to resolve before reuse

`vercel.json` defines permanent www-to-apex and trailing-slash redirects. It also unconditionally redirects `/library` and `/library/` to `/pricing/`, and `/profile` and `/profile/` to `/login/`. These rules do not check the user's cookie or token.

`public/_redirects` contains equivalent forced 302 private-route redirects, with the current production domain hardcoded. It also returns `404.html` for unknown paths. It is host-specific; it is not consumed by every static host. `vercel.json` has no explicit application fallback rewrite.

Consequently, on hosts honoring these rules, signed-in users can be redirected before React evaluates their session. Login/signup and checkout success navigation are affected. When implementing the new project, serve the application shell for private routes and let the access guards run, or implement real authenticated server routing. Replace old domains and verify slash handling. Keep API paths and assets outside any application fallback.

Review `public/_headers` and `vercel.json` together for the target host. They configure security/cache headers; domain allowlists must match the new backend, assets and external integrations. Hashed assets use long-lived caching. Confirm actual deployed headers rather than relying only on local preview.

Completion check: full build with the intended backend, every direct route/refresh, login and payment destinations, unknown-path HTTP status, static assets and actual host redirect responses.

## Phase 11 — Reuse checklist and deferred work

- Replace website/company defaults, support details, links, images and host domains.
- Configure backend URL/prefix and use consistent project-specific storage keys.
- Implement the API response contracts above; distinguish used endpoints from unused service helpers.
- Resolve unconditional private-route hosting redirects and the missing auth import in `classes.js`.
- Review the cached-plan fallback on dashboard failure and standardize unauthorized handling across services.
- Verify checkout with a test backend; the frontend currently navigates after a successful verification envelope without inspecting a separate settlement status.
- Run configuration tests, compile the client/SSR entries, then run the complete API-dependent build and browser flow checks.

## Existing SEO files to carry into another project later

This is documentation only. This project's SEO remains enabled and its source files are unchanged. SEO content authoring is deferred; the following identifies the existing machinery to carry over so future data can drive it.

| Existing file | Responsibility when copied into another project |
| --- | --- |
| `src/config/siteDefaults.js` | Local website settings and `seo.defaults`, `seo.social`, `seo.pages` fallback data |
| `src/config/seoSchemas.js` | Existing schema templates; replace project-specific content for the new site |
| `src/config/seoConfig.js` | Resolve page metadata and schema from configuration |
| `src/config/seoSnapshot.js` | Validate and apply the separate published SEO snapshot |
| `src/config/seoHtml.js` | Generate escaped metadata HTML for static output |
| `src/components/SEOHead.jsx` | Apply configured metadata in the browser; already mounted in `App.jsx` |
| `src/services/seoConfig.js` | Fetch the published `/public/seo` snapshot |
| `src/config/site.js`, `src/main.jsx` | Load configuration and pass build snapshots into the application |
| `scripts/fetch-build-config.js`, `scripts/prerender.js` | Fetch published data and write metadata into generated pages |

These files depend on the API configuration, site normalizer, app entry and build setup described above; moving only `SEOHead.jsx` is insufficient. In the destination project, keep this machinery separate from page UI and replace the old site's data. Local fallback values go in `siteDefaults.js`; published data comes from `/public/seo` and takes priority. Production uses generated snapshots, so published data changes require a rebuild and deployment. Development attempts to load published settings automatically and retains defaults if loading fails.

### Empty data placeholder for the destination project only

The existing implementation uses a path-keyed object for `seo.pages`, not an array. If the destination project should start with an empty array for future entries, use a separate data module and adapt it to that existing shape. This is a proposed destination-project adaptation, not code currently implemented here:

```js
// Destination project: src/config/seoPageData.js
export const seoPageData = []

// Feed this object into the destination site's seo.pages configuration.
export const seoPages = Object.fromEntries(
  seoPageData.map(({ path, ...metadata }) => [path, metadata]),
)
```

Later entries can contain `path`, `title`, `description`, `canonical`, `image`, `noindex` and `schema` (or `schema_json`). Connect `seoPages` to the destination configuration before expecting those entries to take effect. Also replace copied fallback page data and account for published snapshots overriding local values.

Keep the destination's public prerender route list independent of this empty array: the existing prerender script iterates `config.seo.pages`, so emptying its route source would stop those pages being generated. Preserve valid default/social configuration and snapshot structure. Once data is added and wired into configuration, the existing helpers can consume it; rebuild production to publish the result.
