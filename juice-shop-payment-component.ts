// File: frontend/src/app/payment/payment.component.ts
// Add this to your existing Juice Shop payment component

import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../Services/configuration.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  public paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: 'credit_card' },
    { id: 'paypwned', name: 'PayPwned', icon: 'security', description: 'Secure External Payment' }
  ];
  
  public selectedPaymentMethod = 'card';
  public isProcessing = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PaymentComponent>,
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {}

  async processPayment() {
    this.isProcessing = true;
    
    try {
      if (this.selectedPaymentMethod === 'paypwned') {
        await this.processPayPwnedPayment();
      } else {
        await this.processStandardPayment();
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      this.isProcessing = false;
    }
  }

  private async processPayPwnedPayment() {
    const basket = this.dialogData.basket;
    const totalPrice = basket.Products.reduce((total: number, product: any) => 
      total + (product.price * product.quantity), 0);

    const paymentRequest = {
      amount: totalPrice,
      orderId: `juice-shop-${Date.now()}`,
      source: 'juice-shop',
      returnUrl: `${window.location.origin}/basket/order-completion`,
      cancelUrl: `${window.location.origin}/basket`,
      description: 'OWASP Juice Shop Purchase',
      metadata: {
        items: basket.Products.map((p: any) => p.name),
        basketId: basket.id,
        customer: this.dialogData.email || 'anonymous'
      }
    };

    // Get PayPwned URL from configuration
    const config = await this.configurationService.getApplicationConfiguration().toPromise();
    const paypwnedUrl = config.application.paypwnedUrl || 'https://paypwned.replit.app';

    const response = await this.http.post(
      `${paypwnedUrl}/api/external/payment/initiate`,
      paymentRequest
    ).toPromise() as any;

    if (response.success) {
      // Store transaction ID for verification
      localStorage.setItem('paypwned_transaction_id', response.transactionId);
      localStorage.setItem('juice_shop_basket_id', basket.id);
      
      // Redirect to PayPwned
      window.location.href = response.paymentUrl;
    } else {
      throw new Error('PayPwned payment initiation failed');
    }
  }

  private async processStandardPayment() {
    // Existing credit card payment logic
    this.dialogRef.close({ success: true, method: 'card' });
  }
}