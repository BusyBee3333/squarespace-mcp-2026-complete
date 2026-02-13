/**
 * Commerce Orders Tools
 * Full CRUD operations for Squarespace orders
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Order, CreateOrderRequest, FulfillOrderRequest, OrdersQueryParams } from '../types/index.js';

export function registerOrdersTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_orders',
      description: 'List all orders with optional filtering by date range, fulfillment status, and pagination',
      inputSchema: {
        type: 'object',
        properties: {
          modifiedAfter: {
            type: 'string',
            description: 'ISO 8601 date to filter orders modified after this date',
          },
          modifiedBefore: {
            type: 'string',
            description: 'ISO 8601 date to filter orders modified before this date',
          },
          fulfillmentStatus: {
            type: 'string',
            enum: ['PENDING', 'FULFILLED', 'PARTIALLY_FULFILLED', 'CANCELED'],
            description: 'Filter by fulfillment status',
          },
          cursor: {
            type: 'string',
            description: 'Pagination cursor for next page',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
          },
        },
      },
      handler: async (args: OrdersQueryParams) => {
        const orders = await client.getOrders(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_order',
      description: 'Get detailed information about a specific order including line items, fulfillment, and transactions',
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
        const order = await client.getOrder(args.orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(order, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_order',
      description: 'Create a new order (useful for importing orders from external sources)',
      inputSchema: {
        type: 'object',
        properties: {
          order: {
            type: 'object',
            description: 'Complete order object with channel, customer, line items, and totals',
            properties: {
              channel: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['ONLINE', 'IN_PERSON', 'DONATION'] },
                  subtype: { type: 'string' },
                },
                required: ['type'],
              },
              customerEmail: { type: 'string' },
              billingAddress: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  address1: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  countryCode: { type: 'string' },
                  postalCode: { type: 'string' },
                },
              },
              lineItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    variantId: { type: 'string' },
                    quantity: { type: 'number' },
                    unitPricePaid: {
                      type: 'object',
                      properties: {
                        value: { type: 'string' },
                        currency: { type: 'string' },
                      },
                    },
                  },
                },
              },
              subtotal: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  currency: { type: 'string' },
                },
              },
              grandTotal: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  currency: { type: 'string' },
                },
              },
            },
            required: ['channel', 'customerEmail', 'billingAddress', 'lineItems', 'subtotal', 'grandTotal'],
          },
        },
        required: ['order'],
      },
      handler: async (args: { order: CreateOrderRequest }) => {
        const order = await client.createOrder(args.order);
        return {
          content: [
            {
              type: 'text',
              text: `Order created successfully: ${order.orderNumber}\n${JSON.stringify(order, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_fulfill_order',
      description: 'Mark an order or specific line items as fulfilled with optional shipping details',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID to fulfill',
          },
          shouldSendNotification: {
            type: 'boolean',
            description: 'Whether to send fulfillment notification to customer',
            default: true,
          },
          lineItems: {
            type: 'array',
            description: 'Specific line items to fulfill (omit to fulfill all)',
            items: {
              type: 'object',
              properties: {
                lineItemId: { type: 'string' },
                quantity: { type: 'number' },
              },
            },
          },
          shipments: {
            type: 'array',
            description: 'Shipping details for the fulfillment',
            items: {
              type: 'object',
              properties: {
                carrierName: { type: 'string' },
                trackingNumber: { type: 'string' },
                trackingUrl: { type: 'string' },
                service: { type: 'string' },
                shipDate: { type: 'string' },
              },
            },
          },
        },
        required: ['orderId'],
      },
      handler: async (args: { orderId: string } & FulfillOrderRequest) => {
        const { orderId, ...fulfillment } = args;
        const order = await client.fulfillOrder(orderId, fulfillment);
        return {
          content: [
            {
              type: 'text',
              text: `Order ${order.orderNumber} fulfilled successfully\n${JSON.stringify(order, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_add_order_note',
      description: 'Add an internal note to an order (visible only to store administrators)',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID',
          },
          note: {
            type: 'string',
            description: 'The note text to add',
          },
        },
        required: ['orderId', 'note'],
      },
      handler: async (args: { orderId: string; note: string }) => {
        const order = await client.addOrderNote(args.orderId, args.note);
        return {
          content: [
            {
              type: 'text',
              text: `Note added to order ${order.orderNumber}\n${JSON.stringify(order.internalNotes, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_search_orders_by_email',
      description: 'Search for orders by customer email address',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Customer email to search for',
          },
        },
        required: ['email'],
      },
      handler: async (args: { email: string }) => {
        const orders = await client.getOrders();
        const filtered = orders.result.filter(
          order => order.customerEmail.toLowerCase() === args.email.toLowerCase()
        );
        return {
          content: [
            {
              type: 'text',
              text: `Found ${filtered.length} orders for ${args.email}\n${JSON.stringify(filtered, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_recent_orders',
      description: 'Get the most recent orders (last 7 days by default)',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to look back (default: 7)',
            default: 7,
          },
        },
      },
      handler: async (args: { days?: number }) => {
        const days = args.days || 7;
        const modifiedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const orders = await client.getOrders({ modifiedAfter });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${orders.result.length} orders in the last ${days} days\n${JSON.stringify(orders, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_pending_orders',
      description: 'Get all orders with pending fulfillment status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const orders = await client.getOrders({ fulfillmentStatus: 'PENDING' });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${orders.result.length} pending orders\n${JSON.stringify(orders, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
