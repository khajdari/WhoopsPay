import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Building2, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { WalletService, type PaymentMethod } from "../../services/WalletService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onDelete?: (id: number) => void;
  onSetDefault?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function PaymentMethodCard({ 
  method, 
  onDelete, 
  onSetDefault, 
  showActions = true,
  compact = false 
}: PaymentMethodCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await onDelete?.(method.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async () => {
    setActionLoading('default');
    try {
      await onSetDefault?.(method.id);
    } finally {
      setActionLoading(null);
    }
  };

  const getCardIcon = () => {
    if (method.type === 'card') {
      return <CreditCard className="w-6 h-6" />;
    }
    return <Building2 className="w-6 h-6" />;
  };

  const getStatusBadge = () => {
    if (method.isDefault) {
      return (
        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
          <Star className="w-3 h-3 mr-1" />
          Default
        </Badge>
      );
    }

    const expiryStatus = WalletService.getExpiryStatus(method);
    if (expiryStatus === 'expired') {
      return (
        <Badge variant="outline" className="text-red-400 border-red-400/50">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }
    if (expiryStatus === 'expiring') {
      return (
        <Badge variant="outline" className="text-orange-400 border-orange-400/50">
          <Clock className="w-3 h-3 mr-1" />
          Expiring Soon
        </Badge>
      );
    }

    return null;
  };

  const getCardBackground = () => {
    if (method.type === 'card') {
      switch (method.brand?.toLowerCase()) {
        case 'visa':
          return 'bg-gradient-to-r from-blue-600 to-blue-800';
        case 'mastercard':
          return 'bg-gradient-to-r from-red-600 to-red-800';
        case 'amex':
          return 'bg-gradient-to-r from-green-600 to-green-800';
        case 'discover':
          return 'bg-gradient-to-r from-orange-600 to-orange-800';
        default:
          return 'bg-gradient-to-r from-gray-600 to-gray-800';
      }
    }
    return 'bg-gradient-to-r from-purple-600 to-purple-800';
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      method.isDefault ? 'border-yellow-400/50' : 'border-gray-600'
    }`}>
      <div className={`absolute inset-0 opacity-10 ${getCardBackground()}`} />
      
      <CardContent className={`relative ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-800 text-white`}>
              {getCardIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">
                  {WalletService.formatPaymentMethod(method)}
                </span>
                {getStatusBadge()}
              </div>
              
              <div className="text-sm text-gray-400">
                {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                  <span>Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}</span>
                )}
                {method.type === 'bank' && method.bankName && (
                  <span>{method.bankName}</span>
                )}
              </div>
              
              {!compact && method.createdAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Added {new Date(method.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  disabled={!!actionLoading}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                {!method.isDefault && (
                  <DropdownMenuItem
                    onClick={handleSetDefault}
                    disabled={actionLoading === 'default'}
                    className="text-white hover:bg-gray-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete' || method.isDefault}
                  className="text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Card visual representation */}
        {method.type === 'card' && !compact && (
          <div className={`mt-4 p-4 rounded-lg text-white ${getCardBackground()}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs opacity-75">
                {method.brand?.toUpperCase() || 'CARD'}
              </div>
              <div className="w-8 h-5 bg-white/20 rounded"></div>
            </div>
            
            <div className="text-lg font-mono tracking-wider mb-4">
              •••• •••• •••• {method.last4}
            </div>
            
            <div className="flex justify-between text-xs">
              <div>
                <div className="opacity-75">EXPIRES</div>
                <div>{method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}</div>
              </div>
              <div className="text-right">
                <div className="opacity-75">CARDHOLDER</div>
                <div>ACCOUNT HOLDER</div>
              </div>
            </div>
          </div>
        )}

        {/* Bank account visual */}
        {method.type === 'bank' && !compact && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-6 h-6" />
              <div className="text-xs opacity-75">BANK ACCOUNT</div>
            </div>
            
            <div className="text-sm font-medium mb-1">
              {method.bankName || 'Bank Account'}
            </div>
            
            <div className="text-lg font-mono">
              ••••••{method.accountNumber?.slice(-4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}