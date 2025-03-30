export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  type: 'assessment' | 'report' | 'certificate';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  details: PaymentDetails;
}

class PaymentService {
  private readonly storageKey = 'urban_planning_payments';
  private transactions: PaymentResult[] = [];

  constructor() {
    // Load transactions from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.transactions = JSON.parse(stored).map((tx: PaymentResult) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
    }
  }

  private validatePaymentDetails(details: PaymentDetails): string | null {
    if (details.amount <= 0) {
      return 'Invalid payment amount';
    }
    if (!['assessment', 'report', 'certificate'].includes(details.type)) {
      return 'Invalid payment type';
    }
    if (!details.currency || details.currency.length !== 3) {
      return 'Invalid currency code';
    }
    return null;
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Validate payment details
    const validationError = this.validatePaymentDetails(details);
    if (validationError) {
      const result: PaymentResult = {
        success: false,
        error: validationError,
        timestamp: new Date(),
        status: 'failed',
        details
      };
      this.transactions.push(result);
      this.saveToStorage();
      return result;
    }

    // In a real application, this would integrate with a payment processor like Stripe
    // For now, we'll simulate a successful payment with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result: PaymentResult = {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'completed',
      details
    };

    this.transactions.push(result);
    this.saveToStorage();
    return result;
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.find(tx => tx.transactionId === transactionId);
    return transaction?.status === 'completed';
  }

  async getTransactionHistory(): Promise<PaymentResult[]> {
    return this.transactions;
  }

  async getTransaction(transactionId: string): Promise<PaymentResult | undefined> {
    return this.transactions.find(tx => tx.transactionId === transactionId);
  }
}

export const paymentService = new PaymentService(); 