# Squarespace MCP Server

A comprehensive Model Context Protocol (MCP) server for Squarespace, providing complete integration with the Squarespace platform for website management, e-commerce operations, content creation, and analytics.

## Overview

This MCP server enables AI assistants to interact with Squarespace sites through a rich set of **67 tools** covering all major platform features. Built with TypeScript and the official MCP SDK, it provides type-safe, reliable access to Squarespace's v1.0 API with OAuth2 authentication, automatic token refresh, pagination, error handling, and retry logic.

## Features

### 🛍️ Complete API Coverage (67 Tools)

#### Commerce - Orders (8 tools)
- List, search, and filter orders by date range, status, email
- Get detailed order information with line items and fulfillment
- Create orders (for importing from external sources)
- Fulfill orders with optional shipping notifications and tracking
- Add internal notes to orders
- Get pending orders and recent orders

#### Commerce - Products (10 tools)
- List all products with pagination
- Get detailed product information with variants and images
- Create new products with variants
- Update products (name, description, pricing, SEO)
- Delete products
- Create, update, and delete product variants
- Search products by name or tag
- Filter products by tags

#### Commerce - Inventory (5 tools)
- Get inventory levels for variants
- Update inventory quantities
- Adjust inventory by relative amounts
- Check for low stock items (configurable threshold)
- List out-of-stock items

#### Commerce - Transactions (3 tools)
- Get all transactions for an order
- Process refunds
- Get transaction summaries (total paid, refunded, net)

#### Profiles (7 tools)
- List all profiles (customers, subscribers, donors)
- Get detailed profile information
- List customers with purchase history
- List mailing list subscribers
- List donors
- Search profiles by email
- Get top customers by lifetime value

#### Webhooks (7 tools)
- List all webhook subscriptions
- Get webhook details
- Create new webhooks for events (order.create, inventory.update, etc.)
- Update webhook configurations
- Delete webhooks
- Send test notifications
- Rotate webhook secrets for security

#### Pages & Website (8 tools)
- Get website information
- List and get collections
- List, get, create, update, and delete pages
- Manage page SEO settings

#### Forms (5 tools)
- List all forms
- Get form details with fields
- List form submissions with filtering
- Get specific submission details
- Export form submissions as CSV

#### Blog (9 tools)
- List all blog collections
- Get blog details
- List blog posts with pagination
- Get specific blog post
- Create new blog posts
- Update blog posts
- Delete blog posts
- Publish and unpublish posts

#### Analytics (5 tools)
- Get revenue metrics (total revenue, order count, AOV)
- Get top-selling products by revenue
- Get daily sales breakdowns
- Get monthly revenue summary
- Get yearly revenue summary

### 🎨 15 React MCP Apps (Dark Theme)

All apps are standalone Vite-based React applications with dark theme:

1. **Orders Dashboard** - Order management and fulfillment
2. **Products Manager** - Product catalog management
3. **Inventory Tracker** - Real-time inventory monitoring
4. **Customer Profiles** - Customer LTV and history
5. **Analytics Dashboard** - Revenue and sales insights
6. **Blog Editor** - Blog post management
7. **Forms Viewer** - Form submissions and export
8. **Webhook Manager** - Webhook configuration and testing
9. **Page Manager** - Website page management
10. **Bulk Editor** - Bulk product updates
11. **SEO Optimizer** - SEO settings and optimization
12. **Reports** - Generate and download reports
13. **Shipping Manager** - Fulfillment tracking
14. **Discount Manager** - Discount code management
15. **Settings** - Server and API configuration

### 🔒 Enterprise-Grade Features

- **OAuth2 Authentication** - Full OAuth2 support with refresh tokens
- **Automatic Token Refresh** - Seamless token renewal before expiration
- **Retry Logic** - Automatic retry with exponential backoff for rate limits and errors
- **Pagination Support** - Handle large datasets efficiently
- **Error Handling** - Comprehensive error messages with details
- **Type Safety** - Full TypeScript types for all API entities
- **Rate Limit Management** - Built-in rate limit handling

## Installation

```bash
npm install @mcpengine/squarespace-server
```

Or install from source:

```bash
cd servers/squarespace
npm install
npm run build
```

## Configuration

### Environment Variables

The server requires at minimum a Squarespace access token:

```bash
export SQUARESPACE_ACCESS_TOKEN="your_access_token_here"
```

For long-term access with automatic token refresh:

```bash
export SQUARESPACE_ACCESS_TOKEN="your_access_token"
export SQUARESPACE_REFRESH_TOKEN="your_refresh_token"
export SQUARESPACE_CLIENT_ID="your_client_id"
export SQUARESPACE_CLIENT_SECRET="your_client_secret"
```

### MCP Configuration

Add to your MCP settings file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "squarespace": {
      "command": "squarespace-mcp",
      "env": {
        "SQUARESPACE_ACCESS_TOKEN": "your_access_token",
        "SQUARESPACE_REFRESH_TOKEN": "your_refresh_token",
        "SQUARESPACE_CLIENT_ID": "your_client_id",
        "SQUARESPACE_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Getting Squarespace API Credentials

### 1. Register Your OAuth Application

Submit a request to Squarespace to register your OAuth application:
- [Squarespace Developer Portal](https://developers.squarespace.com/)
- Provide: App name, icon, redirect URI, terms & privacy links

You'll receive:
- `client_id`
- `client_secret`

### 2. OAuth Flow

Implement the OAuth2 authorization code flow:

1. **Authorization URL:**
```
https://login.squarespace.com/api/1/login/oauth/provider/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=website.orders,website.products,website.inventory&
  state=RANDOM_STATE&
  access_type=offline
```

2. **Token Exchange:**
```bash
curl -X POST https://login.squarespace.com/api/1/login/oauth/provider/tokens \
  -H "Authorization: Basic BASE64(client_id:client_secret)" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE",
    "redirect_uri": "YOUR_REDIRECT_URI"
  }'
```

### API Scopes

Request these scopes for full functionality:
- `website.orders` - Read and manage orders
- `website.orders.read` - Read-only order access
- `website.products` - Manage products
- `website.products.read` - Read-only product access
- `website.inventory` - Manage inventory
- `website.inventory.read` - Read-only inventory access
- `website.transactions.read` - Read transaction data

## Usage Examples

### List Recent Orders

```javascript
{
  "name": "squarespace_list_orders",
  "arguments": {
    "modifiedAfter": "2024-01-01T00:00:00Z",
    "fulfillmentStatus": "PENDING"
  }
}
```

### Create a Product

```javascript
{
  "name": "squarespace_create_product",
  "arguments": {
    "product": {
      "type": "PHYSICAL",
      "storePageId": "store_page_id",
      "name": "New Product",
      "description": "Product description",
      "variants": [{
        "sku": "SKU-001",
        "pricing": {
          "basePrice": {
            "value": "29.99",
            "currency": "USD"
          }
        },
        "stock": {
          "quantity": 100,
          "unlimited": false
        }
      }]
    }
  }
}
```

### Fulfill an Order

```javascript
{
  "name": "squarespace_fulfill_order",
  "arguments": {
    "orderId": "order_id_here",
    "shouldSendNotification": true,
    "shipments": [{
      "carrierName": "USPS",
      "trackingNumber": "1234567890",
      "trackingUrl": "https://tools.usps.com/go/TrackConfirmAction?tLabels=1234567890"
    }]
  }
}
```

### Get Revenue Analytics

```javascript
{
  "name": "squarespace_get_revenue_metrics",
  "arguments": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }
}
```

### Check Low Stock Items

```javascript
{
  "name": "squarespace_check_low_stock",
  "arguments": {
    "threshold": 10
  }
}
```

## Architecture

```
squarespace/
├── src/
│   ├── clients/
│   │   └── squarespace.ts       # API client with auth & retry logic
│   ├── types/
│   │   └── index.ts             # Complete TypeScript types
│   ├── tools/
│   │   ├── commerce-orders.ts   # Order management tools
│   │   ├── commerce-products.ts # Product management tools
│   │   ├── commerce-inventory.ts# Inventory management tools
│   │   ├── commerce-transactions.ts # Transaction tools
│   │   ├── profiles.ts          # Customer/subscriber tools
│   │   ├── webhooks.ts          # Webhook management tools
│   │   ├── pages.ts             # Page management tools
│   │   ├── forms.ts             # Form submission tools
│   │   ├── blog.ts              # Blog management tools
│   │   └── analytics.ts         # Analytics tools
│   ├── ui/
│   │   └── react-app/          # 15 React MCP apps
│   ├── server.ts                # MCP server implementation
│   └── main.ts                  # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## API Reference

Full documentation: [Squarespace Developer Docs](https://developers.squarespace.com/)

### Rate Limits

Squarespace enforces varying rate limits per endpoint with 1-minute cooldowns. The client automatically handles rate limiting with retry logic.

### Webhooks

Subscribe to real-time events:
- `order.create` - New order created
- `order.update` - Order updated
- `transaction.create` - New transaction
- `transaction.update` - Transaction updated
- `inventory.update` - Inventory changed
- `product.create` - Product created
- `product.update` - Product updated
- `product.delete` - Product deleted

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Development Mode

```bash
npm run dev
```

## Troubleshooting

### Authentication Errors

- **401 Unauthorized**: Token expired or invalid - refresh your token
- **403 Forbidden**: Insufficient scopes - request additional permissions
- **Token refresh fails**: Verify client credentials are correct

### Rate Limiting

- **429 Too Many Requests**: Built-in retry handles this automatically
- Implement delays between bulk operations for best performance

### Common Issues

1. **Missing environment variables**: Ensure `SQUARESPACE_ACCESS_TOKEN` is set
2. **TypeScript errors**: Run `npm run type-check` to diagnose
3. **Module resolution**: Verify `package.json` has `"type": "module"`

## Contributing

Contributions welcome! Please:
1. Follow existing code structure
2. Add tests for new tools
3. Update documentation
4. Run type checking before submitting

## License

MIT License - see LICENSE file for details

## Support

- [Squarespace API Documentation](https://developers.squarespace.com/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub Issues](https://github.com/BusyBee3333/mcpengine/issues)

## Changelog

### v1.0.0 (2024-02-12)
- Initial release
- 67 tools covering all major Squarespace features
- 15 React MCP apps with dark theme
- OAuth2 authentication with auto-refresh
- Comprehensive error handling and retry logic
- Full TypeScript support
