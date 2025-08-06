import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useI18n } from '@/lib/i18n';

interface TransactionItemProps {
  transaction: any;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const { t } = useI18n();
  const isReceived = transaction.toUserId && transaction.toUserId.startsWith('@');
  const isONUS = transaction.transactionCategory === 'ONUS';
  const isOFFUS = transaction.transactionCategory === 'OFFUS';
  
  const getTransactionIcon = () => {
    if (isOFFUS) {
      return <ExternalLink className="w-5 h-5 text-orange-600" />;
    }
    if (isReceived) {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-600" />;
  };

  const getTransactionColor = () => {
    if (isOFFUS) return "text-orange-600";
    if (isReceived) return "text-green-600";
    return "text-red-600";
  };

  const getStatusBadge = () => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      external_pending: "bg-blue-100 text-blue-800"
    };
    
    const getStatusText = () => {
      switch(transaction.status) {
        case 'completed':
          return t('completed');
        case 'pending':
          return t('pending');
        case 'rejected':
          return t('rejected');
        default:
          return transaction.status?.toUpperCase() || '';
      }
    };
    
    return (
      <Badge className={`${statusColors[transaction.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"} text-xs`}>
        {getStatusText()}
      </Badge>
    );
  };

  const getCategoryBadge = () => {
    if (isONUS) {
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
          <Users className="w-3 h-3" />
          {t('onus')}
        </Badge>
      );
    }
    if (isOFFUS) {
      return (
        <Badge className="bg-orange-100 text-orange-800 text-xs flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          {t('offus')}
        </Badge>
      );
    }
    return null;
  };

  const getDisplayName = () => {
    if (isOFFUS) {
      if (transaction.externalSource === 'juice-shop') {
        return 'Juice Shop';
      }
      return transaction.externalMerchantId || 'External Merchant';
    }
    return isReceived ? transaction.fromUserId : transaction.toUserId;
  };

  const getNetworkInfo = () => {
    if (isOFFUS && transaction.networkCode) {
      return (
        <div className="text-xs text-gray-500 mt-1">
          Network: {transaction.networkCode}
          {transaction.routingNumber && ` • ${transaction.routingNumber}`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getTransactionIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getDisplayName()}
              </p>
              {getCategoryBadge()}
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {transaction.description}
            </p>
            {isOFFUS && transaction.externalOrderId && (
              <p className="text-xs text-gray-400 mt-1">
                Order ID: {transaction.externalOrderId}
              </p>
            )}
            {getNetworkInfo()}
            <p className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <p className={`text-sm font-semibold ${getTransactionColor()}`}>
            {isReceived ? '+ ' : '- '}¤{transaction.amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}