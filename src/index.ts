#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ============================================
// CONFIGURATION
// ============================================
const MCP_NAME = "squarespace";
const MCP_VERSION = "1.0.0";
const API_BASE_URL = "https://api.squarespace.com/1.0";

// ============================================
// API CLIENT - Squarespace uses Bearer Token (OAuth2)
// ============================================
class SquarespaceClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "MCP-Squarespace-Server/1.0",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Squarespace API error: ${response.status} ${response.statusText} - ${text}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// ============================================
// TOOL DEFINITIONS
// ============================================
const tools = [
  {
    name: "list_pages",
    description: "List all pages for the website",
    inputSchema: {
      type: "object" as const,
      properties: {
        cursor: { type: "string", description: "Pagination cursor" },
      },
    },
  },
  {
    name: "get_page",
    description: "Get a specific page by ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        pageId: { type: "string", description: "Page ID" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "list_products",
    description: "List all products from the commerce store",
    inputSchema: {
      type: "object" as const,
      properties: {
        cursor: { type: "string", description: "Pagination cursor" },
        modifiedAfter: { type: "string", description: "Filter by modified date (ISO 8601)" },
        modifiedBefore: { type: "string", description: "Filter by modified date (ISO 8601)" },
        type: { type: "string", description: "Product type filter (PHYSICAL, DIGITAL, SERVICE, GIFT_CARD)" },
      },
    },
  },
  {
    name: "get_product",
    description: "Get a specific product by ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        productId: { type: "string", description: "Product ID" },
      },
      required: ["productId"],
    },
  },
  {
    name: "list_orders",
    description: "List orders from the commerce store",
    inputSchema: {
      type: "object" as const,
      properties: {
        cursor: { type: "string", description: "Pagination cursor" },
        modifiedAfter: { type: "string", description: "Filter by modified date (ISO 8601)" },
        modifiedBefore: { type: "string", description: "Filter by modified date (ISO 8601)" },
        fulfillmentStatus: { type: "string", description: "Filter by status (PENDING, FULFILLED, CANCELED)" },
      },
    },
  },
  {
    name: "get_order",
    description: "Get a specific order by ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "Order ID" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "list_inventory",
    description: "List inventory for all product variants",
    inputSchema: {
      type: "object" as const,
      properties: {
        cursor: { type: "string", description: "Pagination cursor" },
      },
    },
  },
  {
    name: "update_inventory",
    description: "Update inventory quantity for a product variant",
    inputSchema: {
      type: "object" as const,
      properties: {
        variantId: { type: "string", description: "Product variant ID" },
        quantity: { type: "number", description: "New quantity to set" },
        quantityDelta: { type: "number", description: "Quantity change (+/-)" },
        isUnlimited: { type: "boolean", description: "Set to unlimited stock" },
      },
      required: ["variantId"],
    },
  },
];

// ============================================
// TOOL HANDLERS
// ============================================
async function handleTool(client: SquarespaceClient, name: string, args: any) {
  switch (name) {
    case "list_pages": {
      const params = new URLSearchParams();
      if (args.cursor) params.append("cursor", args.cursor);
      const query = params.toString();
      return await client.get(`/commerce/pages${query ? `?${query}` : ""}`);
    }

    case "get_page": {
      return await client.get(`/commerce/pages/${args.pageId}`);
    }

    case "list_products": {
      const params = new URLSearchParams();
      if (args.cursor) params.append("cursor", args.cursor);
      if (args.modifiedAfter) params.append("modifiedAfter", args.modifiedAfter);
      if (args.modifiedBefore) params.append("modifiedBefore", args.modifiedBefore);
      if (args.type) params.append("type", args.type);
      const query = params.toString();
      return await client.get(`/commerce/products${query ? `?${query}` : ""}`);
    }

    case "get_product": {
      return await client.get(`/commerce/products/${args.productId}`);
    }

    case "list_orders": {
      const params = new URLSearchParams();
      if (args.cursor) params.append("cursor", args.cursor);
      if (args.modifiedAfter) params.append("modifiedAfter", args.modifiedAfter);
      if (args.modifiedBefore) params.append("modifiedBefore", args.modifiedBefore);
      if (args.fulfillmentStatus) params.append("fulfillmentStatus", args.fulfillmentStatus);
      const query = params.toString();
      return await client.get(`/commerce/orders${query ? `?${query}` : ""}`);
    }

    case "get_order": {
      return await client.get(`/commerce/orders/${args.orderId}`);
    }

    case "list_inventory": {
      const params = new URLSearchParams();
      if (args.cursor) params.append("cursor", args.cursor);
      const query = params.toString();
      return await client.get(`/commerce/inventory${query ? `?${query}` : ""}`);
    }

    case "update_inventory": {
      const payload: any = {};
      if (args.quantity !== undefined) payload.quantity = args.quantity;
      if (args.quantityDelta !== undefined) payload.quantityDelta = args.quantityDelta;
      if (args.isUnlimited !== undefined) payload.isUnlimited = args.isUnlimited;
      return await client.post(`/commerce/inventory/${args.variantId}`, payload);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ============================================
// SERVER SETUP
// ============================================
async function main() {
  const apiKey = process.env.SQUARESPACE_API_KEY;
  
  if (!apiKey) {
    console.error("Error: SQUARESPACE_API_KEY environment variable required");
    process.exit(1);
  }

  const client = new SquarespaceClient(apiKey);

  const server = new Server(
    { name: `${MCP_NAME}-mcp`, version: MCP_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      const result = await handleTool(client, name, args || {});
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${MCP_NAME} MCP server running on stdio`);
}

main().catch(console.error);
