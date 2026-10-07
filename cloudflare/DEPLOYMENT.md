# Cloudflare deployment

Production domain: https://aaronjudge.net/

Project: `gm-aaronjudge` (Workers) in David’s Cloudflare account.

The manual **Deploy Cloudflare** workflow is prepared, not activated or production-tested through GitHub Actions. Activation requires this workflow on the default branch and a separately approved encrypted `CLOUDFLARE_DEPLOY_TOKEN` in the `cloudflare-production` environment or repository. No credential values are committed. The temporary migration CLI credential is not a GitHub credential.

Existing service secrets remain encrypted on the Worker. Workers configuration does not manage domains in this workflow; `--keep-vars` preserves service variables. Pages uses Wrangler Direct Upload and preserves existing project identities. Existing tracking IDs and feedback routing are retained.

This migration source preserves the previously verified Cloudflare production configuration. Original provider hosting is retained for rollback. The prepared workflow has not run a new production deployment.
