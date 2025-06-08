import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Trash2, MoreHorizontal } from "lucide-react";
import { TransactionService } from "../../services/TransactionService";

interface Transaction {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  status: string;
  description?: string;
  createdAt: number;
  isExternal?: boolean;
  source?: string;
  type?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  currentUserId: string;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TransactionCard({ 
  transaction, 
  currentUserId, 
  onDelete, 
  showActions = false,
  compact = false 
}: TransactionCardProps) {
  const direction = TransactionService.getTransactionDirection(transaction, currentUserId);
  const otherParty = TransactionService.getOtherParty(transaction, currentUserId);
  const isExternal = TransactionService.isExternal(transaction);
  const amount = TransactionService.formatAmount(transaction.amount, transaction.currency);
  const status = TransactionService.formatStatus(transaction.status);
  const statusColor = TransactionService.getStatusColor(transaction.status);
  const formattedDate = TransactionService.formatDate(transaction.createdAt);

  const getDirectionIcon = () => {
    if (direction === 'sent') {
      return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    }
    return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
  };

  const getDirectionColor = () => {
    return direction === 'sent' ? 'text-red-400' : 'text-green-400';
  };

  const getAmountPrefix = () => {
    return direction === 'sent' ? '-' : '+';
  };

  return (
    <Card className={`bg-gray-900 border transition-colors ${
      isExternal ? 'border-blue-400/50 bg-blue-950/20' : 'border-yellow-400/30'
    } ${compact ? 'p-3' : 'p-4'}`}>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              direction === 'sent' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {isExternal ? (
                <ExternalLink className="w-5 h-5 text-blue-600" />
              ) : (
                getDirectionIcon()
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium ${getDirectionColor()}`}>
                  {getAmountPrefix()}{amount}
                </span>
                
                {isExternal && (
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {transaction.source || 'External'}
                  </Badge>
                )}
                
                <Badge variant="outline" className={`${statusColor} border-current`}>
                  {status}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-400">
                {direction === 'sent' ? 'To: ' : 'From: '}{otherParty}
              </div>
              
              {transaction.description && !compact && (
                <div className="text-sm text-gray-300 mt-1">
                  {transaction.description}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {formattedDate}
                {transaction.type && (
                  <span className="ml-2">• {TransactionService.formatTransactionType(transaction)}</span>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              
              {onDelete && transaction.status === 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}