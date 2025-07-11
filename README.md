# What?

**Plump GPT** fattens your thoughts.

(It's a Chat UI for interacting with language model APIs).

- Frontend: [Svelte](https://svelte.dev/)
- Backend: [SvelteKit](https://kit.svelte.dev/)
- Database: [Postgres](https://postgresql.org/) / [Prisma ORM](https://github.com/prisma/prisma)

It runs in your browser on `localhost:1337`.



# Models

**Open AI**
- <img alt='GPT-4.1 nano' src='./static/img/icons/models/gpt-4.1-nano.png' width='21' height='21' valign='middle'>&nbsp; GPT-4.1 nano
- <img alt='GPT-4.1 mini' src='./static/img/icons/models/gpt-4.1-mini.png' width='21' height='21' valign='middle'>&nbsp; GPT-4.1 mini
- <img alt='GPT-4.1' src='./static/img/icons/models/gpt-4.1.png' width='21' height='21' valign='middle'>&nbsp; GPT-4.1
- <img alt='o4-mini' src='./static/img/icons/models/o4-mini.png' width='21' height='21' valign='middle'>&nbsp; o4-mini

**Anthropic**
- <img alt='Claude Haiku' src='./static/img/icons/models/claude-haiku.png' width='21' height='21' valign='middle'>&nbsp; Claude Haiku 3.5
- <img alt='Claude Sonnet' src='./static/img/icons/models/claude-sonnet.png' width='21' height='21' valign='middle'>&nbsp; Claude Sonnet 4
- <img alt='Claude Opus' src='./static/img/icons/models/claude-opus.png' width='21' height='21' valign='middle'>&nbsp; Claude Opus 4

**Google**
- <img alt='Gemini Flash Lite' src='./static/img/icons/models/gemini-flash-lite.png' width='21' height='21' valign='middle'>&nbsp; Gemini 2.0 Flash Lite
- <img alt='Gemini Flash' src='./static/img/icons/models/gemini-flash.png' width='21' height='21' valign='middle'>&nbsp; Gemini 2.5 Flash
- <img alt='Gemini Pro' src='./static/img/icons/models/gemini-pro.png' width='21' height='21' valign='middle'>&nbsp; Gemini 2.5 Pro

**X**
- <img alt='Grok Mini' src='./static/img/icons/models/grok-mini.png' width='21' height='21' valign='middle'>&nbsp; Grok 3 Mini
- <img alt='Grok 4' src='./static/img/icons/models/grok.png' width='21' height='21' valign='middle'>&nbsp; Grok 4

**DeepSeek**
- <img alt='DeepSeek V3' src='./static/img/icons/models/deepseek-chat.png' width='21' height='21' valign='middle'>&nbsp; DeepSeek V3
- <img alt='DeepSeek R1' src='./static/img/icons/models/deepseek-reasoner.png' width='21' height='21' valign='middle'>&nbsp; DeepSeek R1

**Qwen**
- <img alt='Qwen 2.5 Turbo' src='./static/img/icons/models/qwen-turbo.png' width='21' height='21' valign='middle'>&nbsp; Qwen 2.5 Turbo
- <img alt='Qwen 2.5 Plus' src='./static/img/icons/models/qwen-plus.png' width='21' height='21' valign='middle'>&nbsp; Qwen 2.5 Plus
- <img alt='Qwen 2.5 Max' src='./static/img/icons/models/qwen-max.png' width='21' height='21' valign='middle'>&nbsp; Qwen 2.5 Max

**Meta**
- <img alt='Llama 4 Scout' src='./static/img/icons/models/llama-light.png' width='21' height='21' valign='middle'>&nbsp; Llama 4 Scout
- <img alt='Llama 4 Maverick' src='./static/img/icons/models/llama-medium.png' width='21' height='21' valign='middle'>&nbsp; Llama 4 Maverick
- <img alt='Llama 3.1 405b' src='./static/img/icons/models/llama-heavy.png' width='21' height='21' valign='middle'>&nbsp; Llama 3.1 405b

**Mistral**
- <img alt='Mistral Small' src='./static/img/icons/models/mistral-small.png' width='21' height='21' valign='middle'>&nbsp; Mistral Small
- <img alt='Mistral Medium' src='./static/img/icons/models/mistral-medium.png' width='21' height='21' valign='middle'>&nbsp; Mistral Medium
- <img alt='Mistral Large' src='./static/img/icons/models/mistral-large.png' width='21' height='21' valign='middle'>&nbsp; Mistral Large

**Cohere**
- <img alt='Command-R' src='./static/img/icons/models/command-r.png' width='21' height='21' valign='middle'>&nbsp; Command-R
- <img alt='Command-R+' src='./static/img/icons/models/command-r-plus.png' width='21' height='21' valign='middle'>&nbsp; Command-R+

**AI21 Labs**
- <img alt='Jamba Mini' src='./static/img/icons/models/jamba-mini.png' width='21' height='21' valign='middle'>&nbsp; Jamba 1.6 Mini
- <img alt='Jamba Large' src='./static/img/icons/models/jamba-large.png' width='21' height='21' valign='middle'>&nbsp; Jamba 1.6 Large

**Groq** (Fast inference)
- <img alt='QwQ 32b' src='./static/img/icons/models/groq-qwen.png' width='21' height='21' valign='middle'>&nbsp; QwQ 32b
- <img alt='Llama 4 Maverick' src='./static/img/icons/models/groq-llama.png' width='21' height='21' valign='middle'>&nbsp; Llama 4 Maverick
- <img alt='R1 Distill 70b' src='./static/img/icons/models/groq-deepseek.png' width='21' height='21' valign='middle'>&nbsp; R1 Distill 70b

**MiniMax**
- <img alt='MiniMax 01' src='./static/img/icons/models/minimax-01.png' width='21' height='21' valign='middle'>&nbsp; MiniMax 01
- <img alt='MiniMax M1' src='./static/img/icons/models/minimax-m1.png' width='21' height='21' valign='middle'>&nbsp; MiniMax M1

**Inception Labs** (Diffusion)
- <img alt='Mercury' src='./static/img/icons/models/mercury.png' width='21' height='21' valign='middle'>&nbsp; Mercury


# Features

- 🤖 **All models**
    - Switch freely between models + providers
    - E.g. Send the same prompt to multiple models, or switch mid-chat
- 📐 **Forks**
    - Create multiple branches of the conversation
    - (No-one had done this, and I needed it, so I did it — should be a fundamental feature of any LLM interface, imo)
- 🌴 **Tree view**
    - Get a birds-eye view of the chat (all forks)
    - Jump to specific messages
- ⭐️ **Stars**
    - Mark messages worth remembering as starred
    - (Searchable later + shows on tree)
- 🟨 **Highlights**
    - Add highlights on specific text within messages
    - (Searchable later + shows on tree)
- 💬 **Quote**
    - Quick-add the currently highlighted text to your next input
    - Super-useful pattern for directing attention to a specific part of the AI's reply
- 📝 **System prompt**
    - Set the `system_prompt`
    - Keep a library of prompts in the db and switch easily
- 🔧 **Model settings**
    - Set `temperature`, `top_p`, etc.
- 🚀 **Quick launch**
    - Start a new chat 'from anywhere' via a keyboard launcher (e.g. [Alfred](https://www.alfredapp.com/) on MacOS)
    - Model + prompt are passed via URL query parameters, `http://localhost:1337/?model=gpt-3.5&prompt=wake+up+gpt`
    - (No-one had done this either, and I needed it)
- 🔍 **Chat history**
    - Search your past conversations
- 📊 **Usage**
    - See input + output token counts, cache read + write (where the API provides prompt caching), and total cost
    - Per message
    - For the whole chat
- 💵 **API pricing**
    - Pay as you go = much cheaper than all the various subscriptions
- 🎨 **UI/UX**
    - No-nonsense design for power users



# Install

1. With [PostgreSQL](https://www.postgresql.org/download/) installed and a server running, create a new database (e.g. called `plump_gpt`):
```
psql -c "CREATE DATABASE plump_gpt"
```

2. Create a `.env` file in the root directory (or rename the `.env.example` file to `.env`), and add your database URL and API keys:
```
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/plump_gpt

OPENAI_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
GROK_API_KEY=...
MISTRAL_API_KEY=...
DEEPSEEK_API_KEY=...
```

3. Run the start script:
```
./go
```

💡 You can run Plump GPT in dev mode, with live reloading, using `./go dev`



# Manual Steps

3. Install dependencies:
```
npm install
```

4. Initialise the database:
```
npx prisma migrate deploy
```

5. Seed the database:
```
npm run db:seed
```

6. Compile the SvelteKit app:
```
npm run build
```

7. Start the app:
```
npm run preview
```



# Docker

You can also run Plump GPT using Docker:

1. Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

2. Create a `.env` file in the root directory (or rename the `.env.example` file to `.env`), and add your API keys:
```
OPENAI_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
GROK_API_KEY=...
MISTRAL_API_KEY=...
DEEPSEEK_API_KEY=...
```

3. Run the start script:
```
./go-docker
```

💡 To rebuild containers:
```
./go-docker rebuild
```

💡 To completely remove the containers and data volume:
```
docker compose down -v
```



# Tests
Run end-to-end tests:
```
./test
```

Using a previous (cached) build:
```
./test --cached
```

Filtered by string pattern:
```
./test --grep "forks"
```



# y tho?

Two high-level goals:

1. **Understanding**: Learn the limitations of LLM technology through play ("Feel the AGI")
2. **Utility**: Use Plump GPT as an everyday thinking tool ("Fatten your thoughts")



# Notes

Plump GPT is a personal project that I originally had no intention of sharing. I use it a lot as a daily thinking tool, and I could probably be persuaded to develop it properly, but it works for my needs as is!

Some responsive design would be a start... 😂
