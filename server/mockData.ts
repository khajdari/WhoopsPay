import { storage } from "./storage";

// Mock data for testing vulnerabilities
export async function seedMockData() {
  try {
    console.log("Starting mock data seeding...");
    
    // Clear all existing users first
    const allUsers = await storage.getAllUsers();
    for (const user of allUsers) {
      await storage.deleteUser(user.id);
    }
    console.log("Cleared all existing users");
    
    // Clear old transactions with non-@ prefix user IDs
    const allTransactions = await storage.getAllTransactions();
    for (const transaction of allTransactions) {
      if (!transaction.fromUserId.startsWith('@') || !transaction.toUserId.startsWith('@')) {
        // Delete old transactions that reference old user IDs
        await storage.deleteTransaction(transaction.id);
      }
    }
    console.log("Cleared old transactions with non-@ prefix user IDs");
    
    // Create one admin user and three regular users with @ prefix
    await storage.upsertUser({
      id: "@admin_maria",
      email: "maria.rodriguez@whoopspay.com",
      firstName: "Maria",
      lastName: "Rodriguez",
      profileImageUrl: "",
      address: "500 Security Boulevard, Admin District, Washington DC 20001",
      nationality: "Spanish",
      gender: "Female",
      balance: 15000.00,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 1,

      // VULNERABLE: Sensitive data stored unencrypted
      ssn: "555-11-1111",
      password: "admin2024", // VULNERABLE: Plain text password
    });

    await storage.upsertUser({
      id: "@sarah_wilson", 
      email: "sarah.wilson@example.com",
      firstName: "Sarah",
      lastName: "Wilson",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      address: "245 Maple Street, Portland, OR 97201",
      nationality: "American",
      gender: "Female",
      balance: 2850.75,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,

      ssn: "555-22-2222",
      password: "sarah123", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "@james_chen",
      email: "james.chen@example.com",
      firstName: "James",
      lastName: "Chen",
      profileImageUrl: "",
      address: "837 Technology Drive, Austin, TX 78701",
      nationality: "Canadian",
      gender: "Male",
      balance: 1247.50,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,

      ssn: "555-33-3333",
      password: "james2024", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "@elena_kowalski",
      email: "elena.kowalski@example.com", 
      firstName: "Elena",
      lastName: "Kowalski",
      profileImageUrl: "",
      address: "192 Heritage Lane, Boston, MA 02101",
      nationality: "Polish",
      gender: "Female",
      balance: 963.25,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: 0,

      ssn: "555-44-4444",
      password: "elena456", // VULNERABLE: Extremely weak password
    });

    // Create mock transactions between new users
    await storage.createTransaction({
      fromUserId: "@admin_maria",
      toUserId: "@sarah_wilson", 
      amount: 200.00,
      description: "Administrative payment",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "@sarah_wilson",
      toUserId: "@james_chen",
      amount: 125.75, 
      description: "Project collaboration payment",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "@james_chen",
      toUserId: "@elena_kowalski",
      amount: 80.50,
      description: "Consulting services",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "@elena_kowalski",
      toUserId: "@admin_maria",
      amount: 95.25,
      description: "Monthly service fee",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "@sarah_wilson",
      toUserId: "@elena_kowalski",
      amount: 60.00,
      description: "Design work payment",
      status: "pending",
    });

    await storage.createTransaction({
      fromUserId: "@james_chen",
      toUserId: "@admin_maria",
      amount: 45.75,
      description: "License renewal",
      status: "completed",
    });

    console.log("Mock transactions created for new users");

    // Create mock payment methods with unencrypted data
    await storage.addPaymentMethod({
      userId: "@admin_maria",
      type: "card",
      cardName: "Maria Rodriguez",
      cardNumber: "4532-1234-5678-9012", // VULNERABLE: Unencrypted card
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "@sarah_wilson", 
      type: "bank",
      bankName: "Chase Bank",
      accountNumber: "987654321", // VULNERABLE: Unencrypted account
      iban: "US64SVBKUS6S3300958879",
      isDefault: 0,
    });

    await storage.addPaymentMethod({
      userId: "@james_chen",
      type: "card",
      cardName: "James Chen",
      cardNumber: "5555-4444-3333-2222",
      isDefault: 1,
    });

    await storage.addPaymentMethod({
      userId: "@elena_kowalski", 
      type: "bank",
      bankName: "Bank of America",
      accountNumber: "456789123",
      iban: "US33BOFA0208000100003328",
      isDefault: 0,
    });

    console.log("Mock data seeded successfully with new users and @ prefix IDs");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  }
}