import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Camera,
  Key
} from "lucide-react";
import { UserModel } from "../../models/UserModel";
import { WalletController } from "../../controllers/WalletController";
import { TransactionController } from "../../controllers/TransactionController";
import { useAuth } from "../../hooks/useAuth";

interface ProfileViewProps {
  userId?: string;
  showEditMode?: boolean;
  showActivityLog?: boolean;
}

export function ProfileView({ 
  userId,
  showEditMode = true,
  showActivityLog = true 
}: ProfileViewProps) {
  const { user } = useAuth();
  const currentUserId = userId || user?.id;
  
  const [walletController] = useState(() => new WalletController());
  const [transactionController] = useState(() => new TransactionController());
  
  // State management
  const [profileData, setProfileData] = useState<any>(null);
  const [walletStats, setWalletStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState("profile");

  // Load profile data
  const loadProfileData = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      const [walletStatsResult, activityResult] = await Promise.all([
        walletController.getWalletStats(currentUserId),
        transactionController.getUserTransactions(currentUserId, {}, { limit: 10 })
      ]);

      // Set profile data from auth user
      setProfileData(user);
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        country: ''
      });

      if (walletStatsResult.success) {
        setWalletStats(walletStatsResult.data);
      }

      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      // In a real implementation, this would call a user update API
      setProfileData(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUserId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 text-gray-400">
            <User className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Loading Profile</h3>
            <p>Preparing your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold">
                {profileData?.firstName?.charAt(0) || profileData?.email?.charAt(0) || 'U'}
              </div>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                {profileData?.firstName && profileData?.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData?.email?.split('@')[0] || 'User Profile'
                }
              </h1>
              <p className="text-gray-400 mt-1">{profileData?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {profileData?.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {profileData?.isAdmin && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {showEditMode && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-gray-600 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900/20 border-red-400/50">
            <CardContent className="p-4">
              <div className="text-red-400 font-medium">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Profile Stats */}
        {walletStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">
                      {walletStats.totalTransactions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Spending</p>
                    <p className="text-2xl font-bold text-white">
                      ${walletStats.monthlySpending?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-400/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Payment Methods</p>
                    <p className="text-2xl font-bold text-white">
                      {walletStats.paymentMethodsCount || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Security
            </TabsTrigger>
            {showActivityLog && (
              <TabsTrigger value="activity" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Activity Log
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <div className="p-3 bg-gray-800 rounded-md text-white">
                        {profileData?.firstName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <div className="p-3 bg-gray-800 rounded-md text-white">
                        {profileData?.lastName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Email Address
                    </label>
                    <div className="p-3 bg-gray-800 rounded-md text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {profileData?.email || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="p-3 bg-gray-800 rounded-md text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {editForm.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Member Since
                  </label>
                  <div className="p-3 bg-gray-800 rounded-md text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                    <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Change Password</h3>
                    <p className="text-gray-400 text-sm">Update your account password</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Login Sessions</h3>
                    <p className="text-gray-400 text-sm">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {showActivityLog && (
            <TabsContent value="activity" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 8).map((activity, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                          <div>
                            <p className="text-white font-medium">
                              {activity.description || 'Transaction'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              ${activity.amount?.toFixed(2)} • {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              activity.status === 'completed' ? 'text-green-400 border-green-400' :
                              activity.status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                              'text-red-400 border-red-400'
                            }`}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="preferences" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Transaction Notifications', description: 'Get notified about all transactions' },
                  { title: 'Security Alerts', description: 'Important security notifications' },
                  { title: 'Marketing Updates', description: 'Product updates and promotions' },
                  { title: 'Weekly Summary', description: 'Weekly account activity summary' }
                ].map((pref, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">{pref.title}</h3>
                      <p className="text-gray-400 text-sm">{pref.description}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-white">
                      {index < 2 ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}