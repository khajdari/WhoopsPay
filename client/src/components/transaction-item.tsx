
/**
 * Transaction Item Component - Individual transaction display unit
 * 
 * Renders individual transaction entries with comprehensive information:
 * - Transaction direction indicators (incoming/outgoing)
 * - Amount formatting with proper currency display
 * - Contact name resolution and display
 * - Transaction category icons and visual cues
 * - Status badges and timestamp information
 * 
 * Educational Security Features:
 * - Demonstrates client-side data exposure patterns
 * - Shows transaction information handling
 * - Includes user identification logic
 * 
 * VULNERABILITY NOTE: User information may be exposed through
 * client-side logic for educational security training purposes.
 */
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, University, Play, Music, Car, Coffee, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * TransactionItemProps Interface - Component properties
 * 
 * @property transaction - Transaction data object with all necessary information
 */
interface TransactionItemProps {
  transaction: {
    id: number;
    fromUserId: string;
    toUserId: string;
    amount: string;
    description: string;
    status: string;
    createdAt: string;
  };
}

/**
 * TransactionItem Component - Individual transaction display
 * 
 * Component that renders individual transaction entries with proper
 * formatting and visual indicators. Features include:
 * - Transaction direction detection and display
 * - Amount formatting with currency symbols
 * - Contact name resolution and masking
 * - Category-based icon selection
 * - Status and timestamp display
 */
export function TransactionItem({ transaction }: TransactionItemProps) {
  const { user } = useAuth();
  
  const isOutgoing = transaction.fromUserId === user?.id;
  const amount = parseFloat(transaction.amount);
  const formattedAmount = `${isOutgoing ? '-' : '+'}¤${Math.abs(amount).toFixed(2)}`;
  
  const getTransactionIcon = () => {
    if (transaction.description?.toLowerCase().includes('amazon') || 
        transaction.description?.toLowerCase().includes('purchase')) {
      return <ShoppingCart className="w-4 h-4" />;
    }
    if (transaction.description?.toLowerCase().includes('bank') ||
        transaction.description?.toLowerCase().includes('transfer')) {
      return <University className="w-4 h-4" />;
    }
    return isOutgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />;
  };

  const getContactName = () => {
    // VULNERABLE: This could expose user information through client-side logic
    if (transaction.description?.includes('Amazon')) return 'Amazon.com';
    if (transaction.description?.includes('Bank')) return 'Bank Transfer';
    return isOutgoing ? `User ${transaction.toUserId}` : `User ${transaction.fromUserId}`;
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {transaction.description?.toLowerCase().includes('amazon') ? (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
              </div>
            ) : transaction.description?.toLowerCase().includes('netflix') ? (
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-red-600" />
              </div>
            ) : transaction.description?.toLowerCase().includes('spotify') ? (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-green-600" />
              </div>
            ) : transaction.description?.toLowerCase().includes('uber') ? (
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
            ) : transaction.description?.toLowerCase().includes('starbucks') ? (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Coffee className="w-5 h-5 text-green-700" />
              </div>
            ) : transaction.description?.toLowerCase().includes('apple') ? (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gray-800" />
              </div>
            ) : transaction.description?.toLowerCase().includes('bank') ? (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <University className="w-5 h-5 text-gray-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {getContactName().substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">
              {getContactName()}
            </p>
            {/* VULNERABLE: Rendering user input without sanitization (XSS potential) */}
            <p className="text-sm text-gray-500">
              {transaction.description || 'No description'}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${
            isOutgoing ? 'text-red-600' : 'text-green-600'
          }`}>
            {formattedAmount}
          </p>
          <Badge 
            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {transaction.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}
