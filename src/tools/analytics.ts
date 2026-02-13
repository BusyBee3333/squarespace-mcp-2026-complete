/**
 * Analytics Tools
 * Revenue, sales, and performance analytics
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { AnalyticsParams } from '../types/index.js';

export function registerAnalyticsTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_get_revenue_metrics',
      description: 'Get revenue metrics for a date range (total revenue, order count, average order value)',
      inputSchema: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date (ISO 8601 format)',
          },
          endDate: {
            type: 'string',
            description: 'End date (ISO 8601 format)',
          },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: AnalyticsParams) => {
        const metrics = await client.getRevenueMetrics(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metrics, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_top_products',
      description: 'Get top-selling products by revenue for a date range',
      inputSchema: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date (ISO 8601 format)',
          },
          endDate: {
            type: 'string',
            description: 'End date (ISO 8601 format)',
          },
          limit: {
            type: 'number',
            description: 'Number of top products to return (default: 10)',
            default: 10,
          },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: AnalyticsParams & { limit?: number }) => {
        const { limit, ...params } = args;
        const products = await client.getTopProducts(params, limit || 10);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_sales_by_day',
      description: 'Get daily sales breakdown for a date range',
      inputSchema: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date (ISO 8601 format)',
          },
          endDate: {
            type: 'string',
            description: 'End date (ISO 8601 format)',
          },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: AnalyticsParams) => {
        const orders = await client.getOrders({
          modifiedAfter: args.startDate,
          modifiedBefore: args.endDate,
        });

        // Group by day
        const salesByDay = new Map<string, { revenue: number; orders: number; currency: string }>();

        orders.result.forEach(order => {
          const day = order.createdOn.split('T')[0]; // Get YYYY-MM-DD
          const existing = salesByDay.get(day) || { revenue: 0, orders: 0, currency: order.grandTotal.currency };
          existing.revenue += parseFloat(order.grandTotal.value);
          existing.orders += 1;
          salesByDay.set(day, existing);
        });

        const result = Array.from(salesByDay.entries())
          .map(([date, stats]) => ({
            date,
            revenue: { value: stats.revenue.toFixed(2), currency: stats.currency },
            orderCount: stats.orders,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_monthly_revenue',
      description: 'Get revenue summary for the current month',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const metrics = await client.getRevenueMetrics({ startDate, endDate });
        return {
          content: [
            {
              type: 'text',
              text: `Monthly Revenue (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})\n${JSON.stringify(metrics, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_yearly_revenue',
      description: 'Get revenue summary for the current year',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();

        const metrics = await client.getRevenueMetrics({ startDate, endDate });
        return {
          content: [
            {
              type: 'text',
              text: `Yearly Revenue (${now.getFullYear()})\n${JSON.stringify(metrics, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
