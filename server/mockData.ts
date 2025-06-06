import { storage } from "./storage";

// Mock data for testing vulnerabilities
export async function seedMockData() {
  try {
    console.log("Starting mock data seeding...");
    
    // Create one admin user and three regular users
    await storage.upsertUser({
      id: "admin",
      email: "admin@whoopspay.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: "",
      address: "100 Admin Plaza, Security City, SC 12345",
      nationality: "American",
      gender: "Non-binary",
      balance: 10000.00,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 1,

      // VULNERABLE: Sensitive data stored unencrypted
      ssn: "111-11-1111",
      password: "admin123", // VULNERABLE: Plain text password
    });

    await storage.upsertUser({
      id: "user1", 
      email: "user1@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      address: "123 Main Street, New York, NY 10001",
      nationality: "American",
      gender: "Female",
      balance: 1500.50,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,

      ssn: "222-22-2222",
      password: "password1", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "user2",
      email: "user2@example.com",
      firstName: "Bob",
      lastName: "Smith",
      profileImageUrl: "",
      address: "456 Oak Avenue, Los Angeles, CA 90210",
      nationality: "Canadian",
      gender: "Male",
      balance: 750.25,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,

      ssn: "333-33-3333",
      password: "pass123", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "user3",
      email: "user3@example.com", 
      firstName: "Charlie",
      lastName: "Brown",
      profileImageUrl: "",
      address: "789 Pine Road, Chicago, IL 60601",
      nationality: "British",
      gender: "Male",
      balance: 425.00,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,
      ssn: "444-44-4444",
      password: "123456", // VULNERABLE: Extremely weak password
    });





    // Create mock transactions between users
    await storage.createTransaction({
      fromUserId: "admin",
      toUserId: "user1", 
      amount: 150.00,
      description: "Admin payment to Alice",
      status: "completed",
      createdAt: Date.now(),
    });

    await storage.createTransaction({
      fromUserId: "user1",
      toUserId: "user2",
      amount: 75.50, 
      description: "Dinner split payment",
      status: "completed",
      createdAt: Date.now(),
    });

    await storage.createTransaction({
      fromUserId: "user2",
      toUserId: "user3",
      amount: 50.00,
      description: "Movie tickets",
      status: "pending",
      createdAt: Date.now(),
    });

    // Add more transactions for testing
    await storage.createTransaction({
      fromUserId: "user3",
      toUserId: "admin",
      amount: 85.50,
      description: "Service fee payment",
      status: "pending",
      createdAt: Date.now(),
    });

    await storage.createTransaction({
      fromUserId: "user1",
      toUserId: "user3",
      amount: 45.00,
      description: "Concert tickets",
      status: "pending",
      createdAt: Date.now(),
    });

    await storage.createTransaction({
      fromUserId: "user2",
      toUserId: "admin",
      amount: 30.25,
      description: "Monthly subscription",
      status: "completed",
      createdAt: Date.now(),
    });

    await storage.createTransaction({
      fromUserId: "jdoe",
      toUserId: "edoe",
      amount: "25.99",
      description: "Coffee", // VULNERABLE: XSS payload removed
      status: "completed", 
    });

    await storage.createTransaction({
      fromUserId: "mdoe",
      toUserId: "edoe",
      amount: "500.00",
      description: "Amazon.com purchase - Electronics",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "jdoe",
      toUserId: "mdoe",
      amount: "15.99",
      description: "Netflix subscription",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "edoe",
      toUserId: "jdoe",
      amount: "9.99",
      description: "Spotify Premium",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "mdoe",
      toUserId: "edoe",
      amount: "23.45",
      description: "Uber ride - Downtown",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "jdoe",
      toUserId: "mdoe",
      amount: "7.85",
      description: "Starbucks coffee",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "edoe",
      toUserId: "jdoe",
      amount: "125.00",
      description: "Apple App Store purchase",
      status: "completed",
    });

    // Create transactions with your current authenticated user ID (43412562)
    // These will show up in your transaction history for testing
    await storage.createTransaction({
      fromUserId: "43412562", // Your authenticated user ID
      toUserId: "mock_user_1",
      amount: "45.00",
      description: "Coffee with Alice",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "mock_user_2",
      toUserId: "43412562", // Your authenticated user ID
      amount: "120.75",
      description: "<script>alert('XSS in your transactions!')</script>Dinner payment", // VULNERABLE: XSS
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "43412562", // Your authenticated user ID
      toUserId: "mock_user_3",
      amount: "85.50",
      description: "Gas money",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "mock_user_1",
      toUserId: "43412562", // Your authenticated user ID
      amount: "300.00",
      description: "Rent split <img src=x onerror=alert('Stored XSS!')>", // VULNERABLE: XSS
      status: "completed",
    });

    console.log("Mock transactions created including ones with authenticated user 43412562");

    // Create mock payment methods with unencrypted data
    await storage.addPaymentMethod({
      userId: "mock_user_1",
      type: "card",
      cardName: "John Doe",
      cardNumber: "4532-1234-5678-9012", // VULNERABLE: Unencrypted card
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_1", 
      type: "bank",
      bankName: "Chase Bank",
      accountNumber: "987654321", // VULNERABLE: Unencrypted account
      iban: "US64SVBKUS6S3300958879",
      isDefault: 0,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_2",
      type: "card",
      cardName: "Mairy Doe",
      cardNumber: "5555-4444-3333-2222",
      expiryDate: "08/26", 
      cvv: "456",
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_2", 
      type: "bank",
      bankName: "Bank of America",
      accountNumber: "456789123",
      iban: "US33BOFA0208000100003328",
      isDefault: 0,
    });

    // Create payment methods for mdoe user (only if they don't exist)
    const existingPaymentMethods = await storage.getUserPaymentMethods("mdoe");
    if (existingPaymentMethods.length === 0) {
      await storage.addPaymentMethod({
        userId: "mdoe",
        type: "card",
        cardName: "Mairy Doe",
        cardNumber: "4111-1111-1111-6639",
        bankName: "Chase Bank",
        isDefault: 1,
      });

      await storage.addPaymentMethod({
        userId: "mdoe",
        type: "card",
        cardName: "M. Doe",
        cardNumber: "5555-5555-5555-4111",
        bankName: "Bank of America",
        isDefault: 0,
      });

      await storage.addPaymentMethod({
        userId: "mdoe", 
        type: "bank",
        bankName: "Chase Bank",
        accountNumber: "123456782123",
        iban: "US89370400440532013000",
        isDefault: 0,
      });
    }

    console.log("Mock data seeded successfully with intentional vulnerabilities");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  }
}