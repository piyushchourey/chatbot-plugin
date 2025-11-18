# Using the Chatbot Plugin as NPM Package

## Installation

```bash
npm install lendinglogik-chatbot-plugin
```

Or if using locally before publishing:

```bash
npm install ./chatbot-plugin
```

## Basic Usage

```tsx
import { ChatBotProvider, ChatBot } from 'lendinglogik-chatbot-plugin';
import { useState } from 'react';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const config = {
    apiEndpoint: 'http://localhost:7000/api/chat',
    socketServer: 'http://localhost:7000',
    enabled: true,
    title: 'Loan Assistant',
    subtitle: 'Powered by LendingLogik',
  };

  return (
    <ChatBotProvider config={config}>
      {/* Your app components */}
      <YourMainComponent />
      
      {/* Add chatbot */}
      <ChatBot
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        flowType="loan-application"
      />
    </ChatBotProvider>
  );
}
```

## Advanced Configuration

```tsx
import { ChatBotProvider, ChatBot, useChatBot } from 'lendinglogik-chatbot-plugin';

function App() {
  const config = {
    apiEndpoint: 'http://localhost:7000/api/chat',
    socketServer: 'http://localhost:7000',
    enabled: true,
    
    // Custom callbacks
    onFormUpdate: (data) => {
      console.log('Form updated:', data);
      // Update your form state
    },
    onMessageSent: (message) => {
      // Track analytics
    },
    onMessageReceived: (response) => {
      // Track analytics
    },
    
    // Field mapping
    fieldMapping: {
      LoanDuration: 'loanRepayments',
      Amount: 'loanAmount',
    },
    
    // Custom styling
    customStyles: {
      primaryColor: '#8b5cf6',
      headerGradient: 'bg-gradient-to-r from-purple-600 to-pink-500',
    },
  };

  return (
    <ChatBotProvider config={config}>
      <YourApp />
      <ChatBotContainer />
    </ChatBotProvider>
  );
}

function ChatBotContainer() {
  const { isChatOpen, setIsChatOpen } = useChatBot();
  return (
    <ChatBot
      isOpen={isChatOpen}
      setIsOpen={setIsChatOpen}
      flowType="loan-application"
    />
  );
}
```

## Building the Package

```bash
cd chatbot-plugin
npm install
npm run build
```

## Publishing to NPM

1. Update version in `package.json`
2. Build the package: `npm run build`
3. Publish: `npm publish --access public`

## Local Development

To use the package locally in your main project:

```bash
# In chatbot-plugin directory
npm link

# In your main project directory
npm link lendinglogik-chatbot-plugin
```

Or use relative path in package.json:

```json
{
  "dependencies": {
    "lendinglogik-chatbot-plugin": "file:../chatbot-plugin"
  }
}
```

