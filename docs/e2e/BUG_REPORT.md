# Routlux CLI Bug Report

**Date**: 2026-02-10
**Version**: routilux 0.11.0
**Reported By**: E2E Test Infrastructure Development
**Severity**: Medium

---

## Summary

This document outlines bugs and potential improvements discovered in the routilux CLI during the development of the E2E test infrastructure for routilux-overseer.

---

## Bug #1: Server Stop Command Not Implemented

**Severity**: Medium
**Component**: `routilux/cli/commands/server.py`
**Location**: Line 79-82

### Description
The `server stop` command is documented but not implemented. When users run `routilux server stop`, they receive a message stating the command is not yet implemented and are told to use Ctrl+C instead.

### Expected Behavior
The `server stop` command should gracefully stop a running routilux server process.

### Actual Behavior
```python
@server.command("stop")
def stop():
    """Stop the running routilux server (not yet implemented)."""
    click.echo("Stop command not yet implemented. Use Ctrl+C to stop the server.")
```

### Impact
Users must manually track and terminate server processes using Ctrl+C or system tools. This makes automated server management difficult, especially for:
- CI/CD pipelines
- Testing frameworks
- Process orchestration tools

### Reproduction Steps
1. Start a server: `routilux server start`
2. In another terminal, try: `routilux server stop`
3. Observe the "not yet implemented" message

### Suggested Fix
Implement proper server lifecycle management:

1. **PID File Approach**: Store the server PID in a file (e.g., `.routilux/server.pid`)

```python
@server.command("stop")
def stop():
    """Stop the running routilux server."""
    pid_file = Path(".routilux/server.pid")

    if not pid_file.exists():
        click.echo("No running server found")
        raise click.Abort(1)

    pid = int(pid_file.read_text())
    try:
        os.kill(pid, signal.SIGTERM)
        pid_file.unlink()
        click.echo("Server stopped")
    except ProcessLookupError:
        click.echo("Server process not found (cleaning up PID file)")
        pid_file.unlink()
```

2. **Alternative**: Use a socket file or systemd/service integration

---

## Bug #2: Server Status Command Not Implemented

**Severity**: Low
**Component**: `routilux/cli/commands/server.py`
**Location**: Line 85-88

### Description
The `server status` command returns a "not yet implemented" message.

### Expected Behavior
Should report:
- Whether the server is running
- Server URL and port
- Process ID
- Uptime
- Number of active connections/jobs

### Actual Behavior
```python
@server.command("status")
def status():
    """Check server status (not yet implemented)."""
    click.echo("Status command not yet implemented.")
```

### Impact
Users cannot easily verify if a server is running without manually checking ports or processes.

### Suggested Fix
Implement status checking using PID file or port binding detection:

```python
@server.command("status")
def status():
    """Check server status."""
    pid_file = Path(".routilux/server.pid")

    if not pid_file.exists():
        click.echo("Server: STOPPED")
        return

    pid = int(pid_file.read_text())
    try:
        process = psutil.Process(pid)
        click.echo(f"Server: RUNNING")
        click.echo(f"PID: {pid}")
        click.echo(f"Uptime: {datetime.now() - datetime.fromtimestamp(process.create_time())}")
    except psutil.NoSuchProcess:
        click.echo("Server: STOPPED (stale PID file)")
```

---

## Issue #3: No Direct HTTP API Health Check

**Severity**: Low
**Component**: `routilux/server/main.py`

### Description
While the server provides `/api/v1/health/live` and `/api/v1/health/ready` endpoints, there's no CLI command to quickly check server health without using curl or similar tools.

### Suggested Improvement
Add a `health` command:

```python
@server.command("health")
def health():
    """Check server health status."""
    import requests

    try:
        response = requests.get("http://localhost:20555/api/v1/health/live", timeout=2)
        if response.ok:
            click.echo("Server: HEALTHY")
        else:
            click.echo(f"Server: UNHEALTHY (status {response.status_code})")
    except requests.exceptions.RequestException:
        click.echo("Server: UNREACHABLE")
```

---

## Issue #4: Limited Default Routine Directories

**Severity**: Low
**Component**: `routilux/cli/discovery.py`
**Location**: Line 153-172

### Description
The `get_default_routines_dirs()` function only checks for:
1. `./routines/` (project local)
2. `~/.routilux/routines/` (user global)

For E2E testing and more flexible routine organization, it would be helpful to support additional discovery mechanisms.

### Suggested Improvement
Add environment variable support for custom routines directories:

```python
def get_default_routines_dirs() -> List[Path]:
    """Get default routines directories."""
    dirs = []

    # Environment variable override
    env_dirs = os.getenv("ROUTILUX_ROUTINES_DIRS", "")
    if env_dirs:
        dirs.extend(Path(d) for d in env_dirs.split(":") if d)

    # Project-local directory
    local_dir = Path.cwd() / "routines"
    if local_dir.exists():
        dirs.append(local_dir)

    # User-global directory
    home = Path.home()
    global_dir = home / ".routilux" / "routines"
    if global_dir.exists():
        dirs.append(global_dir)

    return dirs
```

---

## Issue #5: Server Discovery Order May Cause Confusion

**Severity**: Low
**Component**: `routilux/cli/server_wrapper.py`
**Location**: Line 32-34

### Description
When multiple routines directories are specified, the order of discovery combines:
1. User-provided directories
2. Default directories

If the same routine name exists in multiple directories, the first one found wins, which may not be intuitive.

### Suggested Improvement
Document the discovery order clearly or add a `--priority` flag to specify which directories take precedence.

---

## Issue #6: No Validation of Routine Names on Registration

**Severity**: Low
**Component**: `routilux/cli/decorators.py`

### Description
The `register_routine` and `auto_register_routine` decorators don't validate routine names for:
- Collisions (only checked at registration time, not import time)
- Invalid characters
- Reserved names

### Suggested Improvement
Add name validation in the decorator:

```python
def validate_routine_name(name: str) -> None:
    """Validate routine name."""
    if not name:
        raise ValueError("Routine name cannot be empty")

    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_-]*$', name):
        raise ValueError(
            f"Invalid routine name '{name}'. "
            "Must start with letter or underscore, contain only letters, numbers, hyphens, underscores."
        )

    # Reserved names
    reserved = {"flow", "connection", "slot", "event", "factory"}
    if name.lower() in reserved:
        raise ValueError(f"Routine name '{name}' is reserved")
```

---

## Issue #7: Server Port Configuration Inconsistency

**Severity**: Medium
**Component**: Multiple files

### Description
There's an inconsistency in default port configuration:
- CLI `server start` command defaults to `8080` (`routilux/cli/commands/server.py:24`)
- Server main module defaults to `20555` (`routilux/server/main.py:334`)

### Impact
When starting the server via CLI, the default port is 8080, but the overseer app may expect 20555.

### Suggested Fix
Standardize on a single default port (20555 seems more established in the codebase) and document it clearly.

---

## Issue #8: Missing Server Output Logging

**Severity**: Low
**Component**: `routilux/cli/server_wrapper.py`

### Description
The `start_server` function doesn't provide options to redirect server output to a log file. This makes debugging server issues in production difficult.

### Suggested Improvement
Add `--log-file` option:

```python
@server.command("start")
@click.option("--log-file", type=click.Path(), help="Write server logs to file")
def start(..., log_file):
    # ... existing code ...

    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        # Redirect uvicorn logging
```

---

## Issue #9: No Graceful Shutdown on SIGTERM

**Severity**: Medium
**Component**: `routilux/server/main.py`

### Description
The server doesn't properly handle SIGTERM signals for graceful shutdown. It relies on uvicorn's default behavior but doesn't implement custom cleanup in the lifespan shutdown.

### Suggested Improvement
Add signal handlers in the lifespan manager:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ... startup code ...

    # Setup signal handlers for graceful shutdown
    def handle_shutdown(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        # Cleanup code here

    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)

    yield

    # Shutdown code
    logger.info("🛑 Application shutting down...")
    # Save state, close connections, etc.
```

---

## Issue #10: E2E Test Infrastructure Requires Python Path Manipulation

**Severity**: Low
**Component**: Test infrastructure (not routilux itself)

### Description
The E2E test infrastructure requires adding the test routines directory to Python's path for the server to discover routines.

### Workaround
The current implementation handles this by passing `--routines-dir` to the server, but this could be better documented.

---

## Summary by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| High | 0 | - |
| Medium | 3 | #1 (server stop), #7 (port inconsistency), #9 (SIGTERM handling) |
| Low | 7 | #2, #3, #4, #5, #6, #8, #10 |

---

## Recommendations

1. **Priority 1**: Implement `server stop` command (Bug #1) - Essential for automation
2. **Priority 2**: Standardize default port (Bug #7) - Prevents confusion
3. **Priority 3**: Add graceful shutdown (Bug #9) - Better production behavior
4. **Priority 4**: Implement status and health commands (Bugs #2, #3) - Better UX
5. **Priority 5**: Consider other improvements for future releases

---

## Testing Notes

All bugs were discovered while implementing the E2E test infrastructure for routilux-overseer. The test suite includes:
- Server lifecycle management tests
- Connection and authentication tests
- Flow execution and monitoring tests
- Worker management tests

The E2E tests currently implement workarounds for some of these issues (especially Bug #1 - server stop not being implemented).
