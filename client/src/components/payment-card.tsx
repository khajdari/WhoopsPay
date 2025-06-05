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
      <div className="flex justify-center">
        <div 
          className="relative w-96 h-56 cursor-pointer group"
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
                <div className="text-right">
                  <div className="text-lg font-bold tracking-wide">{brand}</div>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="font-mono text-2xl tracking-widest text-center">{maskedNumber}</div>
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
                <div className="text-xs opacity-70 text-center">
                  This card is property of the bank. If found, please return to any branch.
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-xs opacity-70">
                  24/7 Customer Service<br/>
                  1-800-BANK-123
                </div>
                <div className="text-xs opacity-70 text-right">
                  Member FDIC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bank savings account design - redesigned to be symmetric and proper
  return (
    <div className="flex justify-center">
      <div 
        className="relative w-96 h-56 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform ${isHovered ? 'scale-105' : ''}`}>
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl border border-emerald-500/30">
            {/* Bank passbook binding */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-b from-emerald-500 to-emerald-800 rounded-l-2xl border-r border-emerald-400/30"></div>
            
            {/* Inner decorative borders */}
            <div className="absolute inset-3 border border-emerald-400/20 rounded-xl"></div>
            <div className="absolute inset-6 border border-emerald-400/10 rounded-lg"></div>
            
            {showDelete && (
              <button
                onClick={() => id && onDelete?.(id)}
                className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <span className="text-white text-sm">×</span>
              </button>
            )}
            
            <div className="p-8 h-full flex flex-col justify-between text-emerald-50">
              {/* Header */}
              <div className="text-center">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-emerald-200" />
                <div className="text-xl font-bold text-emerald-100 tracking-wide">SAVINGS ACCOUNT</div>
                <div className="text-sm opacity-90 uppercase tracking-wider font-medium">{bankName || 'First National Bank'}</div>
              </div>
              
              {/* Account details */}
              <div className="bg-emerald-700/40 p-5 rounded-xl border border-emerald-400/20 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-xs opacity-80 uppercase tracking-wider mb-2">Account Number</div>
                    <div className="font-mono text-2xl tracking-wider font-semibold">
                      {accountNumber ? `•••••${accountNumber.slice(-4)}` : '••••••1234'}
                    </div>
                  </div>
                  {iban && (
                    <div className="text-center border-t border-emerald-400/20 pt-3">
                      <div className="text-xs opacity-80 uppercase tracking-wider mb-2">IBAN</div>
                      <div className="font-mono text-sm tracking-wide opacity-90">
                        {iban.slice(0, 8)}••••••••
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center space-y-1">
                <div className="text-xs opacity-70 font-medium">Established 1952</div>
                <div className="text-xs opacity-70">Member FDIC • Equal Housing Lender</div>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full opacity-60"></div>
                  <div className="text-xs opacity-60 font-mono">Secured by 256-bit SSL</div>
                  <div className="w-2 h-2 bg-emerald-300 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative corner element */}
            <div className="absolute top-3 right-3 w-6 h-6 border-2 border-emerald-300/30 rounded-full"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border border-emerald-300/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}