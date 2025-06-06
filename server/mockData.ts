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
    });

    await storage.createTransaction({
      fromUserId: "user1",
      toUserId: "user2",
      amount: 75.50, 
      description: "Dinner split payment",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "user2",
      toUserId: "user3",
      amount: 50.00,
      description: "Movie tickets",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "user3",
      toUserId: "admin",
      amount: 85.50,
      description: "Service fee payment",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "user1",
      toUserId: "user3",
      amount: 45.00,
      description: "Concert tickets",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "user2",
      toUserId: "admin",
      amount: 30.25,
      description: "Monthly subscription",
      status: "completed",
    });

    console.log("Mock transactions created for admin and three regular users");

    // Create mock payment methods with unencrypted data
    await storage.addPaymentMethod({
      userId: "admin",
      type: "card",
      cardName: "Admin User",
      cardNumber: "4532-1234-5678-9012", // VULNERABLE: Unencrypted card
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "user1", 
      type: "bank",
      bankName: "Chase Bank",
      accountNumber: "987654321", // VULNERABLE: Unencrypted account
      iban: "US64SVBKUS6S3300958879",
      isDefault: 0,
    });

    await storage.addPaymentMethod({
      userId: "user2",
      type: "card",
      cardName: "Bob Smith",
      cardNumber: "5555-4444-3333-2222",
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "user3", 
      type: "bank",
      bankName: "Bank of America",
      accountNumber: "456789123",
      iban: "US33BOFA0208000100003328",
      isDefault: 0,
    });



    console.log("Mock data seeded successfully with intentional vulnerabilities");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  }
}