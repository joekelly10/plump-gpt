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
- <img alt='Grok' src='./static/img/icons/models/grok.png' width='21' height='21' valign='middle'>&nbsp; Grok 3

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



# Why?

- 🤖 **All models**
    - Switch freely between models + providers
    - Send the same prompt to multiple models
    - Switch models mid-chat, e.g. start with `gpt-4o-mini` then switch to `Claude 3.5 Sonnet`
- 📐 **Forks**
    - Branched conversations
    - No-one had done this, and I needed it, so I did it
    - Should be a fundamental feature of any LLM interface, imo
- 🌴 **Tree view**
    - Get a birds-eye view of the chat (all forks)
    - Easily navigate to specific messages
- ⭐️ **Stars**
    - Mark (whole) messages as starred
    - Searchable later
    - Shows on tree
- 🟨 **Highlights**
    - Add highlights on specific text within messages
    - Searchable later
    - Shows on tree
- 💬 **Quote**
    - Quick-add the currently highlighted text to your next input
    - Super-useful pattern, used a lot, for directing attention to a specific part of the AI's reply
- 📝 **System prompt**
    - Control the `system_prompt`
    - Keep a library of prompts in the db and switch easily
- 🔧 **Model settings**
    - Set `temperature`, `top_p`, etc.
- 🚀 **Quick launch**
    - Start a new chat 'from anywhere' via a keyboard launcher (e.g. [Alfred](https://www.alfredapp.com/) on MacOS)
    - Model + prompt are passed via URL query parameters, `http://localhost:1337/?model=gpt-4o&prompt=wake+up+gpt`
    - No-one had done this either, and I needed it
- 🔍 **Chat history**
    - Browse + search your past conversations
- 💰 **Usage**
    - See input + output token counts
    - See cache read + write (where the API provides prompt caching)
    - See total cost
    - _^ All of the above a) per message, b) for whole conversation_
- 💵 **API pricing**
    - Pay as you go = much cheaper than all the various subscriptions



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


# Please Note

Plump GPT is a personal project and I originally had no intention of sharing it, so this isn't meant to be polished, production ready code. I use it a lot, as a daily thinking tool, and I could probably be persuaded to develop it properly, but it works for my needs as is and I'm currently focusing on other things!

Svelte 5 and responsive design would be a start... 😂
