# Routilux Debugger

A modern, real-time web debugger and monitor for [Routilux](https://github.com/lzjever/routilux) - the event-driven workflow orchestration framework.

## Features

- 🎨 **Beautiful UI** - Modern interface built with Next.js 14 and shadcn/ui
- 🔌 **Easy Connection** - Simply enter your Routilux API server URL to get started
- 📊 **Flow Visualization** - Interactive node graphs powered by ReactFlow
- 🔴 **Real-time Monitoring** - Watch your workflows execute live via WebSocket
- 🐛 **Interactive Debugging** - Set breakpoints, step through execution, inspect variables
- 📈 **Performance Metrics** - View execution times, error counts, and more

## Tech Stack

- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **shadcn/ui** - Beautiful UI components
- **ReactFlow** - Flow visualization
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **dagre** - Graph layout algorithm

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running Routilux API server (default: `http://localhost:20555`)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Connect to Routilux

1. Start your Routilux API server:
   ```bash
   cd /path/to/routilux
   uv run uvicorn routilux.api.main:app --host 0.0.0.0 --port 20555 --reload
   ```

2. Open the debugger and enter your server URL (default: `http://localhost:20555`)

3. Click "Connect" to start debugging!

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

```
routilux-debugger/
├── app/                      # Next.js App Router
│   ├── connect/              # Connection page
│   ├── flows/                # Flow visualization
│   ├── jobs/                 # Job monitoring & debugging
│   └── page.tsx              # Dashboard
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── flow/                 # Flow visualization
│   ├── debug/                # Debugging components
│   └── monitor/              # Monitoring components
├── lib/
│   ├── api/                  # REST API client
│   ├── websocket/            # WebSocket manager
│   ├── stores/               # Zustand state stores
│   └── types/                # TypeScript types
└── styles/                   # Custom styles
```

## Roadmap

- [x] Phase 1: Foundation
  - [x] Next.js project setup
  - [x] Connection page
  - [x] API client
- [ ] Phase 2: Flow Visualization
  - [ ] ReactFlow integration
  - [ ] Routine nodes
  - [ ] Connection edges
  - [ ] Auto-layout
- [ ] Phase 3: Real-time Monitoring
  - [ ] WebSocket manager
  - [ ] Job monitoring
  - [ ] Event logs
  - [ ] Metrics display
- [ ] Phase 4: Debugging
  - [ ] Breakpoint management
  - [ ] Variable inspection
  - [ ] Step execution
  - [ ] Call stack view
- [ ] Phase 5: Polish & Optimization
  - [ ] Performance optimization
  - [ ] Error handling
  - [ ] Responsive design
  - [ ] Accessibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Links

- [Routilux Documentation](https://routilux.readthedocs.io)
- [Routilux GitHub](https://github.com/lzjever/routilux)

---

Built with ❤️ using Next.js and shadcn/ui
