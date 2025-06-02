import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Send, Smartphone, CreditCard, Globe, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleSignup = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold paypal-blue">InsecurePay</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="paypal-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Send, spend, and receive money your way
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            It's fast, free, and secure to send money to friends and family
          </p>
          <div className="space-x-4">
            <Button 
              onClick={handleSignup}
              size="lg" 
              className="bg-white paypal-blue"
            >
              Sign Up
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="outline" 
              className="border-white text-white"
            >
              Log In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Send and receive money your way
            </h3>
            <p className="text-xl text-gray-600">
              Pay however you want. We make it simple and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Purchase Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Shop with confidence knowing your eligible purchases are covered
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Send Money</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send money to friends and family instantly with just an email
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Mobile Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your account anywhere with our mobile-optimized platform
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Multiple Payment Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Link your bank account, credit card, or debit card
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send and receive money in multiple currencies worldwide
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Trusted Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join millions of users who trust us with their payments
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Sign up for your free InsecurePay account today
          </p>
          <Button 
            onClick={handleSignup}
            size="lg" 
            className="bg-paypal-blue text-white"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">InsecurePay</h4>
            <p className="text-gray-400">
              © 2024 InsecurePay. This is an educational project demonstrating web vulnerabilities.
            </p>
            <p className="text-sm text-red-400 mt-2">
              ⚠️ WARNING: This application contains intentional security vulnerabilities for educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
