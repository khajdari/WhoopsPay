import { PaymentRequestCard } from "./PaymentRequestCard";

interface PaymentRequest {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  description?: string;
  status: string;
  createdAt: number;
  isExternal?: boolean;
  source?: string;
  orderId?: string;
}

interface PaymentRequestListProps {
  requests: PaymentRequest[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  approvingId?: number | null;
  rejectingId?: number | null;
  showActions?: boolean;
  emptyMessage?: string;
}

export function PaymentRequestList({
  requests,
  onApprove,
  onReject,
  approvingId,
  rejectingId,
  showActions = true,
  emptyMessage = "No payment requests found"
}: PaymentRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <PaymentRequestCard
          key={request.id}
          request={request}
          onApprove={onApprove}
          onReject={onReject}
          isApproving={approvingId === request.id}
          isRejecting={rejectingId === request.id}
          showActions={showActions}
        />
      ))}
    </div>
  );
}