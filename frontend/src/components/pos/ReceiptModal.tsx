// ReceiptModal.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartItem, PaymentMethod, User } from '@/types/pos';
import { CheckCircle, Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  user: User;
  transactionId: string;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  MPESA: 'M-PESA',
  CARD: 'Card',
};

export function ReceiptModal({ open, onClose, items, paymentMethod, user, transactionId }: ReceiptModalProps) {
  const total = items.reduce((acc, item) => acc + item.product.unitPrice * item.quantity, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-success text-success-foreground">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success-foreground/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Sale Complete!</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="text-center border-b border-dashed border-border pb-4">
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-mono font-semibold text-foreground">{transactionId}</p>
            <p className="text-sm text-muted-foreground mt-2">{formatDate(new Date())}</p>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                <span className="font-medium text-foreground">{formatPrice(item.product.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium text-foreground">{paymentMethodLabels[paymentMethod]}</span>
            </div>
            <div className="flex justify-between items-center mt-1 text-sm">
              <span className="text-muted-foreground">Cashier</span>
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 flex gap-3">
          <Button variant="outline" className="flex-1 h-12 gap-2 rounded-xl" onClick={() => window.print()}>
            <Printer className="h-5 w-5" />
            Print Receipt
          </Button>
          <Button className="flex-1 h-12 gap-2 rounded-xl checkout-gradient text-primary-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
