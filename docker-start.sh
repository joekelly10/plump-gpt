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

# Check for rebuild argument
REBUILD=false

echo
if [ "$1" = "rebuild" ]; then
    REBUILD=true
    echo -e "${blue_bold}➜ ${white_bold}Rebuilding Plump GPT...${reset}"
else
    echo -e "${blue_bold}➜ ${white_bold}Launching Plump GPT...${reset}"
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


# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}Docker is not installed or not in PATH${reset}"
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please install Docker and Docker Compose before continuing${reset}"
    echo -e "     ${white}Visit https://docs.docker.com/get-docker/ for installation instructions${reset}"
    echo

    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}Docker Compose is not installed or not in PATH${reset}"
    echo
    echo -e "  ${yellow_bold}⚠️ ${white_bold}Please install Docker Compose before continuing${reset}"
    echo -e "     ${white}Visit https://docs.docker.com/compose/install/ for installation instructions${reset}"
    echo

    exit 1
fi

echo -e "  ${green_bold}✔ ${white}Docker and Docker Compose are installed${reset}"


sleep 0.1


# Flag to track if this script starts Docker
WE_JUST_STARTED_DOCKER=false

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "  ${red_bold}✗ ${white}Docker daemon is not running${reset}"
    echo

    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "  ${cyan_bold}➜ ${white_bold}Attempting to start Docker Desktop (macOS)...${reset}"
        open -a Docker -g
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "  ${cyan_bold}➜ ${white_bold}Attempting to start Docker (Linux)...${reset}"
        if command -v systemctl &> /dev/null; then
            sudo systemctl start docker
        else
            sudo service docker start
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo -e "  ${cyan_bold}➜ ${white_bold}Attempting to start Docker Desktop (Windows)...${reset}"
        if [ -f "C:\Program Files\Docker\Docker\Docker Desktop.exe" ]; then
            start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        else
            echo -e "  ${red_bold}✗ ${white}Could not locate Docker Desktop executable${reset}"
            echo -e "  ${yellow_bold}⚠️ ${white_bold}Please start Docker Desktop manually and try again${reset}"
            echo
            exit 1
        fi
    else
        echo -e "  ${red_bold}✗ ${white}Unsupported operating system${reset}"
        echo -e "  ${yellow_bold}⚠️ ${white_bold}Please start Docker manually and try again${reset}"
        echo
        exit 1
    fi
    
    MAX_DOCKER_RETRIES=120
    DOCKER_RETRY_COUNT=0
    
    while ! docker info &> /dev/null; do
        DOCKER_RETRY_COUNT=$((DOCKER_RETRY_COUNT+1))
        
        if [ $DOCKER_RETRY_COUNT -eq $MAX_DOCKER_RETRIES ]; then
            echo -e "  ${red_bold}✗ ${white}Timed out waiting for Docker daemon to start${reset}"
            echo -e "  ${yellow_bold}⚠️ ${white_bold}Please start Docker manually and try again${reset}"
            echo
            exit 1
        fi
        
        echo -ne "  ${yellow_bold}• ${white}Waiting for Docker daemon... $((MAX_DOCKER_RETRIES / 2 - DOCKER_RETRY_COUNT))s${reset}\033[K\r"
        sleep 0.5
    done
    
    echo -e "  ${green_bold}✔ ${white}Docker started${reset}\033[K\r"
    WE_JUST_STARTED_DOCKER=true
fi


sleep 0.1


# Check if containers exist - if not, this is the first run
if ! docker compose ps -a | grep -q "plump-gpt"; then
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}First time setup...${reset}"
    echo
    echo -e "    ${cyan_bold}Please enter your name:${reset}"
    echo -e "    ${white}(We'll add it to the default system prompt)${reset}"
    echo -e "    ${cyan_bold}➜ ${white_bold}\c"
    read YOUR_NAME

    if [ -z "$YOUR_NAME" ]; then
        echo
        echo -e "  ${green_bold}✔ ${white}Ok, we'll use a nameless prompt${reset}"
    else
        export YOUR_NAME=$YOUR_NAME
    fi
fi

if [ "$REBUILD" = true ]; then
    echo
    echo -e "  ${cyan_bold}➜ ${white_bold}Rebuilding containers...${reset}"
    echo
    docker compose down
    COMPOSE_BAKE=true docker compose build --no-cache
    COMPOSE_BAKE=true docker compose up -d
    echo
    echo -e "  ${green_bold}✔ ${white}Containers started${reset}"
else
    # Check if Plump GPT containers are already running
    if docker compose ps | grep -q "plump-gpt"; then
        if [ "$WE_JUST_STARTED_DOCKER" = true ]; then
            echo
            echo -e "  ${green_bold}✔ ${white}Containers up${reset}"
        else
            echo
            echo -e "  ${green_bold}✔ ${white}Plump GPT containers are already running!${reset}"
            echo -e "    ${white_bold}Restart containers? (y/n): ${reset}\c"
            read -n 1 -r REPLY
            echo
            echo

            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker compose restart
                echo
                echo -e "  ${green_bold}✔ ${white}Containers restarted${reset}"
            else
                echo -e "  ${green_bold}✔ ${white}Containers up${reset}"
            fi
        fi
    else
        if [ "$REBUILD" = true ]; then
            echo
            echo -e "  ${cyan_bold}➜ ${white_bold}Rebuilding containers...${reset}"
            echo
            COMPOSE_BAKE=true docker compose build --no-cache
        else
            echo
            echo -e "  ${cyan_bold}➜ ${white_bold}Starting containers...${reset}"
            echo
        fi
        COMPOSE_BAKE=true docker compose up -d
        echo
        echo -e "  ${green_bold}✔ ${white}Containers started${reset}"
    fi
fi


sleep 0.1


# Check if / wait for database migrations to complete
MAX_RETRIES=30
RETRY_COUNT=0

while true; do
    RETRY_COUNT=$((RETRY_COUNT+1))

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${red_bold}✗ ${white}Timed out waiting for database migration and seeding${reset}"
        echo -e "    ${white}Please check the logs with: ${cyan_bold}docker compose logs app${reset}"
        echo

        exit 1
    fi

    # Check 1: Basic connection to database
    if ! docker compose exec db psql -U plump_user -d plump_gpt -c "SELECT 1" &>/dev/null; then
        echo -ne "  ${yellow_bold}• ${white}Waiting for database... $(($MAX_RETRIES - $RETRY_COUNT))s${reset}\033[K\r"
        sleep 0.5
        continue
    fi

    # Check 2: SystemPrompt table exists and has the default prompt in it
    #
    # The default prompt check needs to fail gracefully (not throw errors)
    # if the table doesn't exist yet (hence the `AND`)
    if docker compose exec db psql -U plump_user -d plump_gpt -t -c "
        SELECT EXISTS (
            SELECT FROM pg_tables WHERE tablename = 'SystemPrompt' 
            AND EXISTS (
                SELECT FROM \"SystemPrompt\" WHERE \"default\" = true
            )
        );" 2>/dev/null | grep -q "t"; then
        break
    fi

    echo -ne "  ${yellow_bold}• ${white}Waiting for database... $(($MAX_RETRIES - $RETRY_COUNT))s${reset}\033[K\r"
    sleep 0.5
done

echo -e "  ${green_bold}✔ ${white}Database ready${reset}\033[K\r"


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
echo -e "  ${grey}Logs can be viewed with: ${cyan}docker compose logs -f${reset}"
sleep 0.005
echo
sleep 0.005
echo


sleep 0.25


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
