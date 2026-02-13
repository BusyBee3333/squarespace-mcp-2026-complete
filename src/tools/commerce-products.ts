/**
 * Commerce Products Tools
 * Full CRUD operations for Squarespace products
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/index.js';

export function registerProductsTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_products',
      description: 'List all products with pagination support',
      inputSchema: {
        type: 'object',
        properties: {
          cursor: {
            type: 'string',
            description: 'Pagination cursor for next page',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
          },
        },
      },
      handler: async (args: { cursor?: string; limit?: number }) => {
        const products = await client.getProducts(args);
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
      name: 'squarespace_get_product',
      description: 'Get detailed information about a specific product including variants, images, and pricing',
      inputSchema: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The product ID',
          },
        },
        required: ['productId'],
      },
      handler: async (args: { productId: string }) => {
        const product = await client.getProduct(args.productId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_product',
      description: 'Create a new product with variants',
      inputSchema: {
        type: 'object',
        properties: {
          product: {
            type: 'object',
            description: 'Product details',
            properties: {
              type: {
                type: 'string',
                enum: ['PHYSICAL', 'SERVICE', 'GIFT_CARD', 'DIGITAL'],
                description: 'Product type',
              },
              storePageId: {
                type: 'string',
                description: 'ID of the store page to add product to',
              },
              name: {
                type: 'string',
                description: 'Product name',
              },
              description: {
                type: 'string',
                description: 'Product description (HTML supported)',
              },
              urlSlug: {
                type: 'string',
                description: 'URL slug (auto-generated if not provided)',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Product tags',
              },
              isVisible: {
                type: 'boolean',
                description: 'Whether product is visible in store',
                default: true,
              },
              variants: {
                type: 'array',
                description: 'Product variants (at least one required)',
                items: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string' },
                    pricing: {
                      type: 'object',
                      properties: {
                        basePrice: {
                          type: 'object',
                          properties: {
                            value: { type: 'string' },
                            currency: { type: 'string' },
                          },
                        },
                        salePrice: {
                          type: 'object',
                          properties: {
                            value: { type: 'string' },
                            currency: { type: 'string' },
                          },
                        },
                      },
                    },
                    stock: {
                      type: 'object',
                      properties: {
                        quantity: { type: 'number' },
                        unlimited: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
            required: ['type', 'storePageId', 'name', 'variants'],
          },
        },
        required: ['product'],
      },
      handler: async (args: { product: CreateProductRequest }) => {
        const product = await client.createProduct(args.product);
        return {
          content: [
            {
              type: 'text',
              text: `Product created successfully: ${product.name}\n${JSON.stringify(product, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_product',
      description: 'Update an existing product',
      inputSchema: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The product ID to update',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              urlSlug: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              isVisible: { type: 'boolean' },
              seoOptions: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  keywords: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        required: ['productId', 'updates'],
      },
      handler: async (args: { productId: string; updates: UpdateProductRequest }) => {
        const product = await client.updateProduct(args.productId, args.updates);
        return {
          content: [
            {
              type: 'text',
              text: `Product updated: ${product.name}\n${JSON.stringify(product, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_delete_product',
      description: 'Delete a product permanently',
      inputSchema: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The product ID to delete',
          },
        },
        required: ['productId'],
      },
      handler: async (args: { productId: string }) => {
        await client.deleteProduct(args.productId);
        return {
          content: [
            {
              type: 'text',
              text: `Product ${args.productId} deleted successfully`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_product_variant',
      description: 'Add a new variant to an existing product',
      inputSchema: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The product ID',
          },
          variant: {
            type: 'object',
            description: 'Variant details',
            properties: {
              sku: { type: 'string' },
              pricing: {
                type: 'object',
                properties: {
                  basePrice: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                      currency: { type: 'string' },
                    },
                  },
                },
              },
              stock: {
                type: 'object',
                properties: {
                  quantity: { type: 'number' },
                  unlimited: { type: 'boolean' },
                },
              },
              attributes: {
                type: 'object',
                description: 'Variant attributes (e.g., {"Size": "Large", "Color": "Red"})',
              },
            },
          },
        },
        required: ['productId', 'variant'],
      },
      handler: async (args: { productId: string; variant: any }) => {
        const variant = await client.createProductVariant(args.productId, args.variant);
        return {
          content: [
            {
              type: 'text',
              text: `Variant created for product ${args.productId}\n${JSON.stringify(variant, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_product_variant',
      description: 'Update a product variant (pricing, stock, attributes)',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          variantId: { type: 'string' },
          updates: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              pricing: { type: 'object' },
              stock: { type: 'object' },
              attributes: { type: 'object' },
            },
          },
        },
        required: ['productId', 'variantId', 'updates'],
      },
      handler: async (args: { productId: string; variantId: string; updates: any }) => {
        const variant = await client.updateProductVariant(
          args.productId,
          args.variantId,
          args.updates
        );
        return {
          content: [
            {
              type: 'text',
              text: `Variant ${args.variantId} updated\n${JSON.stringify(variant, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_delete_product_variant',
      description: 'Delete a product variant',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          variantId: { type: 'string' },
        },
        required: ['productId', 'variantId'],
      },
      handler: async (args: { productId: string; variantId: string }) => {
        await client.deleteProductVariant(args.productId, args.variantId);
        return {
          content: [
            {
              type: 'text',
              text: `Variant ${args.variantId} deleted from product ${args.productId}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_search_products_by_name',
      description: 'Search products by name (case-insensitive)',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
        },
        required: ['query'],
      },
      handler: async (args: { query: string }) => {
        const products = await client.getProducts();
        const filtered = products.result.filter(product =>
          product.name.toLowerCase().includes(args.query.toLowerCase())
        );
        return {
          content: [
            {
              type: 'text',
              text: `Found ${filtered.length} products matching "${args.query}"\n${JSON.stringify(filtered, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_products_by_tag',
      description: 'Get all products with a specific tag',
      inputSchema: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'Tag to filter by',
          },
        },
        required: ['tag'],
      },
      handler: async (args: { tag: string }) => {
        const products = await client.getProducts();
        const filtered = products.result.filter(
          product => product.tags && product.tags.includes(args.tag)
        );
        return {
          content: [
            {
              type: 'text',
              text: `Found ${filtered.length} products with tag "${args.tag}"\n${JSON.stringify(filtered, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
