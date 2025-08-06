import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  DollarSign, 
  User, 
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { WalletController } from "../../controllers/WalletController";
import { TransactionController } from "../../controllers/TransactionController";
import { PaymentMethodModel } from "../../models/PaymentMethodModel";
import { useAuth } from "../../hooks/useAuth";

interface TransferViewProps {
  recipientId?: string;
  presetAmount?: number;
  showRecentTransfers?: boolean;
}

export function TransferView({ 
  recipientId,
  presetAmount,
  showRecentTransfers = true 
}: TransferViewProps) {
  const { user } = useAuth();
  
  const [walletController] = useState(() => new WalletController());
  const [transactionController] = useState(() => new TransactionController());
  
  // State management
  const [transferData, setTransferData] = useState({
    recipientEmail: recipientId || '',
    amount: presetAmount || 0,
    description: '',
    paymentMethodId: ''
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodModel[]>([]);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'confirm' | 'complete'>('form');
  const [showBalance, setShowBalance] = useState(true);

  // Load transfer data
  const loadTransferData = async () => {
    if (!user?.id) return;
    
    try {
      const [balanceResult, methodsResult, transfersResult] = await Promise.all([
        walletController.getWalletBalance(user.id),
        walletController.getPaymentMethods(user.id),
        transactionController.getUserTransactions(user.id, { type: 'transfer' }, { limit: 5 })
      ]);

      if (balanceResult.success) {
        setWalletBalance(balanceResult.data);
      }

      if (methodsResult.success) {
        const methods = methodsResult.data as PaymentMethodModel[];
        setPaymentMethods(methods);
        
        // Set default payment method if available
        const defaultMethod = methods.find(m => m.isDefault);
        if (defaultMethod && !transferData.paymentMethodId) {
          setTransferData(prev => ({ ...prev, paymentMethodId: defaultMethod.id.toString() }));
        }
      }

      if (transfersResult.success) {
        setRecentTransfers(transfersResult.data);
      }
    } catch (err) {
      setError('Failed to load transfer data');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate transfer form
  const validateTransfer = () => {
    const errors: string[] = [];

    if (!transferData.recipientEmail) {
      errors.push('Recipient email is required');
    } else if (!/\S+@\S+\.\S+/.test(transferData.recipientEmail)) {
      errors.push('Invalid email format');
    }

    if (!transferData.amount || transferData.amount <= 0) {
      errors.push('Valid amount is required');
    } else if (transferData.amount > 10000) {
      errors.push('Amount cannot exceed ¤10,000');
    }

    if (walletBalance && transferData.amount > walletBalance.available) {
      errors.push('Insufficient funds');
    }

    if (!transferData.paymentMethodId) {
      errors.push('Payment method is required');
    }

    if (transferData.recipientEmail === user?.email) {
      errors.push('Cannot send money to yourself');
    }

    return errors;
  };

  // Handle transfer submission
  const handleTransfer = async () => {
    const validationErrors = validateTransfer();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await transactionController.createTransaction({
        fromUserId: user!.id,
        toUserId: transferData.recipientEmail, // In real app, resolve email to user ID
        amount: transferData.amount,
        description: transferData.description || 'Money transfer',
        type: 'transfer'
      });

      if (result.success) {
        setSuccess('Transfer initiated successfully');
        setStep('complete');
        loadTransferData(); // Refresh data
      } else {
        setError(result.error || 'Transfer failed');
      }
    } catch (err) {
      setError('Transfer processing error');
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation step
  const handleConfirm = () => {
    const validationErrors = validateTransfer();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    setStep('confirm');
  };

  // Reset form
  const resetForm = () => {
    setTransferData({
      recipientEmail: '',
      amount: 0,
      description: '',
      paymentMethodId: paymentMethods.find(m => m.isDefault)?.id.toString() || ''
    });
    setStep('form');
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    loadTransferData();
  }, [user?.id]);

  // Form Step
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center justify-center">
              <Send className="w-8 h-8 mr-3" />
              Send Money
            </h1>
            <p className="text-gray-400 mt-2">Transfer funds securely to other users</p>
          </div>

          {/* Balance Display */}
          {walletBalance && (
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium opacity-80">Available Balance</p>
                    <p className="text-2xl font-bold">
                      {showBalance ? `$${walletBalance.available?.toFixed(2) || '0.00'}` : '••••••'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowBalance(!showBalance)}
                      className="bg-black/20 hover:bg-black/30 text-black p-2"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <DollarSign className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfer Form */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Recipient Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={transferData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder="recipient@example.com"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
                    value={transferData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Payment Method
                </label>
                <Select
                  value={transferData.paymentMethodId}
                  onValueChange={(value) => handleInputChange('paymentMethodId', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {method.formatDisplayName()}
                          {method.isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Description (Optional)
                </label>
                <Input
                  value={transferData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="What's this for?"
                  maxLength={100}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-400/50 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  Clear Form
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Review Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          {showRecentTransfers && recentTransfers.length > 0 && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransfers.map((transfer, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                      <div>
                        <p className="text-white font-medium">{transfer.description || 'Transfer'}</p>
                        <p className="text-gray-400 text-sm">
                          To: {transfer.toUserId} • {new Date(transfer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${transfer.amount?.toFixed(2)}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            transfer.status === 'completed' ? 'text-green-400 border-green-400' :
                            transfer.status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                            'text-red-400 border-red-400'
                          }`}
                        >
                          {transfer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirm') {
    const selectedMethod = paymentMethods.find(m => m.id.toString() === transferData.paymentMethodId);
    
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400">Confirm Transfer</h1>
            <p className="text-gray-400 mt-2">Please review your transfer details</p>
          </div>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Recipient</p>
                  <p className="text-white font-medium">{transferData.recipientEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-white font-medium text-xl">${transferData.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payment Method</p>
                  <p className="text-white font-medium">{selectedMethod?.formatDisplayName()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white font-medium">{transferData.description || 'No description'}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-yellow-400">${transferData.amount.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-400/50 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep('form')}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={loading}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Money
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success Step
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-400">Transfer Complete!</h1>
          <p className="text-gray-400 mt-2">Your money has been sent successfully</p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Amount Sent</p>
                <p className="text-3xl font-bold text-white">${transferData.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">To</p>
                <p className="text-white font-medium">{transferData.recipientEmail}</p>
              </div>
              {success && (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-900/20 border border-green-400/50 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{success}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                onClick={resetForm}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              >
                Send Another
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}