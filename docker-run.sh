#!/bin/bash

# WhoopsPay Docker Setup Script
# Simplifies running WhoopsPay and Juice Shop with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check for port conflicts
check_ports() {
    print_status "Checking for port conflicts..."
    
    if lsof -i :3000 > /dev/null 2>&1; then
        print_warning "Port 3000 is in use. This may conflict with WhoopsPay."
    fi
    
    if lsof -i :3001 > /dev/null 2>&1; then
        print_warning "Port 3001 is in use. This may conflict with Juice Shop."
    fi
}

# Function to build and start services
start_services() {
    print_status "Building and starting WhoopsPay and Juice Shop..."
    
    # Build the WhoopsPay image
    print_status "Building WhoopsPay Docker image..."
    docker build -t whoopspay . || {
        print_error "Failed to build WhoopsPay image"
        exit 1
    }
    
    # Start services with docker-compose
    print_status "Starting services with Docker Compose..."
    docker-compose up -d || {
        print_error "Failed to start services"
        exit 1
    }
    
    print_success "Services are starting up..."
    print_status "Waiting for services to be ready..."
    
    # Wait for services to be healthy
    sleep 10
    
    # Check health
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            print_success "WhoopsPay is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "WhoopsPay may still be starting up"
        fi
        sleep 2
    done
    
    for i in {1..30}; do
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            print_success "Juice Shop is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "Juice Shop may still be starting up"
        fi
        sleep 2
    done
}

# Function to show access information
show_access_info() {
    echo ""
    echo "======================================"
    echo "🚀 WhoopsPay is now running!"
    echo "======================================"
    echo ""
    echo "📱 WhoopsPay Application:"
    echo "   URL: http://localhost:3000"
    echo "   Status: $(curl -s http://localhost:3000/api/health > /dev/null 2>&1 && echo "✅ Ready" || echo "⏳ Starting")"
    echo ""
    echo "🧃 OWASP Juice Shop:"
    echo "   URL: http://localhost:3001"
    echo "   Status: $(curl -s http://localhost:3001 > /dev/null 2>&1 && echo "✅ Ready" || echo "⏳ Starting")"
    echo ""
    echo "📊 API Documentation:"
    echo "   URL: http://localhost:3000/api-docs"
    echo ""
    echo "======================================"
    echo "Useful Commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo "======================================"
    echo ""
}

# Function to stop services
stop_services() {
    print_status "Stopping WhoopsPay services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to show logs
show_logs() {
    print_status "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Main script logic
case "${1:-start}" in
    "start")
        print_status "Starting WhoopsPay Docker setup..."
        check_docker
        check_ports
        start_services
        show_access_info
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        show_access_info
        ;;
    "logs")
        show_logs
        ;;
    "status")
        print_status "Checking service status..."
        docker-compose ps
        echo ""
        show_access_info
        ;;
    "build")
        print_status "Rebuilding WhoopsPay image..."
        docker build -t whoopspay . --no-cache
        print_success "Build complete"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|build}"
        echo ""
        echo "Commands:"
        echo "  start   - Build and start all services (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show real-time logs"
        echo "  status  - Show current status"
        echo "  build   - Rebuild WhoopsPay image"
        exit 1
        ;;
esac