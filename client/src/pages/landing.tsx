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
import { Layout } from "@/components/layout";

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
    <Layout showHeader={false} showMobileNav={false}>
      <div className="bg-gray-50 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">WhoopsPay</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <Button onClick={handleLogin} variant="outline">
                  {t('signIn')}
                </Button>
                <Button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-300">
                  {t('getStarted')}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-800 to-blue-400 py-10">
          <div className="mwhoopspay-gradient">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-blue-50 mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-blue-50 mb-8 max-w-3xl mx-auto">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('featuresTitle')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('featuresSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>{t('instantTransfers')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('instantTransfersDesc')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>{t('secureProtection')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('secureProtectionDesc')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>{t('mobileApp')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('mobileAppDesc')}
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

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>{t('multiplePaymentOptions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('multiplePaymentOptionsDesc')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}