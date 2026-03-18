'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser, logout } from '@/lib/client/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('restaurants');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState({});
    const [orders, setOrders] = useState([]);

    // Loading
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const u = getUser();
        if (!u) { router.push('/'); return; }
        setUser(u);
    }, [router]);

    const flash = useCallback((type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }, []);

    // ── Restaurants ───────────────────────
    const fetchRestaurants = useCallback(async () => {
        setLoadingRestaurants(true);
        try {
            const data = await api('/restaurants');
            setRestaurants(data.data.restaurants);
        } catch (err) { flash('error', err.message); }
        finally { setLoadingRestaurants(false); }
    }, [flash]);

    useEffect(() => { if (user) fetchRestaurants(); }, [user, fetchRestaurants]);

    // ── Menu ──────────────────────────────
    const fetchMenu = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        setLoadingMenu(true);
        setCart({});
        try {
            const data = await api(`/restaurants/${restaurant._id}/menu`);
            setMenuItems(data.data.menuItems);
        } catch (err) { flash('error', err.message); }
        finally { setLoadingMenu(false); }
    };

    // ── Cart ──────────────────────────────
    const updateQty = (id, delta) => {
        setCart((prev) => {
            const qty = (prev[id] || 0) + delta;
            if (qty <= 0) { const next = { ...prev }; delete next[id]; return next; }
            return { ...prev, [id]: qty };
        });
    };

    // ── Place order ───────────────────────
    const placeOrder = async () => {
        const entries = Object.entries(cart);
        if (entries.length === 0) return flash('error', 'Add items to your cart first!');
        setSubmitting(true);
        try {
            await api('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    restaurantId: selectedRestaurant._id,
                    items: entries.map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
                }),
            });
            flash('success', 'Order placed successfully!');
            setCart({});
            fetchOrders();
            setTab('orders');
        } catch (err) { flash('error', err.message); }
        finally { setSubmitting(false); }
    };

    // ── Fetch orders ──────────────────────
    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const data = await api('/orders');
            setOrders(data.data?.orders || []);
        } catch { setOrders([]); }
        finally { setLoadingOrders(false); }
    }, []);

    useEffect(() => { if (user && tab === 'orders') fetchOrders(); }, [user, tab, fetchOrders]);

    // ── Order actions ─────────────────────
    const orderAction = async (orderId, action, body = null) => {
        setSubmitting(true);
        try {
            const map = {
                checkout: { path: `/orders/${orderId}/checkout`, method: 'POST' },
                cancel: { path: `/orders/${orderId}/cancel`, method: 'POST' },
                payment: { path: `/orders/${orderId}/payment`, method: 'PUT' },
            };
            const { path, method } = map[action];
            await api(path, { method, ...(body && { body: JSON.stringify(body) }) });
            flash('success', `Order ${action} successful!`);
            fetchOrders();
        } catch (err) { flash('error', err.message); }
        finally { setSubmitting(false); }
    };

    const handleLogout = () => { logout(); router.push('/'); };

    if (!user) return <div className="loading">Loading...</div>;

    const canCheckoutCancel = ['admin', 'manager'].includes(user.role);
    const canUpdatePayment = user.role === 'admin';

    const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find((m) => m._id === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    return (
        <>
            {/* Header */}
            <div className="header">
                <h1>🍕 Food Ordering</h1>
                <div className="header-right">
                    <span className="badge badge-role">{user.role}</span>
                    <span className="badge badge-country">{user.country}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.name}</span>
                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="container">
                {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

                {/* Tabs */}
                <div className="tabs">
                    {['restaurants', 'order', 'orders'].map((t) => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'restaurants' ? '🍽️ Restaurants' : t === 'order' ? '🛒 New Order' : '📋 My Orders'}
                        </button>
                    ))}
                </div>

                {/* ── Restaurants Tab ──────────── */}
                {tab === 'restaurants' && (
                    <div>
                        <div className="flex-between mb-16">
                            <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>
                                Restaurants ({user.country})
                            </h2>
                            <button className="btn btn-outline btn-sm" onClick={fetchRestaurants}>Refresh</button>
                        </div>
                        {loadingRestaurants ? (
                            <p className="loading">Loading restaurants...</p>
                        ) : restaurants.length === 0 ? (
                            <p className="empty">No restaurants found. Run <code>npm run seed</code>.</p>
                        ) : (
                            <div className="grid-2">
                                {restaurants.map((r) => (
                                    <div className="card" key={r._id}>
                                        <h3>{r.name}</h3>
                                        <p>{r.address}</p>
                                        <div className="card-meta"><span>{r.cuisine}</span><span>•</span><span>{r.country}</span></div>
                                        <button className="btn btn-primary btn-sm mt-8" onClick={() => { fetchMenu(r); setTab('order'); }}>
                                            View Menu & Order
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── New Order Tab ────────────── */}
                {tab === 'order' && (
                    <div>
                        {!selectedRestaurant ? (
                            <p className="empty">Select a restaurant from the Restaurants tab first.</p>
                        ) : (
                            <>
                                <div className="flex-between mb-16">
                                    <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>
                                        {selectedRestaurant.name} — Menu
                                    </h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => setTab('restaurants')}>← Back</button>
                                </div>

                                {loadingMenu ? (
                                    <p className="loading">Loading menu...</p>
                                ) : menuItems.length === 0 ? (
                                    <p className="empty">No menu items available.</p>
                                ) : (
                                    <div className="card">
                                        {menuItems.map((item) => (
                                            <div className="menu-item-row" key={item._id}>
                                                <div className="menu-item-info">
                                                    <h4>{item.name}</h4>
                                                    <p>{item.description}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <span className="menu-item-price">
                                                        {item.country === 'america' ? '$' : '₹'}{item.price}
                                                    </span>
                                                    <div className="qty-controls">
                                                        <button onClick={() => updateQty(item._id, -1)}>−</button>
                                                        <span>{cart[item._id] || 0}</span>
                                                        <button onClick={() => updateQty(item._id, 1)}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {Object.keys(cart).length > 0 && (
                                    <div className="card" style={{ borderColor: 'var(--accent)' }}>
                                        <div className="flex-between">
                                            <div>
                                                <strong>Cart Total:</strong>{' '}
                                                <span className="menu-item-price">
                                                    {selectedRestaurant?.country === 'america' ? '$' : '₹'}{cartTotal.toFixed(2)}
                                                </span>
                                                <span style={{ marginLeft: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    ({Object.values(cart).reduce((a, b) => a + b, 0)} items)
                                                </span>
                                            </div>
                                            <button className="btn btn-success" onClick={placeOrder} disabled={submitting}>
                                                {submitting ? 'Placing...' : 'Place Order'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── My Orders Tab ────────────── */}
                {tab === 'orders' && (
                    <div>
                        <div className="flex-between mb-16">
                            <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Orders</h2>
                            <button className="btn btn-outline btn-sm" onClick={fetchOrders}>Refresh</button>
                        </div>
                        {loadingOrders ? (
                            <p className="loading">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="empty">No orders yet. Create one from the New Order tab.</p>
                        ) : (
                            orders.map((order) => (
                                <div className="card" key={order._id}>
                                    <div className="flex-between">
                                        <div>
                                            <h3 style={{ fontSize: '0.95rem' }}>Order #{order._id.slice(-6)}</h3>
                                            <p style={{ fontSize: '0.78rem', marginTop: 2 }}>{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`order-status status-${order.status}`}>{order.status}</span>
                                            <p className="menu-item-price mt-8" style={{ fontSize: '1.1rem' }}>
                                                {order.country === 'america' ? '$' : '₹'}{order.totalAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        {order.items?.map((item, i) => (
                                            <span key={i}>{item.name} ×{item.quantity}{i < order.items.length - 1 ? ' · ' : ''}</span>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        Payment: <strong>{order.paymentMethod}</strong>
                                    </div>

                                    <div className="btn-group mt-16">
                                        {canCheckoutCancel && order.status === 'pending' && (
                                            <>
                                                <button className="btn btn-success btn-sm" onClick={() => orderAction(order._id, 'checkout')} disabled={submitting}>✓ Checkout</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => orderAction(order._id, 'cancel')} disabled={submitting}>✗ Cancel</button>
                                            </>
                                        )}
                                        {canUpdatePayment && order.status !== 'cancelled' && (
                                            <select className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }} value={order.paymentMethod}
                                                onChange={(e) => orderAction(order._id, 'payment', { paymentMethod: e.target.value })} disabled={submitting}>
                                                <option value="cash">💵 Cash</option>
                                                <option value="card">💳 Card</option>
                                                <option value="upi">📱 UPI</option>
                                            </select>
                                        )}
                                        {!canCheckoutCancel && order.status === 'pending' && (
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                Only Admins/Managers can checkout or cancel
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
