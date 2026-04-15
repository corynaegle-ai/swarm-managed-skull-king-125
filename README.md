# Skull King Swarm Game

A swarm-managed implementation of the Skull King card game.

## Project Setup

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/corynaegle-ai/swarm-managed-skull-king-125
cd swarm-managed-skull-king-125
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

### Development

Start the development server:
```bash
npm run dev
```

### Building

Build for production:
```bash
npm run build
```

Run the production build:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
.
├── src/              # Source code
├── dist/             # Compiled output
├── package.json      # Project dependencies
├── tsconfig.json     # TypeScript configuration
└── .env.example      # Environment variables template
```

## Development Environment

The development environment is fully configured and runnable with:
1. TypeScript compilation
2. Node.js runtime with ts-node
3. Testing framework (Jest)
4. Linting (ESLint)
5. Environment variable management (dotenv)
