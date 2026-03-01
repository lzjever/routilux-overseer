# Versioning Policy

routilux-overseer uses **semantic versioning** in the form **x.y.z** (major.minor.patch).

## Coupling with routilux

- **routilux-overseer** depends on the Routilux server API (HTTP + WebSocket). The TypeScript client in `lib/api/generated` is generated from the server's OpenAPI spec.
- The **x.y** part of the version is **coupled** with routilux: overseer **x.y** is designed to work with routilux **x.y.z**. Example: overseer `1.0.0` targets routilux `1.0.x`.
- **z (patch)** can be updated independently: you may release overseer `1.0.1` without changing routilux. Patch releases must not require any API or behavior changes in the server.

## API contract

- The contract is the **OpenAPI specification** exposed by the routilux server at `GET /openapi.json`.
- When upgrading to a new routilux **x.y**, regenerate the client: start the routilux server, then run `npm run regenerate-api` (see `scripts/regenerate-api.sh`). Commit `lib/api/generated` and `openapi.json` if they changed.

## Summary

| Part | Rule |
|------|------|
| **x.y** | Release aligned with routilux x.y; regenerate API client when routilux x.y changes. |
| **z** | Patch releases are independent; no server API breaks. |
