import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orders, setOrders] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState('single');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // New Animated Background State
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');

    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } catch (e) { console.error(e); }
    };
    fetchDB();

    // Generate random stars for Dark Mode
    setStars([...Array(30)].map((_, i) => ({
      id: i, top: Math.random() * 100 + '%', left: Math.random() * 100 + '%'
    })));
  }, []);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('rsDarkModeMain', !isDarkMode);
  };

  const navigate = (view, product = null) => {
    setSelectedProduct(product);
    setCurrentView(view);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
    if(view === 'orders') fetchMyOrders();
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const addToCart = (p) => {
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    const newCart = [...cart, { ...p, finalPrice }];
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("☁️ Added to your sky-bag!", "success");
  };

  const getCartTotal = () => cart.reduce((t, item) => t + parseInt(item.finalPrice || item.price), 0);
  const renderProductCard = (p) => {
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        key={p.id} 
        className="product-card glass-card" 
        onClick={() => navigate('product', { ...p, finalPrice })}
      >
        <div className="product-img-wrap"><img src={p.img} alt={p.name}/></div>
        <div className="product-info">
          <h3 style={{fontSize:'13px', fontWeight:'500'}}>{p.name}</h3>
          <p style={{color:'var(--accent)', fontWeight:'bold'}}>₹{finalPrice}</p>
        </div>
      </motion.div>
    );
  };

  const renderHome = () => (
    <div className="view-container">
      <div className="hero-text" style={{padding:'50px 20px', textAlign:'center'}}>
        <h1 style={{fontSize:'42px', fontStyle:'italic', fontWeight:'400'}}>Feel the breeze.</h1>
        <p style={{color:'var(--text-muted)'}}>Premium modest wear for the modern soul.</p>
      </div>
      
      <div className="products-grid">
        {products.map(renderProductCard)}
      </div>
    </div>
  );
  return (
    <>
      {/* 🌌 NIGHT SKY STARS (Only visible in dark mode) */}
      {isDarkMode && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0}}>
          {stars.map(s => (
            <div key={s.id} style={{position:'absolute', top:s.top, left:s.left, width:'2px', height:'2px', background:'#fff', borderRadius:'50%', opacity:0.5}}></div>
          ))}
        </div>
      )}

      <header>
        <div className="icon-btn" onClick={() => setIsSidebarOpen(true)}><i className="fas fa-bars"></i></div>
        <div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div>
        <div className="header-icons">
          <i className={isDarkMode ? 'fas fa-sun icon-btn' : 'fas fa-moon icon-btn'} onClick={toggleTheme}></i>
          <div className="icon-btn" style={{position:'relative'}} onClick={() => navigate('cart')}>
            <i className="fas fa-shopping-bag"></i>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>

      {isSidebarOpen && <div className="sidebar-overlay" style={{display:'block'}} onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar glass-card ${isSidebarOpen ? 'open' : ''}`} style={{borderRadius:'0 20px 20px 0'}}>
        <div className="sidebar-header"><h3 className="brand-font">Explore</h3></div>
        <div className="sidebar-links">
          <div onClick={() => navigate('home')}><i className="fas fa-cloud"></i> Sky Home</div>
          <div onClick={() => navigate('shop')}><i className="fas fa-tshirt"></i> Products</div>
          <div onClick={() => navigate('orders')}><i className="fas fa-box-open"></i> My Orders</div>
          <div onClick={() => navigate('chat')}><i className="fas fa-comment-dots"></i> Support</div>
        </div>
      </div>
      <main style={{position:'relative', zIndex:1}}>
        <AnimatePresence mode="wait">
          {currentView === 'home' && renderHome()}
          {currentView === 'cart' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="view-container">
              <h2 className="section-title">Your Bag</h2>
              {cart.map((item, i) => (
                <div key={i} className="glass-card" style={{display:'flex', gap:'15px', padding:'15px', margin:'0 15px 15px'}}>
                  <img src={item.img} style={{width:'60px', borderRadius:'8px'}} alt=""/>
                  <div><h4>{item.name}</h4><b>₹{item.finalPrice}</b></div>
                </div>
              ))}
              <div style={{padding:'20px'}}>
                <button className="btn-buy" style={{width:'100%', background:'var(--accent)', padding:'15px', borderRadius:'12px'}} onClick={() => setIsCheckoutOpen(true)}>Proceed to Checkout</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {isCheckoutOpen && (
        <div className="modal" style={{display:'flex'}}><div className="modal-content glass-card" style={{border:'none', padding:'30px'}}>
          <h2 className="brand-font" style={{marginBottom:'20px'}}>Checkout</h2>
          <div style={{textAlign:'left', marginBottom:'20px'}}>
             <div onClick={()=>setPaymentMethod('COD')} style={{padding:'15px', background: paymentMethod==='COD'?'var(--accent)':'rgba(0,0,0,0.05)', color:paymentMethod==='COD'?'#fff':'var(--text-main)', borderRadius:'12px', cursor:'pointer', marginBottom:'10px'}}>Cash on Delivery 💵</div>
             <div onClick={()=>setPaymentMethod('UPI')} style={{padding:'15px', background: paymentMethod==='UPI'?'var(--accent)':'rgba(0,0,0,0.05)', color:paymentMethod==='UPI'?'#fff':'var(--text-main)', borderRadius:'12px', cursor:'pointer'}}>Pay Online (UPI) 📱</div>
          </div>
          <button className="btn-buy" style={{width:'100%', padding:'15px', background:'var(--text-main)', color:'var(--bg-sky)', borderRadius:'12px'}} onClick={() => {showToast("🚀 Order soaring to you!", "success"); setIsCheckoutOpen(false); navigate('home');}}>Place Order</button>
          <p onClick={() => setIsCheckoutOpen(false)} style={{marginTop:'15px', cursor:'pointer', opacity:0.6}}>Cancel</p>
        </div></div>
      )}

      {/* CARTOON TOAST */}
      <div className={`toast-notification glass-card ${toast.show ? 'show' : ''}`} style={{background:'var(--card-glass)', color:'var(--accent)', border:'2px solid var(--accent)'}}>
        {toast.msg}
      </div>

      <footer style={{textAlign:'center', padding:'40px 20px', opacity:0.6, fontSize:'12px'}}>
        <p>© 2026 RS Fashion. Built on clouds.</p>
      </footer>
    </>
  );
}
