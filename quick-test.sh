#!/bin/bash
# Quick Test Script - Run Overseer Demo and Test

echo "========================================"
echo "  Overseer Quick Test"
echo "========================================"
echo ""
echo "This will help you quickly test Overseer"
echo ""

# Check if Routilux demo is running
echo "[1/3] Checking Routilux server..."
if curl -s http://localhost:20555/api/health > /dev/null 2>&1; then
    echo "✓ Routilux server is running on http://localhost:20555"
else
    echo "✗ Routilux server is NOT running"
    echo ""
    echo "Please start it first:"
    echo "  cd /home/percy/works/mygithub/routilux/examples"
    echo "  ./start_overseer_demo.sh"
    echo ""
    exit 1
fi

# Check if Overseer is running
echo "[2/3] Checking Overseer..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Overseer is running on http://localhost:3000"
else
    echo "✗ Overseer is NOT running"
    echo ""
    echo "Please start it:"
    echo "  cd /home/percy/works/mygithub/routilux-debugger"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "[3/3] Opening browser..."
echo ""
echo "========================================"
echo "Ready to test!"
echo "========================================"
echo ""
echo "1. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "2. Connect to server:"
echo "   URL: http://localhost:20555"
echo ""
echo "3. Test these flows:"
echo "   ✓ linear_flow - Basic flow"
echo "   ✓ branching_flow - Parallel execution"
echo "   ✓ conditional_flow - Debugging (set breakpoints!)"
echo "   ✓ performance_flow - Speed comparison"
echo "   ✓ error_flow - Error handling"
echo "   ✓ complex_flow - All features"
echo ""
echo "See DEMO_GUIDE.md for detailed instructions"
echo ""
echo "========================================"
