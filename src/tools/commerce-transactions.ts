/**
 * Commerce Transactions Tools
 * Transaction and refund management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Transaction, CreateRefundRequest } from '../types/index.js';

export function registerTransactionsTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_get_order_transactions',
      description: 'Get all financial transactions for a specific order',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID',
          },
        },
        required: ['orderId'],
      },
      handler: async (args: { orderId: string }) => {
        const transactions = await client.getTransactions(args.orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(transactions, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_refund',
      description: 'Process a refund for an order',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID',
          },
          amount: {
            type: 'object',
            description: 'Refund amount',
            properties: {
              value: { type: 'string', description: 'Amount as string (e.g., "49.99")' },
              currency: { type: 'string', description: 'Currency code (e.g., "USD")' },
            },
            required: ['value', 'currency'],
          },
          reason: {
            type: 'string',
            description: 'Reason for refund',
          },
        },
        required: ['orderId', 'amount'],
      },
      handler: async (args: { orderId: string } & CreateRefundRequest) => {
        const { orderId, ...refund } = args;
        const transaction = await client.createRefund(orderId, refund);
        return {
          content: [
            {
              type: 'text',
              text: `Refund created for order ${orderId}\n${JSON.stringify(transaction, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_transaction_summary',
      description: 'Get summary of all transactions for an order (total paid, refunded, net)',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID',
          },
        },
        required: ['orderId'],
      },
      handler: async (args: { orderId: string }) => {
        const transactions = await client.getTransactions(args.orderId);
        
        let totalPaid = 0;
        let totalRefunded = 0;
        const currency = transactions[0]?.amount.currency || 'USD';

        transactions.forEach(txn => {
          const amount = parseFloat(txn.amount.value);
          if (txn.type === 'CAPTURE') {
            totalPaid += amount;
          } else if (txn.type === 'REFUND') {
            totalRefunded += amount;
          }
        });

        const summary = {
          totalPaid: { value: totalPaid.toFixed(2), currency },
          totalRefunded: { value: totalRefunded.toFixed(2), currency },
          netAmount: { value: (totalPaid - totalRefunded).toFixed(2), currency },
          transactionCount: transactions.length,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      },
    },
  ];
}
