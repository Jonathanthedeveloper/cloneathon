# T3 Chat Clone

A multi-AI model chat application built with **Convex** and **Next.js**. This app allows users to chat with multiple AI providers, use real-time web search, upload attachments, generate images (optional), and more—all in one modern web interface.

---

## Features

- Multi-provider AI chat (Gemini, Opena, etc.)
- Tool calling (web search, etc.)
- File and image attachments (images, PDFs)
- Syntax highlighting for code
- Resumable streaming (continue after refresh)
- Chat branching
- Bring Your Own Key (BYOK) for API keys
- Voice input (speech-to-text)
- Mobile responsive UI

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/Jonathanthedeveloper/cloneathon
cd cloneathon
```

### 2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

### 3. **Set Up Environment Variables**

Create a `.env.local` file in the root directory and add any required API keys:

```.env
CONVEX_DEPLOYMENT_URL=your-convex-url
CONVEX_DEPLOYMENT_KEY=your-convex-key
```

### 4. **Convex Setup**

- Install the Convex CLI if you haven't:

  ```bash
  npm install -g convex@latest
  ```

- Log in and link your project:

  ```bash
  npx convex dev
  # Follow prompts to link or create a Convex project
  ```

- Add The following env variables to your convex project

```.env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET
EXA_API_KEY=
OPENROUTER_API_KEY=
SITE_URL=
```

### 5. **Run the App Locally**

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Usage

- **Chat:** Start a new conversation and select your preferred AI model/tools.
- **Attachments:** Upload images or PDFs to send as part of your message.
- **Tool Calling:** Enable tools (web search, image, etc.) from the tool selector.
- **Voice Input:** Click the microphone button to use speech-to-text.
- **Branching:** Create alternative conversation paths from any message.
- **Sharing:** Use the share button to copy a link to your conversation.
- **Settings:** Manage API keys, preferences, and more in the settings panel.

---

## Troubleshooting

- **Convex errors:** Make sure your Convex project is linked and the schema is pushed.
- **API errors:** Check your environment variables and API key validity.
- **Rate limits:** If you see a rate limit error, wait a few minutes before retrying.
- **Voice input:** Requires a supported browser (Chrome, Edge, Safari).

---

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

---

## License

MIT
