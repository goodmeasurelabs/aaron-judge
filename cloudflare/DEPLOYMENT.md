# Cloudflare Worker releases

Production: https://aaronjudge.net/ on the existing `gm-aaronjudge` Worker in account `ee641897681cddb2b23b18fb4b639034`.

Pull requests install locked dependencies, test the metadata guard, build with supported Next 16.3.8 and OpenNext 1.20.8, and dry-run the Worker bundle. Pushes to current `main` rebuild and deploy with the existing inherited `CLOUDFLARE_DEPLOY_TOKEN`; deployment secrets are unavailable to PR validation. `--keep-vars` preserves existing runtime variables and encrypted service secrets. The Wrangler configuration has no routes and does not manage custom domains.

Before upload, the workflow reads the fixed account/Worker, current deployment and rollback version IDs, compatibility date/flags, and binding names/types. It refuses route/domain configuration anywhere in Wrangler and an unreviewed non-text runtime binding. The existing account token has Individual Workers Editor access to only the three approved existing Workers; Pages access is unchanged, with no DNS or zone-route permission. No secret or configuration values enter logs or artifacts. After upload it requires this commit's version annotation, 100% traffic, and unchanged binding metadata. Sanitized before/after evidence is retained for 30 days. HTTPS is checked independently afterward.

Custom Domains do not support per-Worker roles, so this scoped CI token cannot authenticate domain/zone-route reads. The release coordinator must capture the existing domains/routes in the authenticated Cloudflare UI before and after the first release. Artifacts label this separate routing check explicitly; they do not claim API verification of routing. CI does not add, change, or remove those connections. See [Cloudflare's Workers permission model](https://developers.cloudflare.com/workers/authorization/workers/).

This PR prepares release automation; it does not prove a successful production release or authorize changing DNS, runtime secrets, or provider integrations. Root coordinates review and the first merge/release. Retain previous Cloudflare versions and original provider hosting for rollback.

Required public Actions variable, recovered from the existing live site: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-8YJK1W7906`. Existing runtime `NEWS_API_KEY`, if configured, stays encrypted on the Worker.
