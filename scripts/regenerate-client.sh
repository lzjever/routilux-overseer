#!/bin/bash
# Regenerate TypeScript API client from OpenAPI schema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVerseer_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$OVerseer_DIR" || exit 1

echo "=========================================="
echo "Regenerating TypeScript API Client"
echo "=========================================="
echo ""

# Check if openapi.json exists
if [ ! -f "openapi.json" ]; then
    echo "❌ Error: openapi.json not found"
    echo "   Run scripts/setup-server.sh first to fetch the schema"
    exit 1
fi

# Check if openapi-typescript-codegen is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed or not in PATH"
    exit 1
fi

echo "[1/2] Generating TypeScript client..."
echo "   Input: openapi.json"
echo "   Output: lib/api/generated"
echo ""

npx openapi-typescript-codegen --input openapi.json --output lib/api/generated

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate TypeScript client"
    exit 1
fi

# Remove RoutiluxAPI.ts; it depends on missing BaseHttpRequest/AxiosHttpRequest.
# We use generated *Service classes via lib/api/index.ts only.
if [ -f "lib/api/generated/RoutiluxAPI.ts" ]; then
  rm -f lib/api/generated/RoutiluxAPI.ts
  echo "   Removed lib/api/generated/RoutiluxAPI.ts"
fi

echo ""
echo "[2/2] Client generation complete!"
echo ""
echo "✅ TypeScript client regenerated at lib/api/generated"
echo ""
echo "Tip: To fetch from a running server, use: npm run regenerate-api"
echo ""
