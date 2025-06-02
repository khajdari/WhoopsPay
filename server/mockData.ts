import { storage } from "./storage";

// Mock data for testing vulnerabilities
export async function seedMockData() {
  try {
    // Create mock users with intentionally vulnerable data
    await storage.upsertUser({
      id: "mock_user_1",
      email: "alice.smith@email.com",
      firstName: "Alice",
      lastName: "Smith",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      balance: "1,250.50",
      // VULNERABLE: Sensitive data stored unencrypted
      ssn: "123-45-6789",
      bankAccount: "4532-1234-5678-9012",
      creditCard: "4111-1111-1111-1111",
      password: "password123", // VULNERABLE: Plain text password
    });

    await storage.upsertUser({
      id: "mock_user_2", 
      email: "bob.johnson@email.com",
      firstName: "Bob",
      lastName: "Johnson",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      balance: "875.25",
      ssn: "987-65-4321",
      bankAccount: "5555-4444-3333-2222",
      creditCard: "5555-5555-5555-4444",
      password: "admin", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "mock_user_3",
      email: "carol.davis@email.com", 
      firstName: "Carol",
      lastName: "Davis",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      balance: "2,150.00",
      ssn: "555-12-3456",
      bankAccount: "1111-2222-3333-4444",
      creditCard: "3782-8224-6310-005",
      password: "qwerty", // VULNERABLE: Common password
    });

    // Create mock transactions with XSS payloads
    await storage.createTransaction({
      fromUserId: "mock_user_1",
      toUserId: "mock_user_2", 
      amount: "150.00",
      description: "Dinner split", // Normal transaction
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "mock_user_2",
      toUserId: "mock_user_1",
      amount: "75.50", 
      description: "<script>alert('XSS Attack!')</script>Gift for birthday", // VULNERABLE: XSS payload
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "mock_user_3",
      toUserId: "mock_user_1",
      amount: "200.00",
      description: "Rent payment",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "mock_user_1",
      toUserId: "mock_user_3",
      amount: "25.99",
      description: "<img src=x onerror=alert('Stored XSS')>Coffee", // VULNERABLE: Another XSS payload
      status: "completed", 
    });

    await storage.createTransaction({
      fromUserId: "mock_user_2",
      toUserId: "mock_user_3",
      amount: "500.00",
      description: "Amazon.com purchase - Electronics",
      status: "completed",
    });

    // Create mock payment methods with unencrypted data
    await storage.addPaymentMethod({
      userId: "mock_user_1",
      type: "card",
      cardNumber: "4111-1111-1111-1111", // VULNERABLE: Unencrypted card
      expiryDate: "12/25",
      cvv: "123", // VULNERABLE: Stored CVV
      isDefault: true,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_1", 
      type: "bank",
      accountNumber: "123456789", // VULNERABLE: Unencrypted account
      routingNumber: "021000021",
      isDefault: false,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_2",
      type: "card",
      cardNumber: "5555-5555-5555-4444",
      expiryDate: "08/26", 
      cvv: "456",
      isDefault: true,
    });

    console.log("Mock data seeded successfully with intentional vulnerabilities");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  }
}