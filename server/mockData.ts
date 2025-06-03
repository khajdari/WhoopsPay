import { storage } from "./storage";

// Mock data for testing vulnerabilities
export async function seedMockData() {
  try {
    console.log("Starting mock data seeding...");
    
    // Create mock users with intentionally vulnerable data
    await storage.upsertUser({
      id: "jdoe",
      email: "john.doe@email.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      address: "123 Main Street, New York, NY 10001",
      nationality: "American",
      gender: "Male",
      balance: "1250.50",

      // VULNERABLE: Sensitive data stored unencrypted
      ssn: "123-45-6789",
      bankAccount: "4532-1234-5678-9012",
      creditCard: "4111-1111-1111-1111",
      password: "pass", // VULNERABLE: Plain text password
    });

    await storage.upsertUser({
      id: "mdoe", 
      email: "mary.doe@email.com",
      firstName: "Mary",
      lastName: "Doe",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      address: "456 Oak Avenue, Los Angeles, CA 90210",
      nationality: "Canadian",
      gender: "Female",
      balance: "875.25",

      ssn: "987-65-4321",
      bankAccount: "5555-4444-3333-2222",
      creditCard: "5555-5555-5555-4444",
      password: "pass", // VULNERABLE: Weak password
    });

    await storage.upsertUser({
      id: "edoe",
      email: "elisa.doe@email.com", 
      firstName: "Elisa",
      lastName: "Doe",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      address: "789 Pine Road, Chicago, IL 60601",
      nationality: "British",
      gender: "Female",
      balance: "2150.00",
      ssn: "555-12-3456",
      bankAccount: "1111-2222-3333-4444",
      creditCard: "3782-8224-6310-005",
      password: "pass", // VULNERABLE: Common password
    });

    // Add admin user
    await storage.upsertUser({
      id: "admin", 
      email: "admin@paypwned.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: "",
      address: "System Administrator",
      nationality: "System",
      gender: "System",
      balance: "0.00",
      ssn: "000-00-0000",
      bankAccount: "0000000000",
      creditCard: "0000-0000-0000-0000",
      password: "Admin", // VULNERABLE: Plain text password
      isAdmin: true,
    });

    // Create mock transactions between mock users
    await storage.createTransaction({
      fromUserId: "jdoe",
      toUserId: "mdoe", 
      amount: "150.00",
      description: "Dinner split",
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "mdoe",
      toUserId: "jdoe",
      amount: "75.50", 
      description: "Gift for birthday", // VULNERABLE: XSS payload removed
      status: "completed",
    });

    await storage.createTransaction({
      fromUserId: "edoe",
      toUserId: "jdoe",
      amount: "200.00",
      description: "Rent payment",
      status: "pending",
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
      expiryDate: "12/25",
      cvv: "123", // VULNERABLE: Stored CVV
      isDefault: true,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_1", 
      type: "bank",
      bankName: "Chase Bank",
      accountNumber: "987654321", // VULNERABLE: Unencrypted account
      iban: "US64SVBKUS6S3300958879",
      isDefault: false,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_2",
      type: "card",
      cardName: "Mairy Doe",
      cardNumber: "5555-4444-3333-2222",
      expiryDate: "08/26", 
      cvv: "456",
      isDefault: true,
    });

    await storage.addPaymentMethod({
      userId: "mock_user_2", 
      type: "bank",
      bankName: "Bank of America",
      accountNumber: "456789123",
      iban: "US33BOFA0208000100003328",
      isDefault: false,
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
        expiryDate: "12/26", 
        cvv: "123",
        isDefault: true,
      });

      await storage.addPaymentMethod({
        userId: "mdoe",
        type: "card",
        cardName: "M. Doe",
        cardNumber: "5555-5555-5555-4111",
        bankName: "Bank of America",
        expiryDate: "09/27", 
        cvv: "456",
        isDefault: false,
      });

      await storage.addPaymentMethod({
        userId: "mdoe", 
        type: "bank",
        bankName: "Chase Bank",
        accountNumber: "123456782123",
        iban: "US89370400440532013000",
        isDefault: false,
      });
    }

    console.log("Mock data seeded successfully with intentional vulnerabilities");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  }
}