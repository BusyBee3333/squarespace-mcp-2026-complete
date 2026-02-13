/**
 * Commerce Inventory Tools
 * Inventory management and stock tracking
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { InventoryItem, UpdateInventoryRequest } from '../types/index.js';

export function registerInventoryTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_get_inventory',
      description: 'Get inventory information for a specific variant',
      inputSchema: {
        type: 'object',
        properties: {
          variantId: {
            type: 'string',
            description: 'The variant ID',
          },
        },
        required: ['variantId'],
      },
      handler: async (args: { variantId: string }) => {
        const inventory = await client.getInventory(args.variantId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(inventory, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_inventory',
      description: 'Update inventory quantity for a variant',
      inputSchema: {
        type: 'object',
        properties: {
          variantId: {
            type: 'string',
            description: 'The variant ID',
          },
          quantity: {
            type: 'number',
            description: 'New stock quantity',
          },
          unlimited: {
            type: 'boolean',
            description: 'Set to true for unlimited inventory',
          },
        },
        required: ['variantId', 'quantity'],
      },
      handler: async (args: { variantId: string } & UpdateInventoryRequest) => {
        const { variantId, ...updates } = args;
        const inventory = await client.updateInventory(variantId, updates);
        return {
          content: [
            {
              type: 'text',
              text: `Inventory updated for variant ${variantId}\n${JSON.stringify(inventory, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_adjust_inventory',
      description: 'Adjust inventory by a relative amount (positive or negative)',
      inputSchema: {
        type: 'object',
        properties: {
          variantId: {
            type: 'string',
            description: 'The variant ID',
          },
          adjustment: {
            type: 'number',
            description: 'Adjustment amount (e.g., -5 to decrease by 5, +10 to increase by 10)',
          },
        },
        required: ['variantId', 'adjustment'],
      },
      handler: async (args: { variantId: string; adjustment: number }) => {
        const inventory = await client.adjustInventory(args.variantId, args.adjustment);
        return {
          content: [
            {
              type: 'text',
              text: `Inventory adjusted by ${args.adjustment} for variant ${args.variantId}\n${JSON.stringify(inventory, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_check_low_stock',
      description: 'Check for products with low inventory levels',
      inputSchema: {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            description: 'Stock quantity threshold (default: 10)',
            default: 10,
          },
        },
      },
      handler: async (args: { threshold?: number }) => {
        const threshold = args.threshold || 10;
        const products = await client.getProducts();
        const lowStock: Array<{ product: string; variant: string; quantity: number }> = [];

        for (const product of products.result) {
          for (const variant of product.variants) {
            if (variant.stock && !variant.stock.unlimited && variant.stock.quantity <= threshold) {
              lowStock.push({
                product: product.name,
                variant: variant.id,
                quantity: variant.stock.quantity,
              });
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Found ${lowStock.length} variants with stock ≤ ${threshold}\n${JSON.stringify(lowStock, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_out_of_stock',
      description: 'Get all products/variants that are out of stock',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const products = await client.getProducts();
        const outOfStock: Array<{ product: string; variant: string }> = [];

        for (const product of products.result) {
          for (const variant of product.variants) {
            if (variant.stock && !variant.stock.unlimited && variant.stock.quantity === 0) {
              outOfStock.push({
                product: product.name,
                variant: variant.id,
              });
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Found ${outOfStock.length} variants out of stock\n${JSON.stringify(outOfStock, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
