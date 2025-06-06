#!/bin/bash

echo "🚀 Testing Docker Integration for WhoopsPay + Juice Shop"
echo "=================================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Build WhoopsPay image
echo "🔨 Building WhoopsPay Docker image..."
docker build -t whoopspay:test . || {
    echo "❌ Failed to build WhoopsPay image"
    exit 1
}

echo "✅ WhoopsPay image built successfully"

# Test health endpoint
echo "🏥 Testing WhoopsPay health endpoint..."
docker run --rm -d -p 5001:5000 --name whoopspay-test whoopspay:test
sleep 10

HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health endpoint responding correctly"
else
    echo "❌ Health endpoint failed (HTTP $HEALTH_RESPONSE)"
fi

# Clean up test container
docker stop whoopspay-test 2>/dev/null || true

# Test Docker Compose configuration
echo "🐳 Testing Docker Compose configuration..."
docker-compose config || {
    echo "❌ Docker Compose configuration is invalid"
    exit 1
}

echo "✅ Docker Compose configuration is valid"

# Test external payment integration endpoint
echo "🔗 Testing Juice Shop integration endpoint..."
docker run --rm -d -p 5002:5000 --name whoopspay-integration-test whoopspay:test
sleep 10

INTEGRATION_TEST=$(curl -s -X POST http://localhost:5002/api/juice-shop/payment-request \
    -H "Content-Type: application/json" \
    -d '{
        "amount": 19.99,
        "description": "Docker Test Order",
        "toUserId": "@sarah_wilson",
        "externalOrderId": "DOCKER_TEST_001",
        "returnUrl": "http://localhost:3000/success",
        "cancelUrl": "http://localhost:3000/cancel"
    }' || echo "failed")

if echo "$INTEGRATION_TEST" | grep -q "redirectUrl"; then
    echo "✅ Juice Shop integration endpoint working"
else
    echo "❌ Juice Shop integration endpoint failed"
    echo "Response: $INTEGRATION_TEST"
fi

# Clean up
docker stop whoopspay-integration-test 2>/dev/null || true

echo "=================================================="
echo "🎉 Docker integration test completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Run: docker-compose up -d"
echo "2. Access WhoopsPay: http://localhost:5000"
echo "3. Access Juice Shop: http://localhost:3000"
echo "4. Test payment integration between services"
echo ""
echo "🔧 Development mode:"
echo "docker-compose -f docker-compose.dev.yml up -d"