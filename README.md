> **🚀 Don't want to self-host?** [Join the waitlist for our fully managed solution →](https://mcpengage.com/squarespace)
> 
> Zero setup. Zero maintenance. Just connect and automate.

---

# 🚀 Squarespace MCP Server — 2026 Complete Version

## 💡 What This Unlocks

**This MCP server gives AI direct access to your Squarespace Commerce and website platform.** Instead of manually managing products, orders, pages, and inventory through the Squarespace interface, you just *tell* the AI what you need — in plain English.

### 🎯 E-Commerce & Website Power Moves

The AI can directly control your Squarespace site with natural language:

1. **Inventory Sync** — "Check inventory levels across all products and flag any with less than 5 units remaining"
2. **Order Processing** — "Show me all pending orders from the last week and their fulfillment status"
3. **Product Catalog** — "List all digital products and their current prices"
4. **Content Management** — "Get all published pages and show me their last modified dates"
5. **Stock Updates** — "Update inventory for product variant XYZ to 100 units and set it to unlimited stock"

### 🔗 The Real Power: Combining Tools

AI can chain multiple Squarespace operations together in one conversation:

- Query low-stock products → Generate restock list → Update inventory levels
- Pull order data → Match customer info → Export fulfillment queue
- Analyze page content → Cross-reference products → Generate marketing content
- List all orders → Filter by status → Create fulfillment workflow

## 📦 What's Inside

**8 powerful API tools** covering Squarespace Commerce and website management:
- `list_pages` — Browse website pages with pagination
- `get_page` — Get specific page details and content
- `list_products` — Query product catalog with filters
- `get_product` — Get complete product details
- `list_orders` — Browse orders with status filters
- `get_order` — Get full order details
- `list_inventory` — Check stock levels for all variants
- `update_inventory` — Adjust product inventory levels

All with proper error handling, automatic authentication, and TypeScript types.

## 🚀 Quick Start

### Option 1: Claude Desktop (Local)

1. **Clone and build:**
   ```bash
   git clone https://github.com/BusyBee3333/Squarespace-MCP-2026-Complete.git
   cd squarespace-mcp-2026-complete
   npm install
   npm run build
   ```

2. **Get your Squarespace API key:**
   - Log in to your Squarespace account
   - Go to **Settings → Advanced → API Keys**
   - Click **Generate Key** (requires Commerce Advanced plan or Developer mode)
   - Copy your API key securely

3. **Configure Claude Desktop:**
   
   On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "squarespace": {
         "command": "node",
         "args": ["/ABSOLUTE/PATH/TO/squarespace-mcp-2026-complete/dist/index.js"],
         "env": {
           "SQUARESPACE_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

### Option 2: Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/squarespace-mcp)

1. Click the button above
2. Set your Squarespace API key in Railway dashboard
3. Use the Railway URL as your MCP server endpoint

### Option 3: Docker

```bash
docker build -t squarespace-mcp .
docker run -p 3000:3000 \
  -e SQUARESPACE_API_KEY=your-key \
  squarespace-mcp
```

## 🔐 Authentication

**Squarespace uses Bearer Token (OAuth2) authentication with API Keys.**

**Setup Steps:**
1. In Squarespace admin: **Settings → Advanced → API Keys**
2. Click **Generate Key** (requires Commerce Advanced or Developer plan)
3. Select scopes:
   - **Website Content**: Read (for pages)
   - **Commerce**: Read & Write (for products, orders, inventory)
4. Copy and save your API key securely (shown only once!)

**API Documentation:** https://developers.squarespace.com/commerce-apis

**Note:** API access requires:
- **Commerce Advanced plan** or higher
- **Developer mode** enabled (for some features)

The MCP server handles all API requests automatically using your API key.

## 🎯 Example Prompts

Once connected to Claude, you can use natural language for e-commerce and website operations:

**Inventory Management:**
- *"Show me all products with inventory below 10 units"*
- *"Update inventory for variant ID abc123 to 75 units"*
- *"List all products with unlimited inventory enabled"*

**Order Management:**
- *"Get all orders from the last 7 days"*
- *"Show me pending orders that need fulfillment"*
- *"Get complete details for order #12345 including line items"*

**Product Catalog:**
- *"List all physical products currently in the catalog"*
- *"Show me digital products with prices over $50"*
- *"Get product details for item SKU 'SUMMER-2024'"*

**Website Content:**
- *"List all published pages on the site"*
- *"Get the content and metadata for the 'About' page"*
- *"Show me pages modified in the last month"*

**Combined Operations:**
- *"Generate a report of all low-stock items and their current inventory"*
- *"List orders from this week and show which products are most popular"*
- *"Check all product variants and identify which need inventory updates"*

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Squarespace site with Commerce Advanced or Developer plan
- API key with appropriate scopes

### Setup

```bash
git clone https://github.com/BusyBee3333/Squarespace-MCP-2026-Complete.git
cd squarespace-mcp-2026-complete
npm install
cp .env.example .env
# Edit .env with your Squarespace API key
npm run build
npm start
```

### Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## 🐛 Troubleshooting

### "Authentication failed"
- Verify your API key is correct (check for copy/paste errors)
- Ensure your API key hasn't expired or been revoked
- Confirm you have the **Commerce Advanced plan** or Developer mode enabled

### "Tools not appearing in Claude"
- Restart Claude Desktop after updating config
- Check that the path in `claude_desktop_config.json` is **absolute** (not relative)
- Verify the build completed successfully (`dist/index.js` exists)

### "403 Forbidden" errors
- Check that your API key has the required scopes enabled
- Some endpoints require specific plan levels (Commerce Advanced+)
- Verify you're not hitting rate limits

## 📖 Resources

- [Squarespace Commerce API Documentation](https://developers.squarespace.com/commerce-apis)
- [Squarespace API Reference](https://developers.squarespace.com/commerce-apis/reference)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop Documentation](https://claude.ai/desktop)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Credits

Built by [MCPEngage](https://mcpengage.com) — AI infrastructure for business software.

Want more MCP servers? Check out our [full catalog](https://mcpengage.com) covering 30+ business platforms.

---

**Questions?** Open an issue or join our [Discord community](https://discord.gg/mcpengine).
