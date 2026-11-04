# Cloudflare Worker releases

Production: https://aaronjudge.net/ on the existing `gm-aaronjudge` Worker in account `ee641897681cddb2b23b18fb4b639034`.

Pull requests install locked dependencies, test the metadata guard, build with supported Next 16.3.8 and OpenNext 1.20.8, and dry-run the Worker bundle. Pushes to current `main` rebuild and deploy with the existing inherited `CLOUDFLARE_DEPLOY_TOKEN`; deployment secrets are unavailable to PR validation. `--keep-vars` preserves existing runtime variables and encrypted service secrets. The Wrangler configuration has no routes and does not manage custom domains.

Before upload, the workflow reads the fixed account/Worker, current deployment and rollback version IDs, custom domains, zone Worker routes, compatibility date/flags, and binding names/types. It refuses an unrelated domain or an unreviewed non-text runtime binding. No secret or configuration values enter logs or artifacts. After upload it requires this commit's version annotation, 100% traffic, and unchanged domain/route/binding metadata. Sanitized before/after evidence is retained for 30 days. HTTPS is checked independently afterward.

This PR prepares release automation; it does not prove a successful production release or authorize changing DNS, runtime secrets, or provider integrations. Root coordinates review and the first merge/release. Retain previous Cloudflare versions and original provider hosting for rollback.

Required public Actions variable, recovered from the existing live site: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-8YJK1W7906`. Existing runtime `NEWS_API_KEY`, if configured, stays encrypted on the Worker.
