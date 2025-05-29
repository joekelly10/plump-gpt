#!/bin/bash

# Colors
white='\033[0;37m'
grey='\033[0;90m'
blue='\033[0;34m'
cyan='\033[0;36m'
green='\033[0;32m'
red='\033[0;31m'
yellow='\033[0;33m'
white_bold='\033[1;37m'
blue_bold='\033[1;34m'
cyan_bold='\033[1;36m'
green_bold='\033[1;32m'
red_bold='\033[1;31m'
yellow_bold='\033[1;33m'
reset='\033[0m'

# Check for development mode argument
DEV_MODE=false

echo
if [ "$1" = "dev" ]; then
    DEV_MODE=true
    echo -e "${blue_bold}➜ ${white_bold}Starting Plump GPT in dev mode...${reset}"
else
    echo -e "${blue_bold}➜ ${white_bold}Starting Plump GPT...${reset}"
fi
echo


sleep 0.1


# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "  ${red_bold}✗ ${white}No .env file found${reset}"
    echo -e "  ${yellow_bold}• ${white}Creating one from .env.example...${reset}"

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "  ${green_bold}✔ ${white}Created .env file from .env.example${reset}"
    else
        echo -e "  ${red_bold}✗ ${white}No .env.example file found${reset}"
        echo
        echo -e "  ${yellow_bold}• ${white}Creating a blank .env file...${reset}"
        touch .env
        echo -e "  ${green_bold}✔ ${white}Created blank .env file${reset}"
    fi
    
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please add your API keys to the .env file and run this script again${reset}"
    echo -e "     ${white}OPENAI_API_KEY=your_key_here${reset}"
    echo -e "     ${white}ANTHROPIC_API_KEY=your_key_here${reset}"
    echo -e "     ${white}GEMINI_API_KEY=your_key_here${reset}"
    echo -e "     ${white}etc...${reset}"
    echo

    exit 1
fi

echo -e "  ${green_bold}✔ ${white}.env file found${reset}"


sleep 0.1


# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}Node.js is not installed or not in PATH${reset}"
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please install Node.js before continuing${reset}"
    echo -e "     ${white}Visit https://nodejs.org/ for installation instructions${reset}"
    echo

    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}npm is not installed or not in PATH${reset}"
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please install npm before continuing${reset}"
    echo

    exit 1
fi

# Check if Postgres is installed
if ! command -v psql &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}PostgreSQL is not installed or not in PATH${reset}"
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please install PostgreSQL before continuing${reset}"
    echo

    exit 1
fi

echo -e "  ${green_bold}✔ ${white}Node.js and PostgreSQL are installed${reset}"


sleep 0.1


# Check if dependencies are installed
if [ ! -d node_modules ] || [ ! -f node_modules/.install-stamp ] || [ package.json -nt node_modules/.install-stamp ]; then
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Installing dependencies...${reset}"

    npm install > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${yellow_bold}⚠️ ${white_bold}Installation failed${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"
        exit 1
    fi

    touch node_modules/.install-stamp
    
    echo -e "  ${green_bold}✔ ${white}Dependencies installed${reset}"
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Generating Prisma client...${reset}"

    npx prisma generate > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${yellow_bold}⚠️ ${white_bold}Failed to generate Prisma client${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"
        exit 1
    fi
    
    echo -e "  ${green_bold}✔ ${white}Prisma client generated${reset}"
fi


sleep 0.1


# Check if app has already been built
if [ "$DEV_MODE" = false ] && [ ! -d .svelte-kit/output ]; then
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Building app...${reset}"

    npm run build > go.log 2>&1

    if [ $? -ne 0 ]; then
        echo -e "  ${yellow_bold}⚠️ ${white_bold}Build failed${reset}"
        echo -e "     ${white}Please check ${cyan_bold}go.log${white} for details${reset}"
        exit 1
    fi

    echo -e "  ${green_bold}✔ ${white}App built${reset}"
fi


sleep 0.1


# Check PostgreSQL status
DB_URL=$(grep "DATABASE_URL" .env | cut -d= -f2)

if ! [[ $DB_URL =~ postgresql://([^:@]+)?(:[^@]+)?@([^:/]+)(:([0-9]+))?/([^?]+)(\?.*)?$ ]]; then
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Couldn't parse DATABASE_URL in .env file${reset}"
    echo -e "     ${white}Please check that your DATABASE_URL is correct${reset}"
    echo -e "     ${white}e.g. postgresql://user:password@localhost:5432/database_name${reset}"

    exit 1
else
    DB_USER="${BASH_REMATCH[1]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[5]:-5432}"
    DB_NAME="${BASH_REMATCH[6]}"

    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Checking database...${reset}"

    if ! nc -z $DB_HOST $DB_PORT 2>/dev/null; then
        echo -e "  ${red_bold}✗ ${white}PostgreSQL is not running on ${DB_HOST}:${DB_PORT}${reset}"
        echo
        echo -e "  ${yellow_bold}⚠️ ${white_bold}Please start PostgreSQL before continuing${reset}"
        echo

        exit 1
    else
        echo -e "  ${green_bold}✔ ${white}PostgreSQL is running${reset}"

        if [ ! -z "$DB_NAME" ]; then
            if ! psql "$DB_URL" -c '\q' 2>/dev/null; then
                echo
                echo -e "  ${yellow_bold}⚠️ ${white_bold}Couldn't connect to database '${DB_NAME}'${reset}"
                echo -e "     ${white}Please make sure the database exists${reset}"
                echo

                exit 1
            else
                echo -e "  ${green_bold}✔ ${white}Successfully connected to '${DB_NAME}'${reset}"
            fi
        fi
    fi
fi


sleep 0.1


# Check if the database has been seeded already; if not, this is the first run
if psql "$DB_URL" -t -c "
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
    echo -e "  ${cyan_bold}➜ ${white_bold}Running migrations...${reset}"
    npx prisma migrate dev > go.log 2>&1
    echo -e "  ${green_bold}✔ ${white}Migrations done${reset}"

    sleep 0.1

    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Seeding database...${reset}"
    npm run db:seed > go.log 2>&1
    echo -e "  ${green_bold}✔ ${white}Seeds planted${reset}"

    sleep 0.1

    echo
    echo -e "  ${green_bold}✔ ${white}Database ready${reset}"
fi


sleep 0.1


# Great success
echo -e "  ${green_bold}✔ ...🚀"


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
    npm run dev
else
    open_in_browser &
    npm run preview
fi
