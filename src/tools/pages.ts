/**
 * Pages Tools
 * Website page and collection management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Page, Collection, CreatePageRequest, UpdatePageRequest } from '../types/index.js';

export function registerPagesTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_get_website',
      description: 'Get website information (domain, title, timezone, etc.)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const website = await client.getWebsite();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(website, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_collections',
      description: 'List all collections (page groups) in the website',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const collections = await client.getCollections();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(collections, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_collection',
      description: 'Get details of a specific collection',
      inputSchema: {
        type: 'object',
        properties: {
          collectionId: {
            type: 'string',
            description: 'The collection ID',
          },
        },
        required: ['collectionId'],
      },
      handler: async (args: { collectionId: string }) => {
        const collection = await client.getCollection(args.collectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(collection, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_pages',
      description: 'List all pages, optionally filtered by collection',
      inputSchema: {
        type: 'object',
        properties: {
          collectionId: {
            type: 'string',
            description: 'Filter pages by collection ID (optional)',
          },
        },
      },
      handler: async (args: { collectionId?: string }) => {
        const pages = await client.getPages(args.collectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pages, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_page',
      description: 'Get detailed information about a specific page',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The page ID',
          },
        },
        required: ['pageId'],
      },
      handler: async (args: { pageId: string }) => {
        const page = await client.getPage(args.pageId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(page, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_page',
      description: 'Create a new page in a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collectionId: {
            type: 'string',
            description: 'Collection ID to add the page to',
          },
          title: {
            type: 'string',
            description: 'Page title',
          },
          urlSlug: {
            type: 'string',
            description: 'URL slug (auto-generated if not provided)',
          },
          description: {
            type: 'string',
            description: 'Page description',
          },
          body: {
            type: 'string',
            description: 'Page content (HTML supported)',
          },
          isPublished: {
            type: 'boolean',
            description: 'Publish immediately (default: false)',
            default: false,
          },
        },
        required: ['collectionId', 'title'],
      },
      handler: async (args: CreatePageRequest) => {
        const page = await client.createPage(args);
        return {
          content: [
            {
              type: 'text',
              text: `Page created: ${page.title}\n${JSON.stringify(page, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_page',
      description: 'Update an existing page',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The page ID',
          },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              urlSlug: { type: 'string' },
              description: { type: 'string' },
              body: { type: 'string' },
              isPublished: { type: 'boolean' },
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
        required: ['pageId', 'updates'],
      },
      handler: async (args: { pageId: string; updates: UpdatePageRequest }) => {
        const page = await client.updatePage(args.pageId, args.updates);
        return {
          content: [
            {
              type: 'text',
              text: `Page updated: ${page.title}\n${JSON.stringify(page, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_delete_page',
      description: 'Delete a page permanently',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The page ID',
          },
        },
        required: ['pageId'],
      },
      handler: async (args: { pageId: string }) => {
        await client.deletePage(args.pageId);
        return {
          content: [
            {
              type: 'text',
              text: `Page ${args.pageId} deleted successfully`,
            },
          ],
        };
      },
    },
  ];
}
