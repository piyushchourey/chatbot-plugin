# NPM Package Setup Guide

## Package Structure

```
chatbot-plugin/
├── src/                    # Source files
│   ├── index.ts           # Main entry point
│   ├── ChatBot.tsx        # Main component
│   ├── ChatBotProvider.tsx # Provider component
│   ├── ChatBot.css        # Styles
│   ├── types.ts           # TypeScript types
│   ├── config.ts          # Configuration
│   └── api-utils.ts       # API utilities
├── dist/                   # Built files (generated)
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
├── rollup.config.js       # Build configuration
└── README.md              # Package documentation
```

## Setup Steps

### 1. Install Dependencies

```bash
cd chatbot-plugin
npm install
```

### 2. Build the Package

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle with Rollup
- Generate type definitions
- Process CSS

### 3. Test Locally

#### Option A: Using npm link

```bash
# In chatbot-plugin directory
npm link

# In your main project
npm link lendinglogik-chatbot-plugin
```

#### Option B: Using file path

In your main project's `package.json`:

```json
{
  "dependencies": {
    "lendinglogik-chatbot-plugin": "file:../chatbot-plugin"
  }
}
```

Then run:
```bash
npm install
```

### 4. Publish to NPM

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Login to NPM** (if not already):
   ```bash
   npm login
   ```

4. **Publish**:
   ```bash
   npm publish --access public
   ```

   For scoped packages, you may need:
   ```bash
   npm publish --access public --registry https://registry.npmjs.org/
   ```

## Using in Your Project

After publishing or linking:

```bash
npm install lendinglogik-chatbot-plugin
```

Then import:

```tsx
import { ChatBotProvider, ChatBot } from 'lendinglogik-chatbot-plugin';
```

## Development Workflow

1. Make changes in `src/`
2. Run `npm run build` to rebuild
3. Test in your main project
4. Update version and publish

## Package.json Fields Explained

- `main`: CommonJS entry point (for Node.js)
- `module`: ES module entry point (for bundlers)
- `types`: TypeScript type definitions
- `files`: Files included in npm package
- `peerDependencies`: Dependencies that consuming projects must provide
- `dependencies`: Dependencies bundled with the package

## Troubleshooting

### Build Errors

- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct
- Ensure CSS is imported correctly

### Import Errors in Main Project

- Ensure React is installed (peer dependency)
- Check that types are being resolved
- Verify build output in `dist/` directory

### Publishing Issues

- Check package name is available
- Verify you're logged into npm
- Ensure version is incremented
- Check `.npmignore` excludes source files

## Next Steps

1. Add tests
2. Set up CI/CD for automated publishing
3. Add changelog
4. Create GitHub releases
5. Add badges to README

