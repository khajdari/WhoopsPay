import { useState } from "react";
import { CreditCard, Building2 } from "lucide-react";

interface PaymentCardProps {
  id?: number;
  type: 'card' | 'bank';
  cardNumber?: string;
  cardName?: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  showDelete?: boolean;
  onDelete?: (id: number) => void;
}

export function PaymentCard({ id, type, cardNumber, cardName, bankName, accountNumber, iban, showDelete, onDelete }: PaymentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

    return (
      <div 
        className="relative w-full h-48 cursor-pointer group"
        style={{ perspective: '1000px' }}
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
          {/* Front of card */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${colors} text-white shadow-2xl p-6 flex flex-col justify-between transform ${isHovered ? 'scale-105' : ''} transition-transform duration-300`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {showDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  id && onDelete?.(id);
                }}
                className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <span className="text-white text-sm">×</span>
              </button>
            )}
            
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <CreditCard className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-xs opacity-70 uppercase tracking-wider">Debit Card</div>
              </div>
            </div>

            <div className="flex-1 flex items-center">
              <div className="font-mono text-xl tracking-widest">{maskedNumber}</div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Card Holder</div>
                <div className="text-lg font-semibold uppercase tracking-wide">{cardName || 'John Doe'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Valid Thru</div>
                <div className="text-sm font-mono">12/28</div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${colors} text-white shadow-2xl p-6 flex flex-col justify-between`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="w-full h-12 bg-black mt-4 rounded-sm"></div>
            
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="w-full h-8 bg-white rounded-sm relative">
                <div className="absolute right-2 top-1 text-black text-xs font-mono">CVV: 123</div>
              </div>
              <div className="text-xs opacity-70">
                This card is property of the bank. If found, please return to any branch.
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-xs opacity-70">
                24/7 Customer Service<br/>
                1-800-BANK-123
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bank account book design
  return (
    <div 
      className="relative w-full h-48 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative w-full h-full transition-all duration-500 transform ${isHovered ? 'scale-105 rotate-1' : ''}`}>
        <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 shadow-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-600 to-amber-900 rounded-l-lg"></div>
          
          <div className="absolute inset-2 border border-amber-600/30 rounded-md"></div>
          <div className="absolute inset-4 border border-amber-600/20 rounded-sm"></div>
          
          {showDelete && (
            <button
              onClick={() => id && onDelete?.(id)}
              className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <span className="text-white text-sm">×</span>
            </button>
          )}
          
          <div className="p-6 h-full flex flex-col justify-between text-amber-100">
            <div className="text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-amber-200" />
              <div className="text-lg font-bold text-amber-100 tracking-wide">SAVINGS ACCOUNT</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">{bankName || 'First National Bank'}</div>
            </div>
            
            <div className="bg-amber-800/50 p-4 rounded-md border border-amber-600/30 space-y-3">
              <div>
                <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Account Number</div>
                <div className="font-mono text-lg tracking-wider">{accountNumber ? `•••••${accountNumber.slice(-4)}` : '••••••1234'}</div>
              </div>
              {iban && (
                <div>
                  <div className="text-xs opacity-70 uppercase tracking-wider mb-1">IBAN</div>
                  <div className="font-mono text-sm tracking-wide">{iban.slice(0, 8)}••••••••</div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-xs opacity-60 italic">Est. 1952</div>
              <div className="text-xs opacity-60">Member FDIC</div>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 w-4 h-4 bg-white/10 rounded-bl-lg transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
}