# Release Checklist

Use this when releasing a new **x.y** (coupled with routilux) or **z** (patch) version.

## Pre-release

1. **Version**
   - Bump `version` in `package.json` to the new x.y.z. For a coupled release, use the same **x.y** as routilux (e.g. routilux 1.0.0 → overseer 1.0.0).
2. **API client (x.y release only)**
   - When routilux x.y has changed: start the routilux server at the target version, run `npm run regenerate-api` (or `./scripts/regenerate-api.sh http://localhost:20555/openapi.json`), then commit `lib/api/generated` and `openapi.json` if changed.
3. **Tests**
   - `npm run test:run`
   - `npm run build`
   - Optionally: `npm run test:e2e` (requires **overseer dev server** on port 3000 and routilux server; see e2e/README.md).
4. **Lint**
   - `npm run lint`, `npm run format:check`.

## Release

- Tag: `git tag vx.y.z` and push, or create a GitHub Release with the same version.

## Rules

- **x.y**: Must match routilux x.y; regenerate API client from that routilux server.
- **z**: Patch only; no API regeneration required unless you need to pick up server fixes.
