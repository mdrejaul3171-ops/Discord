import React, { useState, useEffect } from 'react';
import './index.css';

// 🧸 DUMMY DATA (You will replace this with your Firebase fetch later)
const dummyProducts = [
  { id: '1', name: 'Cloud Knit Sweater', price: 1299, discount: 15, img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Soft Linen Romper', price: 899, discount: 0, img: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Pastel Cotton Tee', price: 599, discount: 20, img: 'https://images.unsplash.com/photo-1522771930-78848d92871d?auto=format&fit=crop&q=80&w=400' },
  { id: '4', name: 'Cozy Dream Pants', price: 999, discount: 0, img: 'https://images.unsplash.com/photo-1471286174890-9c112d1c9293?auto=format&fit=crop&q=80&w=400' }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState('home'); // 'home', 'product', 'cart', 'chat'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'admin', text: 'Hi! Welcome to Raizo Concierge. How can we help you today?', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // --- DARK MODE TOGGLE EFFECT ---
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // --- HELPER FUNCTIONS ---
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
  };

  const addToCart = (product) => {
    const finalPrice = product.discount > 0 ? Math.round(product.price - (product.price * (product.discount/100))) : product.price;
    setCart([...cart, { ...product, finalPrice }]);
    alert(`Added ${product.name} to bag! 🛍️`); // In production, replace with a custom Toast component
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.finalPrice, 0);
  };

  const handleSendMessage = () => {
    if(!chatInput.trim()) return;
    const newMsg = { sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
    // Auto-reply simulation for testing
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'admin', text: 'Thank you for reaching out! An agent will be with you shortly.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 1500);
  };
  // --- SUB-COMPONENTS (Render Methods) ---
  const renderHome = () => (
    <div className="view-container">
      <div style={{ background: 'var(--card-bg)', borderRadius: '30px', padding: '40px', textAlign: 'center', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '15px' }}>Soft, playful, perfect.</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Explore the new Raizo Autumn Collection.</p>
        <button className="btn-main" onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})}>Shop Arrivals</button>
      </div>

      <h2 className="brand-font" style={{ textAlign: 'center', marginBottom: '20px' }}>Trending Now</h2>
      <div className="product-grid">
        {dummyProducts.map((p) => {
          const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
          return (
            <div key={p.id} className="product-card" onClick={() => handleProductClick(p)}>
              {p.discount > 0 && <span className="tag">{p.discount}% OFF</span>}
              <img src={p.img} alt={p.name} className="product-img" />
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{p.name}</h3>
                <p>
                  {p.discount > 0 && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '8px', fontSize: '13px' }}>₹{p.price}</span>}
                  <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>₹{finalPrice}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProduct = () => {
    if (!selectedProduct) return null;
    const finalPrice = selectedProduct.discount > 0 ? Math.round(selectedProduct.price - (selectedProduct.price * (selectedProduct.discount/100))) : selectedProduct.price;
    
    return (
      <div className="view-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '500px', background: 'var(--card-bg)', borderRadius: '30px', padding: '20px', border: '1px solid var(--border-color)' }}>
          <img src={selectedProduct.img} alt={selectedProduct.name} style={{ width: '100%', borderRadius: '20px' }} />
        </div>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '1px' }}>SKU: RZ-{selectedProduct.id}00</p>
          <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{selectedProduct.name}</h1>
          <h2 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '20px' }}>₹{finalPrice}</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '30px' }}>
            Beautifully crafted with ultra-soft, breathable materials. Perfect for sensitive skin and endless playtime adventures.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => addToCart(selectedProduct)}>Add to Bag</button>
            <button className="btn-main" style={{ flex: 1 }} onClick={() => setIsCheckoutOpen(true)}>Buy Now</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="view-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 className="brand-font" style={{ textAlign: 'center', marginBottom: '30px' }}>Your Shopping Bag 🛍️</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'var(--card-bg)', borderRadius: '24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your bag is currently empty.</p>
          <button className="btn-main" onClick={() => setCurrentView('home')}>Continue Shopping</button>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '20px', border: '1px solid var(--border-color)' }}>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
              <img src={item.img} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} alt={item.name} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '15px' }}>{item.name}</h4>
                <p style={{ color: 'var(--primary)', fontWeight: '800' }}>₹{item.finalPrice}</p>
              </div>
              <button onClick={() => removeFromCart(index)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '20px', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Total: ₹{getCartTotal()}</h3>
            <button className="btn-main" style={{ width: '100%' }} onClick={() => setIsCheckoutOpen(true)}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="view-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="chat-window">
        <div style={{ padding: '20px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><i className="fas fa-headset"></i></div>
          <div><h3 style={{ margin: 0 }}>Raizo Concierge</h3><p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>We usually reply in minutes</p></div>
        </div>
        <div className="chat-body">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender === 'user' ? 'chat-user' : 'chat-admin'}`}>
              <p>{msg.text}</p>
              <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7, textAlign: 'right' }}>
                {msg.time} {msg.sender === 'user' && <i className="fas fa-check-double" style={{ marginLeft: '5px' }}></i>}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-box">
          <input type="text" placeholder="Type your message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
          <button className="chat-send-btn" onClick={handleSendMessage}><i className="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  );
  // --- MAIN APP RENDER ---
  return (
    <>
      {/* HEADER */}
      <header>
        <div className="brand-logo" onClick={() => setCurrentView('home')}>raizo.</div>
        <div className="header-icons">
          <i className={`icon-btn ${isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}`} onClick={() => setIsDarkMode(!isDarkMode)}></i>
          <i className="icon-btn far fa-comment-dots" onClick={() => setCurrentView('chat')}></i>
          <div className="cart-wrap" onClick={() => setCurrentView('cart')}>
            <i className="icon-btn fas fa-shopping-bag"></i>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>

      {/* DYNAMIC VIEWS */}
      {currentView === 'home' && renderHome()}
      {currentView === 'product' && renderProduct()}
      {currentView === 'cart' && renderCart()}
      {currentView === 'chat' && renderChat()}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
        <h2 className="brand-font" style={{ marginBottom: '15px', color: 'var(--text-main)' }}>raizo.</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Premium kids wear, beautifully crafted.</p>
      </footer>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setIsCheckoutOpen(false)}>&times;</span>
            <h2 className="brand-font" style={{ marginBottom: '20px', textAlign: 'center' }}>Secure Checkout</h2>
            <input type="text" placeholder="Full Name" />
            <input type="text" placeholder="Delivery Address" />
            <input type="tel" placeholder="Phone Number" />
            
            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '16px', margin: '20px 0', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '800' }}>₹{currentView === 'product' ? (selectedProduct?.finalPrice || 0) : getCartTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontWeight: '800' }}>Total:</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>
                  ₹{currentView === 'product' ? (selectedProduct?.finalPrice || 0) : getCartTotal()}
                </span>
              </div>
            </div>

            <button 
              className="btn-main" 
              style={{ width: '100%' }} 
              onClick={() => {
                alert("Order Confirmed! 🎈 Check your dashboard.");
                setIsCheckoutOpen(false);
                setCart([]); // Clear cart on success
                setCurrentView('home');
              }}
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </>
  );
}
