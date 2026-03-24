import React, { useState, useEffect } from 'react';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";

export default function App() {
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState('home'); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [upiId, setUpiId] = useState("yourname@upi");

  // --- FETCH REAL DATA FROM FIREBASE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const pRes = await fetch(`${DB_URL}products.json`);
        const pData = await pRes.json();
        if (pData) {
          const loadedProducts = Object.keys(pData).map(key => ({
            id: key, ...pData[key]
          }));
          setProducts(loadedProducts);
        }
        // Fetch Admin Settings (UPI ID)
        const sRes = await fetch(`${DB_URL}settings.json`);
        const sData = await sRes.json();
        if (sData && sData.upiId) setUpiId(sData.upiId);
      } catch (e) { console.error("Firebase Error:", e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);
  const handleProductClick = (p) => {
    setSelectedProduct(p);
    setCurrentView('product');
    window.scrollTo(0,0);
  };

  const addToCart = (p) => {
    const price = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    setCart([...cart, { ...p, finalPrice: price }]);
    showToast(`Added to Bag! 🛍️`);
  };

  const showToast = (msg) => {
    const t = document.createElement('div');
    t.style.cssText = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:12px 25px; border-radius:30px; z-index:9999; font-weight:600; font-size:13px; box-shadow:0 10px 20px rgba(0,0,0,0.2);";
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.finalPrice || item.price), 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const total = currentView === 'product' ? (selectedProduct.discount > 0 ? Math.round(selectedProduct.price * (1 - selectedProduct.discount/100)) : selectedProduct.price) : getCartTotal();
    
    const orderData = {
      customerName: e.target.name.value,
      address: e.target.address.value,
      phone: e.target.phone.value,
      items: currentView === 'product' ? selectedProduct.name : cart.map(i => i.name).join(", "),
      totalAmount: total,
      status: "Pending",
      timestamp: Date.now()
    };

    try {
      await fetch(`${DB_URL}orders.json`, { method: 'POST', body: JSON.stringify(orderData) });
      if (window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      alert("🎉 Order Received! We'll contact you soon.");
      setIsCheckoutOpen(false);
      setCart([]);
      setCurrentView('home');
    } catch (err) { alert("Error placing order."); }
  };
  const renderHome = () => (
    <div className="view-container">
      <div style={{ background: 'var(--card-bg)', borderRadius: '30px', padding: '50px 20px', textAlign: 'center', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>made for play.</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Discover the softest collection for your little ones.</p>
        <button className="btn-main" onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}>Explore Collection</button>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card" onClick={() => handleProductClick(p)}>
            {p.discount > 0 && <span className="tag">{p.discount}% OFF</span>}
            <img src={p.img} alt={p.name} className="product-img" />
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{p.name}</h3>
              <p style={{ fontWeight: '800', color: 'var(--text-main)', marginTop: '5px' }}>₹{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProduct = () => {
    if (!selectedProduct) return null;
    const finalPrice = selectedProduct.discount > 0 ? Math.round(selectedProduct.price * (1 - selectedProduct.discount/100)) : selectedProduct.price;
    return (
      <div className="view-container">
        <div className="product-detail-wrap">
          <div style={{ background: 'var(--card-bg)', borderRadius: '30px', padding: '20px', border: '1px solid var(--border-color)' }}>
            <img src={selectedProduct.img} alt={selectedProduct.name} style={{ width: '100%', borderRadius: '20px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{selectedProduct.name}</h1>
            <h2 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '20px' }}>₹{finalPrice}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '30px' }}>Ultra-soft premium cotton. Breathable, durable, and designed for maximum comfort during every adventure.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => addToCart(selectedProduct)}>Add to Bag</button>
              <button className="btn-main" style={{ flex: 1 }} onClick={() => setIsCheckoutOpen(true)}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <header>
        <div className="header-icons"><i className="icon-btn fas fa-bars" onClick={() => setIsSidebarOpen(true)}></i></div>
        <div className="brand-logo brand-font" onClick={() => setCurrentView('home')}>raizo.</div>
        <div className="header-icons">
          <i className={`icon-btn ${isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}`} onClick={() => setIsDarkMode(!isDarkMode)}></i>
          <div style={{ position: 'relative' }} onClick={() => setCurrentView('cart')}><i className="icon-btn fas fa-shopping-bag"></i>{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}</div>
        </div>
      </header>

      {isSidebarOpen && <div className="modal-overlay" style={{background:'rgba(0,0,0,0.2)'}} onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 className="brand-font" style={{marginBottom:'30px'}}>Menu</h2>
        <div className="sidebar-link" onClick={() => {setCurrentView('home'); setIsSidebarOpen(false);}}><i className="fas fa-home"></i> Shop Home</div>
        <div className="sidebar-link" onClick={() => {setCurrentView('cart'); setIsSidebarOpen(false);}}><i className="fas fa-shopping-bag"></i> My Bag</div>
      </div>

      {currentView === 'home' && renderHome()}
      {currentView === 'product' && renderProduct()}
      {currentView === 'cart' && (
        <div className="view-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="brand-font" style={{ textAlign: 'center', marginBottom: '30px' }}>Your Bag</h2>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <img src={item.img} style={{ width: '80px', borderRadius: '15px' }} />
              <div style={{ flex: 1 }}><h4>{item.name}</h4><p style={{ fontWeight: '800' }}>₹{item.finalPrice}</p></div>
            </div>
          ))}
          <h3 style={{ textAlign: 'right' }}>Total: ₹{getCartTotal()}</h3>
          <button className="btn-main" style={{ width: '100%', marginTop: '20px' }} onClick={() => setIsCheckoutOpen(true)}>Checkout</button>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <i className="fas fa-times close-btn" onClick={() => setIsCheckoutOpen(false)}></i>
            <h2 className="brand-font" style={{marginBottom:'20px'}}>Checkout</h2>
            <form onSubmit={handleCheckoutSubmit}>
              <input name="name" placeholder="Full Name" required />
              <input name="address" placeholder="Shipping Address" required />
              <input name="phone" placeholder="Mobile Number" required />
              <button type="submit" className="btn-main" style={{width:'100%'}}>Place Order</button>
            </form>
          </div>
        </div>
      )}
      
      <footer style={{ textAlign: 'center', padding: '50px 20px', borderTop: '1px solid var(--border-color)', marginTop: '50px' }}>
        <h2 className="brand-font">raizo.</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px' }}>Premium kids boutique. Built with love by Robiul.</p>
      </footer>
    </>
  );
}
