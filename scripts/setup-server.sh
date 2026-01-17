#!/bin/bash
# Setup script to start Routilux API server and fetch OpenAPI schema
# This script starts overseer_demo_app.py in the background and fetches openapi.json

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVerseer_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROUTILUX_DIR="$(cd "$OVerseer_DIR/.." && pwd)/routilux"

echo "=========================================="
echo "Routilux Overseer - Server Setup"
echo "=========================================="
echo ""

# Check if server is already running
if curl -s http://localhost:20555/api/health > /dev/null 2>&1; then
    echo "⚠️  Server already running on port 20555"
    echo "   Fetching OpenAPI schema from existing server..."
    curl -s http://localhost:20555/openapi.json > "$OVerseer_DIR/openapi.json"
    echo "✅ OpenAPI schema fetched"
    exit 0
fi

# Check if uv is available
if ! command -v uv &> /dev/null; then
    echo "❌ Error: uv is not installed or not in PATH"
    echo "   Please install uv: https://github.com/astral-sh/uv"
    exit 1
fi

# Change to routilux directory
if [ ! -d "$ROUTILUX_DIR" ]; then
    echo "❌ Error: Routilux directory not found: $ROUTILUX_DIR"
    exit 1
fi

cd "$ROUTILUX_DIR" || exit 1

echo "[1/3] Starting Routilux API server..."
echo "   Server will run on: http://localhost:20555"
echo "   Using: examples/overseer_demo_app.py"
echo ""

# Start server in background
uv run python examples/overseer_demo_app.py > /tmp/routilux_server.log 2>&1 &
SERVER_PID=$!

# Save PID for cleanup
echo "$SERVER_PID" > /tmp/routilux_server.pid
echo "   Server PID: $SERVER_PID"
echo "   Log file: /tmp/routilux_server.log"
echo ""

# Wait for server to be ready
echo "[2/3] Waiting for server to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:20555/api/health > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ Error: Server did not start within $MAX_ATTEMPTS seconds"
    echo "   Check logs: /tmp/routilux_server.log"
    echo "   Server PID: $SERVER_PID"
    exit 1
fi

# Fetch OpenAPI schema
echo ""
echo "[3/3] Fetching OpenAPI schema..."
curl -s http://localhost:20555/openapi.json > "$OVerseer_DIR/openapi.json"

if [ ! -f "$OVerseer_DIR/openapi.json" ] || [ ! -s "$OVerseer_DIR/openapi.json" ]; then
    echo "❌ Error: Failed to fetch OpenAPI schema"
    exit 1
fi

echo "✅ OpenAPI schema saved to: $OVerseer_DIR/openapi.json"
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Server is running in the background"
echo "  PID: $SERVER_PID"
echo "  URL: http://localhost:20555"
echo ""
echo "To stop the server:"
echo "  kill $SERVER_PID"
echo "  or: pkill -f overseer_demo_app.py"
echo ""
echo "To view server logs:"
echo "  tail -f /tmp/routilux_server.log"
echo ""
