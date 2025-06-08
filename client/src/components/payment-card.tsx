import { useState, ReactNode } from "react";
import { CreditCard, Building2 } from "lucide-react";

/**
 * FlipCard Component - Reusable 3D flip animation container
 * Provides consistent flip behavior for any card content
 */
interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  width?: string;
  height?: string;
  showDelete?: boolean;
  onDelete?: () => void;
}

function FlipCard({ frontContent, backContent, width = '320px', height = '192px', showDelete, onDelete }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center">
      <div 
        className="relative cursor-pointer group"
        style={{ 
          perspective: '1000px',
          width,
          height
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {frontContent}
            {showDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <span className="text-white text-xs">×</span>
              </button>
            )}
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {backContent}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PaymentCard Component - Interactive payment method display
 * 
 * Renders either a credit card with 3D flip animation or a bank cheque design.
 * Features hover effects, brand detection, and optional delete functionality.
 * Maintains consistent 320px x 192px dimensions for all payment types.
 */
interface PaymentCardProps {
  id?: number; // Unique identifier for payment method
  type: 'card' | 'bank'; // Visual style type
  cardNumber?: string; // Credit card number (auto-masked)
  cardName?: string; // Cardholder name
  bankName?: string; // Bank name for accounts
  accountNumber?: string; // Account number (auto-masked)
  iban?: string; // International bank account number
  showDelete?: boolean; // Enable delete functionality
  onDelete?: (id: number) => void; // Delete callback handler
}

/**
 * Main PaymentCard component with interactive features
 * Handles both credit card and bank account display formats
 */
export function PaymentCard({ id, type, cardNumber, cardName, bankName, accountNumber, iban, showDelete, onDelete }: PaymentCardProps) {

  if (type === 'card') {
    const getCardBrand = (number: string) => {
      const firstDigit = number.charAt(0);
      if (firstDigit === '4') return 'Visa';
      if (firstDigit === '5') return 'MasterCard';
      if (firstDigit === '3') return 'American Express';
      return 'Card';
    };

    const getBrandColors = (number: string) => {
      const firstDigit = number.charAt(0);
      if (firstDigit === '4') return 'from-blue-500 via-blue-600 to-blue-800';
      if (firstDigit === '5') return 'from-red-500 via-orange-600 to-yellow-600';
      if (firstDigit === '3') return 'from-green-500 via-emerald-600 to-teal-700';
      return 'from-gray-500 via-gray-600 to-gray-800';
    };

    const brand = getCardBrand(cardNumber || '');
    const colors = getBrandColors(cardNumber || '');
    const maskedNumber = cardNumber ? `•••• •••• •••• ${cardNumber.slice(-4)}` : '•••• •••• •••• ••••';

    const frontContent = (
      <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${colors} text-white shadow-2xl p-4 flex flex-col justify-between`}>
        <div className="flex justify-between items-start">
          <div className="w-8 h-6 bg-yellow-400 rounded flex items-center justify-center">
            <div className="w-6 h-4 bg-yellow-500 rounded-sm"></div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{brand}</div>
            <div className="text-xs opacity-75">DEBIT CARD</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="font-mono text-lg tracking-wider">{maskedNumber}</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75">CARD HOLDER</div>
              <div className="font-semibold text-sm">{cardName || 'CARD HOLDER'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">VALID THRU</div>
              <div className="font-semibold text-sm">12/28</div>
            </div>
          </div>
        </div>
      </div>
    );

    const backContent = (
      <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${colors} text-white shadow-2xl p-4 relative overflow-hidden`}>
        <div className="w-full h-10 bg-black mt-4 mb-6"></div>
        <div className="bg-white h-8 mb-4 relative">
          <div className="absolute right-2 top-1 text-black text-xs font-mono">123</div>
        </div>
        <div className="text-xs opacity-75 mb-2">
          This card is property of the bank. If found, please return to any branch.
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="text-lg font-bold">{brand}</div>
        </div>
      </div>
    );

    return (
      <FlipCard
        frontContent={frontContent}
        backContent={backContent}
        width="286px"
        height="172px"
        showDelete={showDelete}
        onDelete={() => id && onDelete?.(id)}
      />
    );
  }

  // Bank account design with flip animation
  const bankFrontContent = (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg p-4 text-gray-800 relative overflow-hidden">
      {/* Cheque security pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #3b82f6 10px, #3b82f6 11px)`,
             }}>
        </div>
      </div>
      
      {/* Cheque header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            {bankName || 'WELLS FARGO'}
          </div>
          <div className="text-xs text-gray-600">Savings Account</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Account Number</div>
          <div className="font-mono text-xs font-bold text-blue-800">
            {accountNumber ? `•••••${accountNumber.slice(-4)}` : '••••••6789'}
          </div>
        </div>
      </div>
      
      {/* Account holder */}
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-1">Account Holder</div>
        <div className="font-semibold text-xs text-gray-800">John Doe</div>
      </div>
      
      {/* IBAN */}
      <div className="bg-white/50 border border-blue-200 rounded p-2 mb-2">
        <div className="text-xs text-gray-500 mb-1">IBAN</div>
        <div className="font-mono text-xs font-bold text-blue-800">
          {iban ? `${iban.slice(0, 8)}••••••••` : 'GB29NWBK••••••••'}
        </div>
      </div>
      
      {/* Cheque perforations */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-30"></div>
    </div>
  );

  const bankBackContent = (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg p-4 text-gray-800 relative overflow-hidden">
      {/* Security pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 8px, #22c55e 8px, #22c55e 9px)`,
             }}>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs font-bold text-green-800 uppercase tracking-wider">Account Details</div>
          <div className="text-xs text-gray-600">Savings Account Information</div>
        </div>
        <Building2 className="w-6 h-6 text-green-600" />
      </div>
      
      {/* Account Information */}
      <div className="space-y-2">
        <div className="bg-white/60 border border-green-200 rounded p-2">
          <div className="text-xs text-gray-500">Full Account Number</div>
          <div className="font-mono text-xs font-bold text-green-800">
            {accountNumber || '123456789'}
          </div>
        </div>
        
        <div className="bg-white/60 border border-green-200 rounded p-2">
          <div className="text-xs text-gray-500">Sort Code</div>
          <div className="font-mono text-xs font-bold text-green-800">20-00-00</div>
        </div>
        
        <div className="bg-white/60 border border-green-200 rounded p-2">
          <div className="text-xs text-gray-500">Interest Rate</div>
          <div className="text-xs font-semibold text-green-800">2.5% APY | FDIC Insured</div>
        </div>
      </div>
    </div>
  );

  return (
    <FlipCard
      frontContent={bankFrontContent}
      backContent={bankBackContent}
      width="286px"
      height="172px"
      showDelete={showDelete}
      onDelete={() => id && onDelete?.(id)}
    />
  );
}