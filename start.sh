#!/bin/bash

# Colors
blue='\033[0;34m'
cyan='\033[0;36m'
white='\033[0;37m'
green='\033[0;32m'
red='\033[0;31m'
yellow='\033[0;33m'
blue_bold='\033[1;34m'
cyan_bold='\033[1;36m'
white_bold='\033[1;37m'
green_bold='\033[1;32m'
red_bold='\033[1;31m'
reset='\033[0m'

# Read port value from config.js
APP_PORT=$(grep "const APP_PORT" ./src/lib/config.js | sed "s/.*APP_PORT *=* *//;s/[',]//g" | tr -d '[:space:]')

# Read version from package.json
APP_VERSION=$(grep "\"version\":" package.json | head -1 | sed 's/.*: "\(.*\)",/\1/' | tr -d '[:space:]')

check_postgres() {
    if [ -f .env ]; then
        DB_URL=$(grep "DATABASE_URL" .env | cut -d= -f2)
        
        # More readable regex with named capture groups using PCRE
        if [[ $DB_URL =~ postgresql://([^:@]+)?(:[^@]+)?@([^:/]+)(:([0-9]+))?/([^?]+)(\?.*)?$ ]]; then
            # Parse connection components
            DB_USER="${BASH_REMATCH[1]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[5]}"
            DB_NAME="${BASH_REMATCH[6]}"
        else
            echo -e "  ${yellow}⚠ ${white}Could not parse DATABASE_URL in .env file${reset}"
            echo -e "  ${yellow}⚠ ${white}Please check your DATABASE_URL format${reset}"
            exit 1
        fi
    else
        echo -e "  ${yellow}⚠ ${white}No .env file found${reset}"
        echo -e "  ${yellow}⚠ ${white}Create a .env file with your database URL and API keys${reset}"
        exit 1
    fi
    
    # Check if PostgreSQL is running on specified port
    if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
        echo -e "  ${green_bold}✓ ${white}PostgreSQL is running on ${DB_HOST}:${DB_PORT}${reset}"
        
        # If database name available, attempt to connect
        if [ ! -z "$DB_NAME" ]; then
            # Use the full connection string from .env
            if psql "$DB_URL" -c '\q' 2>/dev/null; then
                echo -e "  ${green_bold}✓ ${white}Successfully connected to database '${DB_NAME}'${reset}"
            else
                echo -e "  ${yellow}⚠ ${white}PostgreSQL is running, but could not connect to database '${DB_NAME}'${reset}"
                echo -e "  ${yellow}⚠ ${white}Check your DATABASE_URL in .env file${reset}"
            fi
        fi
    else
        echo -e "  ${red_bold}✗ ${white}PostgreSQL is not running on ${DB_HOST}:${DB_PORT}${reset}"
        echo -e "  ${yellow}⚠ ${white}Start PostgreSQL before continuing${reset}"
        read -p "  Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

echo -e "\n\n"
echo -e "${white_bold}8888888b.  888     888     888 888b     d888 8888888b.        .d8888b.  8888888b. 88888888888                 ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888   Y88b 888     888     888 8888b   d8888 888   Y88b      d88P  Y88b 888   Y88b    888                    ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888    888 888     888     888 88888b.d88888 888    888      888    888 888    888    888                   ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888   d88P 888     888     888 888Y88888P888 888   d88P      888        888   d88P    888                  ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}8888888P\"  888     888     888 888 Y888P 888 8888888P\"       888  88888 8888888P\"     888                 ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888        888     888     888 888  Y8P  888 888             888    888 888           888                ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888        888     Y88b. .d88P 888   \"   888 888             Y88b  d88P 888           888               ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}888        88888888 \"Y88888P\"  888       888 888              \"Y8888P88 888           888              ${blue_bold}d88P   d88P${reset}"
echo -e "\n\n"

# Check PostgreSQL status
check_postgres

echo -e "\n\n  ${blue_bold}PLUMP GPT${blue} v${APP_VERSION}${reset}"
echo -e "  ${blue_bold}➜ ${white_bold}App: ${blue}http://localhost:${blue_bold}${APP_PORT}${blue}/${reset}\n"

# Start PlumpGPT
env="${1:-preview}"
npm run $env
