/**
 * Webhooks Tools
 * Webhook subscription management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { WebhookSubscription, CreateWebhookRequest, UpdateWebhookRequest, WebhookTopic } from '../types/index.js';

export function registerWebhooksTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_webhooks',
      description: 'List all webhook subscriptions',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const webhooks = await client.getWebhooks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhooks, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_webhook',
      description: 'Get details of a specific webhook subscription',
      inputSchema: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The webhook ID',
          },
        },
        required: ['webhookId'],
      },
      handler: async (args: { webhookId: string }) => {
        const webhook = await client.getWebhook(args.webhookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhook, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_webhook',
      description: 'Create a new webhook subscription',
      inputSchema: {
        type: 'object',
        properties: {
          endpointUrl: {
            type: 'string',
            description: 'The webhook endpoint URL to receive notifications',
          },
          topics: {
            type: 'array',
            description: 'Event topics to subscribe to',
            items: {
              type: 'string',
              enum: [
                'order.create',
                'order.update',
                'transaction.create',
                'transaction.update',
                'inventory.update',
                'product.create',
                'product.update',
                'product.delete',
              ],
            },
          },
        },
        required: ['endpointUrl', 'topics'],
      },
      handler: async (args: CreateWebhookRequest) => {
        const webhook = await client.createWebhook(args);
        return {
          content: [
            {
              type: 'text',
              text: `Webhook created successfully\n${JSON.stringify(webhook, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_webhook',
      description: 'Update an existing webhook subscription',
      inputSchema: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The webhook ID',
          },
          updates: {
            type: 'object',
            properties: {
              endpointUrl: { type: 'string' },
              topics: {
                type: 'array',
                items: { type: 'string' },
              },
              isEnabled: { type: 'boolean' },
            },
          },
        },
        required: ['webhookId', 'updates'],
      },
      handler: async (args: { webhookId: string; updates: UpdateWebhookRequest }) => {
        const webhook = await client.updateWebhook(args.webhookId, args.updates);
        return {
          content: [
            {
              type: 'text',
              text: `Webhook updated\n${JSON.stringify(webhook, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_delete_webhook',
      description: 'Delete a webhook subscription',
      inputSchema: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The webhook ID',
          },
        },
        required: ['webhookId'],
      },
      handler: async (args: { webhookId: string }) => {
        await client.deleteWebhook(args.webhookId);
        return {
          content: [
            {
              type: 'text',
              text: `Webhook ${args.webhookId} deleted successfully`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_test_webhook',
      description: 'Send a test notification to a webhook',
      inputSchema: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The webhook ID',
          },
          topic: {
            type: 'string',
            description: 'Event topic to test',
            enum: [
              'order.create',
              'order.update',
              'transaction.create',
              'transaction.update',
              'inventory.update',
              'product.create',
              'product.update',
              'product.delete',
            ],
          },
        },
        required: ['webhookId', 'topic'],
      },
      handler: async (args: { webhookId: string; topic: WebhookTopic }) => {
        await client.sendWebhookTest({ webhookId: args.webhookId, topic: args.topic });
        return {
          content: [
            {
              type: 'text',
              text: `Test notification sent for topic: ${args.topic}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_rotate_webhook_secret',
      description: 'Rotate the secret key for a webhook (for security)',
      inputSchema: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The webhook ID',
          },
        },
        required: ['webhookId'],
      },
      handler: async (args: { webhookId: string }) => {
        const webhook = await client.rotateWebhookSecret(args.webhookId);
        return {
          content: [
            {
              type: 'text',
              text: `Webhook secret rotated\n${JSON.stringify(webhook, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
