#!/bin/bash

# Generate React MCP Apps for Squarespace

APPS=(
  "products:🛍️ Products:Manage your product catalog"
  "inventory:📊 Inventory:Track stock levels and alerts"
  "customers:👥 Customers:Customer profiles and LTV"
  "analytics:📈 Analytics:Revenue and sales insights"
  "blog:✍️ Blog:Blog post management"
  "forms:📋 Forms:Form submissions viewer"
  "webhooks:🔔 Webhooks:Webhook configuration"
  "pages:📄 Pages:Website page manager"
  "bulk-editor:⚡ Bulk Editor:Bulk product updates"
  "seo:🔍 SEO:SEO optimization tools"
  "reports:📊 Reports:Generate reports"
  "shipping:🚚 Shipping:Fulfillment tracking"
  "discounts:💰 Discounts:Discount code manager"
  "settings:⚙️ Settings:Server configuration"
)

for app_spec in "${APPS[@]}"; do
  IFS=':' read -r name icon title desc <<< "$app_spec"
  
  mkdir -p "src/ui/react-app/$name"
  
  # App.tsx
  cat > "src/ui/react-app/$name/App.tsx" <<EOF
import React, { useState, useEffect } from 'react';

export default function ${name^}App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#0f0f0f',
      color: '#e0e0e0',
      minHeight: '100vh'
    }}>
      <header style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #2a2a2a'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>
          $icon $title
        </h1>
        <p style={{ color: '#888' }}>$desc</p>
      </header>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          Loading...
        </div>
      ) : (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>$title</h2>
          <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>$desc</p>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}
EOF

  # index.html
  cat > "src/ui/react-app/$name/index.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - Squarespace MCP</title>
  <style>
    body { margin: 0; background: #0f0f0f; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/main.tsx"></script>
</body>
</html>
EOF

  # main.tsx
  cat > "src/ui/react-app/$name/main.tsx" <<EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

  # vite.config.ts
  cat > "src/ui/react-app/$name/vite.config.ts" <<EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
EOF

  echo "Created $name app"
done

echo "All React apps created successfully!"
