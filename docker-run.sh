#!/bin/bash

# WhoopsPay Docker Management Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}WhoopsPay Docker Management${NC}"
echo "==============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Function to build and run
build_and_run() {
    echo -e "${YELLOW}Building WhoopsPay Docker image...${NC}"
    docker-compose build --no-cache whoopspay
    
    echo -e "${YELLOW}Starting WhoopsPay...${NC}"
    docker-compose up -d whoopspay
    
    echo -e "${GREEN}WhoopsPay started successfully!${NC}"
    echo "Access at: http://localhost:3000"
    echo "Custom Juice Shop: http://localhost:3000/juice-shop"
}

# Function to start with optional Juice Shop
start_with_juice_shop() {
    echo -e "${YELLOW}Starting WhoopsPay with optional official Juice Shop...${NC}"
    docker-compose --profile optional up -d
    
    echo -e "${GREEN}Both services started successfully!${NC}"
    echo "WhoopsPay: http://localhost:3000"
    echo "Custom Juice Shop: http://localhost:3000/juice-shop"
    echo "Official Juice Shop: http://localhost:3002"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}Showing WhoopsPay logs...${NC}"
    docker-compose logs -f whoopspay
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}Services stopped${NC}"
}

# Function to clean up
cleanup() {
    echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
    docker-compose down -v
    docker system prune -f
    echo -e "${GREEN}Cleanup completed${NC}"
}

# Main menu
case "$1" in
    "build")
        build_and_run
        ;;
    "start")
        docker-compose up -d whoopspay
        echo -e "${GREEN}WhoopsPay started!${NC}"
        ;;
    "juice")
        start_with_juice_shop
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|start|juice|logs|stop|clean}"
        echo ""
        echo "Commands:"
        echo "  build  - Build and start WhoopsPay"
        echo "  start  - Start WhoopsPay only"
        echo "  juice  - Start with optional official Juice Shop"
        echo "  logs   - Show WhoopsPay logs"
        echo "  stop   - Stop all services"
        echo "  clean  - Stop and clean up Docker resources"
        exit 1
        ;;
esac