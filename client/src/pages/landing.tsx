/**
 * Landing Page - Welcome interface for unauthenticated users
 * 
 * Marketing and onboarding page providing:
 * - Hero section with value proposition and call-to-action buttons
 * - Feature showcase highlighting platform capabilities
 * - Security and trust indicators for user confidence
 * - Responsive design optimized for all devices
 * - Clear navigation to registration and login flows
 * 
 * Educational Security Features:
 * - Demonstrates public-facing application design
 * - Shows marketing page security considerations
 * - Includes trust signal implementation
 * 
 * VULNERABILITY NOTE: Public interface may expose system information
 * for educational security training purposes.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Send, Smartphone, CreditCard, Globe, Users } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n";

/**
 * Landing Component - Marketing and onboarding interface
 * 
 * Main landing page for unauthenticated users featuring comprehensive
 * product marketing and clear conversion paths. Features include:
 * - Hero section with compelling value proposition
 * - Feature grid showcasing platform capabilities
 * - Trust indicators and security messaging
 * - Clear call-to-action buttons for registration and login
 * - Responsive design optimized for mobile and desktop
 */
export default function Landing() {
  const { t } = useI18n();

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
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold whoopspay-blue">WhoopsPay</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="whoopspay-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t('heroTitle')}
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignup}
              className="paypal-btn-base paypal-btn-primary"
            >
              {t('getStarted')}
            </button>
            <button 
              onClick={handleLogin}
              className="paypal-btn-base paypal-btn-secondary"
            >
              {t('signIn')}
            </button>
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
                <CardTitle>{t('purchaseProtection')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('purchaseProtectionDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>{t('sendMoney')}</CardTitle>
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
                <CardTitle>{t('mobileReady')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('mobileReadyDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>{t('multiplePaymentOptions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('multiplePaymentOptionsDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>{t('globalReach')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('globalReachDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>{t('trustedCommunity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('trustedCommunityDesc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              {t('footerText')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
