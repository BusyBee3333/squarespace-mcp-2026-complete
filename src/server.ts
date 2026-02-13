/**
 * Squarespace MCP Server
 * Main server implementation with all tools and resources
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { SquarespaceClient } from './clients/squarespace.js';
import { registerOrdersTools } from './tools/commerce-orders.js';
import { registerProductsTools } from './tools/commerce-products.js';
import { registerInventoryTools } from './tools/commerce-inventory.js';
import { registerTransactionsTools } from './tools/commerce-transactions.js';
import { registerProfilesTools } from './tools/profiles.js';
import { registerWebhooksTools } from './tools/webhooks.js';
import { registerPagesTools } from './tools/pages.js';
import { registerFormsTools } from './tools/forms.js';
import { registerBlogTools } from './tools/blog.js';
import { registerAnalyticsTools } from './tools/analytics.js';

// Environment configuration
const ACCESS_TOKEN = process.env.SQUARESPACE_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.SQUARESPACE_REFRESH_TOKEN;
const CLIENT_ID = process.env.SQUARESPACE_CLIENT_ID;
const CLIENT_SECRET = process.env.SQUARESPACE_CLIENT_SECRET;

if (!ACCESS_TOKEN) {
  console.error('Error: SQUARESPACE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Squarespace client
const client = new SquarespaceClient({
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  timeout: 30000,
  retryAttempts: 3,
});

// Create MCP server
const server = new Server(
  {
    name: 'squarespace-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register all tools from different modules
const allTools = [
  ...registerOrdersTools(client),
  ...registerProductsTools(client),
  ...registerInventoryTools(client),
  ...registerTransactionsTools(client),
  ...registerProfilesTools(client),
  ...registerWebhooksTools(client),
  ...registerPagesTools(client),
  ...registerFormsTools(client),
  ...registerBlogTools(client),
  ...registerAnalyticsTools(client),
];

// Create a map for quick tool lookup
const toolsMap = new Map(allTools.map(tool => [tool.name, tool]));

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = toolsMap.get(request.params.name);
  
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    return await tool.handler(request.params.arguments as any);
  } catch (error: any) {
    // Enhanced error handling
    const errorMessage = error.message || 'An unknown error occurred';
    const errorDetails = error.errors ? JSON.stringify(error.errors) : '';
    
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}${errorDetails ? `\nDetails: ${errorDetails}` : ''}`,
        },
      ],
      isError: true,
    };
  }
});

// List resources handler (for React apps)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = [
    {
      uri: 'squarespace://app/orders',
      name: 'Orders Dashboard',
      description: 'Interactive orders management dashboard',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/products',
      name: 'Products Manager',
      description: 'Product catalog management interface',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/inventory',
      name: 'Inventory Tracker',
      description: 'Real-time inventory monitoring and management',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/customers',
      name: 'Customer Profiles',
      description: 'Customer lifetime value and order history',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/analytics',
      name: 'Analytics Dashboard',
      description: 'Revenue and sales analytics',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/blog',
      name: 'Blog Editor',
      description: 'Blog post management interface',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/forms',
      name: 'Form Submissions',
      description: 'View and export form submissions',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/webhooks',
      name: 'Webhook Manager',
      description: 'Configure and test webhooks',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/pages',
      name: 'Page Manager',
      description: 'Website page management',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/bulk-editor',
      name: 'Bulk Editor',
      description: 'Bulk product and pricing updates',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/seo',
      name: 'SEO Optimizer',
      description: 'SEO settings and optimization',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/reports',
      name: 'Reports',
      description: 'Generate and download reports',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/shipping',
      name: 'Shipping Manager',
      description: 'Shipping and fulfillment tracking',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/discounts',
      name: 'Discount Manager',
      description: 'Create and manage discount codes',
      mimeType: 'text/html',
    },
    {
      uri: 'squarespace://app/settings',
      name: 'Settings',
      description: 'Server and API configuration',
      mimeType: 'text/html',
    },
  ];

  return { resources };
});

// Read resource handler (serves React apps)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const appName = uri.replace('squarespace://app/', '');
  
  // In production, this would serve the built React app HTML
  // For now, return a placeholder that indicates the app is available
  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: 'text/html',
        text: `<!DOCTYPE html>
<html>
<head>
  <title>Squarespace ${appName.charAt(0).toUpperCase() + appName.slice(1)}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="root"></div>
  <script>
    // This would be replaced with the actual React app in production
    document.getElementById('root').innerHTML = '<h1>Squarespace ${appName} App</h1><p>React app would be loaded here.</p>';
  </script>
</body>
</html>`,
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Squarespace MCP Server running on stdio');
  console.error(`Registered ${allTools.length} tools`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
