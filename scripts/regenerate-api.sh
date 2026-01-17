#!/usr/bin/env bash
# Regenerate TypeScript API client from a live OpenAPI spec.
#
# Fetches OpenAPI JSON from a URL (default: http://localhost:20555/openapi.json),
# saves to openapi.json, then runs openapi-typescript-codegen to update lib/api/generated.
#
# Usage:
#   ./scripts/regenerate-api.sh                    # use default URL
#   ./scripts/regenerate-api.sh http://localhost:20555/openapi.json
#   npm run regenerate-api
#   npm run regenerate-api -- http://other:8080/openapi.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVerseer_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$OVerseer_DIR" || exit 1

OPENAPI_URL="${1:-http://localhost:20555/openapi.json}"

echo "=========================================="
echo "Regenerating TypeScript API Client"
echo "=========================================="
echo ""

# 1) Fetch OpenAPI spec
echo "[1/3] Fetching OpenAPI from: $OPENAPI_URL"
if ! curl -sL -f "$OPENAPI_URL" -o openapi.json; then
  echo "❌ Failed to fetch OpenAPI from $OPENAPI_URL (is the server running?)"
  exit 1
fi
echo "   Saved to: openapi.json"
echo ""

# 2) Generate client
echo "[2/3] Generating TypeScript client (openapi-typescript-codegen)..."
echo "   Input:  openapi.json"
echo "   Output: lib/api/generated"
if ! npx openapi-typescript-codegen --input openapi.json --output lib/api/generated; then
  echo "❌ Client generation failed"
  exit 1
fi

# Remove RoutiluxAPI.ts if present; it references missing BaseHttpRequest/AxiosHttpRequest.
# We use the generated services (FlowsService, JobsService, etc.) directly via lib/api/index.ts.
if [ -f "lib/api/generated/RoutiluxAPI.ts" ]; then
  rm -f lib/api/generated/RoutiluxAPI.ts
  echo "   Removed lib/api/generated/RoutiluxAPI.ts (uses missing deps; we use services directly)"
fi
echo ""

echo "[3/3] Done."
echo ""
echo "✅ TypeScript client regenerated at lib/api/generated"
echo ""
echo "Next steps:"
echo "  1. Update lib/api/index.ts if generated service/request shapes changed"
echo "  2. Update callers (e.g. AddRoutineDialog, AddConnectionDialog) to new request types"
echo "  3. Run: npm run build  (or npm run dev) to verify"
echo ""
