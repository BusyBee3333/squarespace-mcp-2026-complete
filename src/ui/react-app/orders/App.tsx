import React, { useState, useEffect } from 'react';
import './styles.css';

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  grandTotal: { value: string; currency: string };
  fulfillmentStatus: string;
  createdOn: string;
}

export default function OrdersApp() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data for demonstration
    setOrders([
      {
        id: '1',
        orderNumber: 'SQ-1001',
        customerEmail: 'customer@example.com',
        grandTotal: { value: '149.99', currency: 'USD' },
        fulfillmentStatus: 'PENDING',
        createdOn: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.fulfillmentStatus === filter
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📦 Orders Dashboard</h1>
        <p>Manage and fulfill customer orders</p>
      </header>

      <div className="toolbar">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <button className="btn-primary">Export Orders</button>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.orderNumber}</h3>
                <span className={`status status-${order.fulfillmentStatus.toLowerCase()}`}>
                  {order.fulfillmentStatus}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.customerEmail}</p>
                <p><strong>Total:</strong> {order.grandTotal.currency} {order.grandTotal.value}</p>
                <p><strong>Date:</strong> {new Date(order.createdOn).toLocaleDateString()}</p>
              </div>
              <div className="order-actions">
                <button className="btn-secondary">View Details</button>
                <button className="btn-primary">Fulfill Order</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
