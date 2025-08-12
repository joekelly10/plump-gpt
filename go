#!/bin/bash

# Colors
white='\033[0;37m'
grey='\033[0;90m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[0;34m'
cyan='\033[0;36m'
white_bold='\033[1;37m'
grey_bold='\033[1;90m'
red_bold='\033[1;31m'
yellow_bold='\033[1;33m'
green_bold='\033[1;32m'
blue_bold='\033[1;34m'
cyan_bold='\033[1;36m'
reset='\033[0m'

up_one_line='\033[1A'
carriage_return='\r'
clear_line='\033[K'


# check for arguments
DEV_MODE=false
REBUILD=false

echo
if [ "$1" = "dev" ]; then
    DEV_MODE=true
    echo -e "${blue_bold}➜ ${white_bold}Starting Plump GPT in dev mode... ${grey}(live reloading)${reset}"
elif [ "$1" = "rebuild" ]; then
    REBUILD=true
    echo -e "${blue_bold}➜ ${white_bold}Starting Plump GPT... ${grey}(with rebuild)${reset}"
else
    echo -e "${blue_bold}➜ ${white_bold}Starting Plump GPT...${reset}"
fi


sleep 0.1


# check if .env file exists
if [ ! -f .env ]; then
    echo
    echo
    echo -e "  ${grey_bold}✗ ${grey}No .env file found${reset}"

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "  ${green_bold}✔ ${white}Created a new .env file from .env.example...${reset}"
    else
        touch .env
        echo -e "  ${green_bold}✔ ${white}Created blank .env file${reset}"
    fi
    
    echo
    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Please add your ${cyan_bold}Database URL${white_bold} and ${cyan_bold}API keys${white_bold} to the .env file, then run this script again${reset}"
    echo
    echo -e "    ${grey}DATABASE_URL=${cyan}postgresql://your_username:your_password@localhost:5432/plump_gpt${reset}"
    echo -e "    ${grey}OPENAI_API_KEY=${cyan}your_key_here${reset}"
    echo -e "    ${grey}ANTHROPIC_API_KEY=${cyan}your_key_here${reset}"
    echo -e "    ${grey}GEMINI_API_KEY=${cyan}your_key_here${reset}"
    echo -e "    ${grey}etc...${reset}"
    echo

    exit 1
fi


# check .env file contents
source .env

if [[ "$DATABASE_URL" == "postgresql://your_username:your_password@localhost:5432/plump_gpt" ]]; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}DATABASE_URL is still set to the default placeholder${reset}"
    echo -e "     ${white}Please update ${cyan}DATABASE_URL${white} in your ${cyan}.env${white} file with your actual database details${reset}"
    echo

    exit 1
fi

API_KEYS_SET=false

api_keys=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY" 
    "GEMINI_API_KEY"
    "GROK_API_KEY"
    "COHERE_API_KEY"
    "MISTRAL_API_KEY"
    "DEEPSEEK_API_KEY"
    "AI21_API_KEY"
    "OPENROUTER_API_KEY"
    "GROQ_API_KEY"
)

for key in "${api_keys[@]}"; do
    value="${!key}"

    if [[ -n "$value" && "$value" != "your_api_key_here" && "$value" != "..." ]]; then
        API_KEYS_SET=true
        break
    fi
done

if [ "$API_KEYS_SET" = false ]; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}API keys are still set to placeholder values${reset}"
    echo -e "     ${white}Please set at least one API key in your ${cyan}.env${white} file${reset}"
    echo

    exit 1
fi


sleep 0.1


# check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}Node.js is not installed or not in PATH${reset}"
    echo
    echo -e "     ${white}Please install Node.js before continuing${reset}"
    echo -e "     ${grey}Visit https://nodejs.org/ for installation instructions${reset}"
    echo

    exit 1
fi

# check if npm is installed
if ! command -v npm &> /dev/null; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}npm is not installed or not in PATH${reset}"
    echo
    echo -e "     ${white}Please install npm before continuing${reset}"
    echo -e "     ${grey}Visit https://nodejs.org/ for installation instructions${reset}"
    echo

    exit 1
fi

# check if Postgres is installed
if ! command -v psql &> /dev/null; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}PostgreSQL is not installed or not in PATH${reset}"
    echo
    echo -e "     ${white}Please install PostgreSQL before continuing${reset}"
    echo -e "     ${grey}Visit https://www.postgresql.org/download/ for installation instructions${reset}"
    echo

    exit 1
fi


# check if dependencies are installed
if [ "$REBUILD" = true ] || [ ! -d node_modules ] || [ ! -f node_modules/.install-stamp ] || [ package.json -nt node_modules/.install-stamp ]; then
    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Installing dependencies...${reset}"

    npm install > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${red_bold}❌ ${white_bold}Installation failed${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"

        exit 1
    fi

    touch node_modules/.install-stamp
    
    echo -e "  ${green_bold}✔ ${white}Dependencies installed${reset}"
    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Generating Prisma client...${reset}"

    npx prisma generate > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${red_bold}❌ ${white_bold}Failed to generate Prisma client${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"

        exit 1
    fi
    
    echo -e "  ${green_bold}✔ ${white}Prisma client generated${reset}"
fi


sleep 0.1


# check if app has already been built
if [ "$REBUILD" = true ] || ([ "$DEV_MODE" = false ] && [ ! -d .svelte-kit/output ]); then
    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Building app...${reset}"

    npm run build > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${red_bold}❌ ${white_bold}Build failed${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"
        exit 1
    fi

    echo -e "  ${green_bold}✔ ${white}App built${reset}"
fi


sleep 0.1


# Check database connection
if [ -z "$DATABASE_URL" ]; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}DATABASE_URL is not set in .env file${reset}"
    echo -e "     ${white}Please check that you’ve added it${reset}"
    echo -e "     ${white}e.g. postgresql://user:password@localhost:5432/database_name${reset}"
    echo

    exit 1
fi

echo
echo -e "  ${blue_bold}➜ ${white_bold}Checking database connection...${reset}"

if ! psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
    echo
    echo -e "  ${red_bold}❌ ${white_bold}Couldn't connect to database${reset}"
    echo
    echo -e "     ${white}Please make sure PostgreSQL is running and DATABASE_URL is correct${reset}"
    echo -e "     ${grey}Attempted connection to: ${cyan}${DATABASE_URL}${reset}"
    echo

    exit 1
else
    echo -e "  ${green_bold}✔ ${white}Successfully connected to database${reset}"
fi


sleep 0.1


# check if the database has been seeded already; if not, this is the first run
if psql "$DATABASE_URL" -t -c "
    SELECT EXISTS (
        SELECT FROM pg_tables WHERE tablename = 'SystemPrompt' 
        AND EXISTS (
            SELECT FROM \"SystemPrompt\" WHERE \"default\" = true
        )
    );" 2>/dev/null | grep -q "t"; then
    echo
else
    echo
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}First time setup...${reset}"
    echo
    echo -e "    ${cyan_bold}Please enter your name:${reset}"
    echo -e "    ${white}(We'll add it to the default system prompt)${reset}"
    echo -e "    ${cyan_bold}➜ ${white_bold}\c"
    read YOUR_NAME

    echo

    if [ -z "$YOUR_NAME" ]; then
        echo -e "  ${green_bold}✔ ${white}Ok, we'll use a nameless prompt${reset}"
    else
        export YOUR_NAME=$YOUR_NAME
    fi

    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Running migrations...${reset}"
    npx prisma migrate dev > go.log 2>&1
    echo -e "  ${green_bold}✔ ${white}Migrations done${reset}"

    sleep 0.1

    echo
    echo -e "  ${blue_bold}➜ ${white_bold}Seeding database...${reset}"
    npm run db:seed > go.log 2>&1
    echo -e "  ${green_bold}✔ ${white}Seeds planted${reset}"

    sleep 0.1

    echo
    echo -e "  ${green_bold}✔ ${white}Database ready${reset}"
fi


sleep 0.1


# Great success
echo -e "  ${green_bold}✔ ...🚀${reset}"


sleep 0.25


# Read version from package.json
APP_VERSION=$(grep "\"version\":" package.json | head -1 | sed 's/.*: "\(.*\)",/\1/' | tr -d '[:space:]')

echo
sleep 0.005
echo
sleep 0.005
echo
sleep 0.005
echo -e "${white_bold}8888888b.  888     888     888 888b     d888 8888888b.        .d8888b.  8888888b. 88888888888                 ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888   Y88b 888     888     888 8888b   d8888 888   Y88b      d88P  Y88b 888   Y88b    888                    ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888    888 888     888     888 88888b.d88888 888    888      888    888 888    888    888                   ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888   d88P 888     888     888 888Y88888P888 888   d88P      888        888   d88P    888                  ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}8888888P\"  888     888     888 888 Y888P 888 8888888P\"       888  88888 8888888P\"     888                 ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888        888     888     888 888  Y8P  888 888             888    888 888           888                ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888        888     Y88b. .d88P 888   \"   888 888             Y88b  d88P 888           888               ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo -e "${white_bold}888        88888888 \"Y88888P\"  888       888 888              \"Y8888P88 888           888              ${blue_bold}d88P   d88P${reset}"
sleep 0.005
echo
sleep 0.005
echo
sleep 0.005
echo
sleep 0.005
echo -e "  ${blue_bold}PLUMP GPT${blue} v${APP_VERSION}${reset}"
sleep 0.005
echo -e "  ${blue_bold}➜ ${white_bold}App: ${blue}http://localhost:${blue_bold}1337${blue}/${reset}"
sleep 0.005
echo
sleep 0.005
echo -e "  ${grey}Logs for this script: ${cyan}go.log${reset}"
sleep 0.005
echo
sleep 0.005
echo


sleep 0.25


open_in_browser() {
    # give the app a second to start up
    sleep 1

    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:1337"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        start "http://localhost:1337"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:1337" &>/dev/null &
        elif command -v sensible-browser &> /dev/null; then
            sensible-browser "http://localhost:1337" &>/dev/null &
        fi
    fi
}


if [ "$DEV_MODE" = true ]; then
    open_in_browser &
    if ! lsof -i :1337 > /dev/null 2>&1; then
        npm run dev
    fi
else
    open_in_browser &
    npm run preview
fi
