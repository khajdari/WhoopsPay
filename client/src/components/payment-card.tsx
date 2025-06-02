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
  if (type === 'card') {
    // Determine card brand based on first digit
    const getCardBrand = (number: string) => {
      const firstDigit = number.charAt(0);
      if (firstDigit === '4') return 'Visa';
      if (firstDigit === '5') return 'MasterCard';
      if (firstDigit === '3') return 'American Express';
      return 'Card';
    };

    // Get brand colors - using more professional/banking colors
    const getBrandColors = (number: string) => {
      const firstDigit = number.charAt(0);
      if (firstDigit === '4') return 'from-blue-600 to-blue-800'; // Visa blue
      if (firstDigit === '5') return 'from-slate-700 to-slate-900'; // Mastercard dark
      if (firstDigit === '3') return 'from-green-600 to-teal-700'; // Amex green
      return 'from-gray-600 to-gray-800'; // Default
    };

    const brand = getCardBrand(cardNumber || '');
    const colors = getBrandColors(cardNumber || '');
    const maskedNumber = cardNumber ? `••••${cardNumber.slice(-4)}` : '••••';

    return (
      <div className={`relative p-4 rounded-xl bg-gradient-to-br ${colors} text-white shadow-lg min-h-[120px] flex flex-col justify-between group`}>
        {showDelete && (
          <button
            onClick={() => id && onDelete?.(id)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <span className="text-white text-xs">×</span>
          </button>
        )}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm opacity-90">Debit Card</div>
            <div className="text-lg font-medium">{cardName || 'Mairy Doe'}</div>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-6 h-4 bg-white/40 rounded-sm"></div>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-lg font-mono tracking-wider">{maskedNumber}</div>
          <div className="text-xs opacity-75">
            {brand === 'Visa' && 'VISA'}
            {brand === 'MasterCard' && 'MASTERCARD'}
            {brand === 'American Express' && 'AMEX'}
          </div>
        </div>
      </div>
    );
  }

  // Bank account card
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg min-h-[120px] flex flex-col justify-between group">
      {showDelete && (
        <button
          onClick={() => id && onDelete?.(id)}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <span className="text-white text-xs">×</span>
        </button>
      )}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm opacity-90">Bank Account</div>
          <div className="text-lg font-medium font-mono tracking-wider">
            {iban ? `••••${iban.slice(-4)}` : '••••0000'}
          </div>
        </div>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <div className="w-5 h-3 bg-white/60 rounded-sm"></div>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-lg font-mono tracking-wider">
          ••••{accountNumber ? accountNumber.slice(-4) : '0000'}
        </div>
        <div className="text-xs opacity-75 uppercase">
          {bankName || 'CHECKING'}
        </div>
      </div>
    </div>
  );
}