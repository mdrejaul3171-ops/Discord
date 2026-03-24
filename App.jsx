import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";
const heroImages = [
  "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d4ed1b16?auto=format&fit=crop&q=80"
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // home, shop, product, cart, profile
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
  
  // New Checkout State
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [upiScreenshot, setUpiScreenshot] = useState('');

  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');

    const savedUser = localStorage.getItem('rsFashionUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('rsFashionCart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } catch (e) { console.error(e); }
    };
    fetchDB();
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroImages.length), 4000);
      return () => clearInterval(timer);
    }
  }, [currentView]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('rsDarkModeMain', !isDarkMode);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const navigate = (view, product = null) => {
    setSelectedProduct(product);
    setCurrentView(view);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
    if(view === 'profile') fetchMyOrders();
  };

  const handleSearchIconClick = () => {
    navigate('shop');
    document.getElementById('main-search-input')?.focus();
  };

  const addToCart = (product) => {
    if(product.status === 'Out of Stock' || product.stock <= 0) return showToast("⚠️ Sorry, Sold Out!", "error");
    const finalPrice = product.discount > 0 ? Math.round(product.price - (product.price * (product.discount/100))) : product.price;
    const newCart = [...cart, { ...product, finalPrice }];
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("🛍️ Item added to cart!", "success");
    if(currentUser?.dbKey) fetch(`${DB_URL}users/${currentUser.dbKey}.json`, { method: 'PATCH', body: JSON.stringify({ cart: newCart }) });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart]; newCart.splice(index, 1);
    setCart(newCart); localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
  };

  const getCartTotal = () => cart.reduce((t, item) => t + (item.finalPrice || item.price), 0);
  const getFinalTotal = () => (checkoutMode === 'single' ? (selectedProduct.finalPrice || selectedProduct.price) : getCartTotal()) - discountAmount;

  const fetchMyOrders = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(DB_URL + 'orders.json'); const data = await res.json();
      if(data) setOrders(Object.keys(data).map(k => data[k]).filter(o => o.userId === currentUser.userId).reverse());
    } catch(e) {}
  };

  const processLogin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value; const phone = e.target.phone.value;
    try {
      const res = await fetch(DB_URL + 'users.json'); const data = await res.json();
      let existingUser = null; let existingKey = null;
      if(data) { Object.keys(data).forEach(k => { if(data[k].phone === phone) { existingUser = data[k]; existingKey = k; } }); }
      
      let userObj;
      if(existingUser) { userObj = existingUser; userObj.dbKey = existingKey; } 
      else {
        userObj = { name, phone, userId: `RS${Math.floor(10000+Math.random()*90000)}`, cart: [] };
        const postRes = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify(userObj) });
        const postData = await postRes.json(); userObj.dbKey = postData.name;
      }
      setCurrentUser(userObj); localStorage.setItem('rsFashionUser', JSON.stringify(userObj));
      setIsLoginOpen(false); navigate('profile'); showToast("✅ Logged in successfully!");
    } catch(e) { showToast("Network Error", "error"); }
  };

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";
const heroImages = [
  "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d4ed1b16?auto=format&fit=crop&q=80"
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // home, shop, product, cart, profile
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
  
  // New Checkout State
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [upiScreenshot, setUpiScreenshot] = useState('');

  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');

    const savedUser = localStorage.getItem('rsFashionUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('rsFashionCart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } catch (e) { console.error(e); }
    };
    fetchDB();
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroImages.length), 4000);
      return () => clearInterval(timer);
    }
  }, [currentView]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('rsDarkModeMain', !isDarkMode);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const navigate = (view, product = null) => {
    setSelectedProduct(product);
    setCurrentView(view);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
    if(view === 'profile') fetchMyOrders();
  };

  const handleSearchIconClick = () => {
    navigate('shop');
    document.getElementById('main-search-input')?.focus();
  };

  const addToCart = (product) => {
    if(product.status === 'Out of Stock' || product.stock <= 0) return showToast("⚠️ Sorry, Sold Out!", "error");
    const finalPrice = product.discount > 0 ? Math.round(product.price - (product.price * (product.discount/100))) : product.price;
    const newCart = [...cart, { ...product, finalPrice }];
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("🛍️ Item added to cart!", "success");
    if(currentUser?.dbKey) fetch(`${DB_URL}users/${currentUser.dbKey}.json`, { method: 'PATCH', body: JSON.stringify({ cart: newCart }) });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart]; newCart.splice(index, 1);
    setCart(newCart); localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
  };

  const getCartTotal = () => cart.reduce((t, item) => t + (item.finalPrice || item.price), 0);
  const getFinalTotal = () => (checkoutMode === 'single' ? (selectedProduct.finalPrice || selectedProduct.price) : getCartTotal()) - discountAmount;

  const fetchMyOrders = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(DB_URL + 'orders.json'); const data = await res.json();
      if(data) setOrders(Object.keys(data).map(k => data[k]).filter(o => o.userId === currentUser.userId).reverse());
    } catch(e) {}
  };

  const processLogin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value; const phone = e.target.phone.value;
    try {
      const res = await fetch(DB_URL + 'users.json'); const data = await res.json();
      let existingUser = null; let existingKey = null;
      if(data) { Object.keys(data).forEach(k => { if(data[k].phone === phone) { existingUser = data[k]; existingKey = k; } }); }
      
      let userObj;
      if(existingUser) { userObj = existingUser; userObj.dbKey = existingKey; } 
      else {
        userObj = { name, phone, userId: `RS${Math.floor(10000+Math.random()*90000)}`, cart: [] };
        const postRes = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify(userObj) });
        const postData = await postRes.json(); userObj.dbKey = postData.name;
      }
      setCurrentUser(userObj); localStorage.setItem('rsFashionUser', JSON.stringify(userObj));
      setIsLoginOpen(false); navigate('profile'); showToast("✅ Logged in successfully!");
    } catch(e) { showToast("Network Error", "error"); }
  };
  // RE-ADDED IMAGE RESIZER
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas'); const scale = 400 / img.width;
          canvas.width = 400; canvas.height = img.height * scale;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          setUpiScreenshot(canvas.toDataURL('image/jpeg', 0.6));
          showToast("Screenshot Attached! ✅");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'RAIZO10') {
      setDiscountAmount(100); showToast("Coupon Applied!");
    } else { showToast("Invalid Coupon", "error"); }
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'UPI' && !upiScreenshot) return showToast("⚠️ Upload payment screenshot!", "error");
    
    const orderData = {
      userId: currentUser.userId, customerName: currentUser.name, phone: currentUser.phone,
      address: `${e.target.add1.value}, ${e.target.add2.value} - ${e.target.pin.value}`,
      items: checkoutMode === 'single' ? selectedProduct.name : cart.map(i=>i.name).join(", "),
      totalAmount: getFinalTotal(), status: "Pending", deliveryTime: "Awaiting Confirmation", 
      paymentType: paymentMethod, upiScreenshot: upiScreenshot
    };
    try {
      await fetch(DB_URL + 'orders.json', { method: 'POST', body: JSON.stringify(orderData) });
      setIsCheckoutOpen(false);
      if(checkoutMode === 'cart') { setCart([]); localStorage.setItem('rsFashionCart', JSON.stringify([])); }
      if (window.confetti) window.confetti({ particleCount: 100, spread: 70 });
      showToast("🎉 Order Placed Successfully!"); navigate('profile');
    } catch(e) { showToast("Failed to place order.", "error"); }
  };

  const renderProductCard = (p) => {
    const soldOut = p.status === 'Out of Stock' || p.stock <= 0;
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    return (
      <div key={p.id} className="product-card" onClick={() => navigate('product', { ...p, finalPrice })}>
        {soldOut && <div style={{position:'absolute', top:'10px', left:'10px', background:'#1e1e2d', color:'white', padding:'4px 8px', fontSize:'10px', fontWeight:'bold', borderRadius:'4px', zIndex:2}}>Sold Out</div>}
        {p.discount > 0 && !soldOut && <div style={{position:'absolute', top:'10px', right:'10px', background:'var(--error)', color:'white', padding:'4px 8px', fontSize:'10px', fontWeight:'bold', borderRadius:'4px', zIndex:2}}>{p.discount}% OFF</div>}
        <img src={p.img} style={{filter: soldOut ? 'grayscale(1)' : 'none'}} className="product-img" alt={p.name}/>
        <div className="product-info">
          <h3 style={{fontSize:'14px', fontWeight:'500', marginBottom:'5px'}}>{p.name}</h3>
          <p style={{fontSize:'15px', color:'var(--accent)', fontWeight:'600'}}>{p.discount > 0 ? <span style={{textDecoration:'line-through', color:'var(--text-muted)', fontSize:'11px', marginRight:'5px'}}>₹{p.price}</span> : ''}₹{finalPrice}</p>
        </div>
      </div>
    );
  };
  return (
    <>
      <header>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <div className="icon-btn" onClick={() => setIsSidebarOpen(true)}><i className="fas fa-bars"></i></div>
          <div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div>
        </div>
        <div className="header-icons">
          <i className={isDarkMode ? 'fas fa-sun icon-btn' : 'fas fa-moon icon-btn'} onClick={toggleTheme}></i> 
          <i className="fas fa-search icon-btn" onClick={handleSearchIconClick}></i> 
          <i className="far fa-user icon-btn" onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}></i> 
          <div className="icon-btn" style={{position:'relative'}} onClick={() => navigate('cart')}>
            <i className="fas fa-shopping-bag"></i>{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>

      {/* FULLY RESTORED SIDEBAR FROM SCREENSHOT */}
      {isSidebarOpen && <div className="sidebar-overlay" style={{display:'block'}} onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header"><h3 className="brand-font">Menu</h3><i className="fas fa-times" style={{fontSize:'20px', cursor:'pointer', color:'var(--text-muted)'}} onClick={() => setIsSidebarOpen(false)}></i></div>
        <div className="sidebar-links">
          <div onClick={handleSearchIconClick}><i className="fas fa-search" style={{width:'20px'}}></i> Search</div>
          <div onClick={() => navigate('home')}><i className="fas fa-home" style={{width:'20px'}}></i> Home</div>
          <div onClick={() => navigate('shop')}><i className="fas fa-tshirt" style={{width:'20px'}}></i> All Products</div>
          <div onClick={() => navigate('cart')}><i className="fas fa-shopping-cart" style={{width:'20px'}}></i> Cart</div>
          <div onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}><i className="fas fa-user" style={{width:'20px'}}></i> My Profile</div>
          <div onClick={() => alert("Live Chat coming soon!")}><i className="fas fa-headset" style={{width:'20px'}}></i> Live Support</div>
          <div onClick={() => window.location.href='mailto:robiulislam786786u@gmail.com'}><i className="fas fa-envelope" style={{width:'20px'}}></i> Contact Us</div>
          <div onClick={() => alert("Developed by Robiul Islam")}><i className="fas fa-info-circle" style={{width:'20px'}}></i> About Developer</div>
        </div>
        <div style={{padding: '20px', fontSize: '12px', borderTop:'1px solid var(--border-color)'}}>
          {currentUser ? <><span style={{color:'var(--text-muted)'}}>Logged in as </span><b>{currentUser.name}</b><br/>ID: {currentUser.userId}</> : 'Not Logged In'}
        </div>
      </div>

      <div style={{minHeight: '80vh'}}>
        {currentView === 'home' && (
          <motion.div className="view-section" initial={{opacity:0}} animate={{opacity:1}}>
            <div className="hero-slider">
              {heroImages.map((img, i) => (
                <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`} style={{backgroundImage: `url(${img})`}}>
                  <div className="hero-text"><h1 style={{fontSize:'38px', marginBottom:'10px'}}>{i === 0 ? 'Modest & Elegant' : 'Premium Quality'}</h1><p>Premium Quality Abayas</p></div>
                </div>
              ))}
            </div>
            <div className="view-container">
              <h2 className="section-title">Shop by Category</h2>
              <div className="category-row">
                {['Chiffon', 'Cotton', 'Abayas', 'Undercaps'].map(cat => (
                  <div key={cat} className="category-item" onClick={() => navigate('shop')}><img src="https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=150" className="category-img" alt={cat}/><p style={{fontSize:'13px', marginTop:'5px'}}>{cat}</p></div>
                ))}
              </div>
              <h2 className="section-title">Trending Now</h2>
              <div className="products-grid">{products.slice(0,8).map(renderProductCard)}</div>
            </div>
          </motion.div>
        )}

        {currentView === 'shop' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
            <h2 className="section-title">All Products</h2>
            <input id="main-search-input" type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{width:'100%', padding:'15px', borderRadius:'6px', border:'1px solid var(--border-color)', marginBottom:'20px', background:'transparent', color:'var(--text-main)', fontFamily:'Jost'}} />
            <div className="products-grid">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(renderProductCard)}
            </div>
          </motion.div>
        )}

        {currentView === 'product' && selectedProduct && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
            <div className="detail-layout">
              <div><img src={selectedProduct.img} className="detail-img" alt={selectedProduct.name} /></div>
              <div>
                <p style={{color:'var(--text-muted)', fontSize:'12px'}}>Product ID: {selectedProduct.id}</p>
                <h1 style={{fontSize:'28px', margin:'10px 0'}}>{selectedProduct.name}</h1>
                <p style={{fontSize:'24px', color:'var(--accent)', fontWeight:'bold', marginBottom:'20px'}}>₹{selectedProduct.finalPrice}</p>
                <ul style={{listStyle:'none', marginBottom:'30px', fontSize:'14px', color:'var(--text-muted)'}}>
                  <li style={{marginBottom:'8px'}}><i className="fas fa-check-circle" style={{color:'var(--success)', marginRight:'8px'}}></i>Premium Quality Fabric</li>
                  <li style={{marginBottom:'8px'}}><i className="fas fa-check-circle" style={{color:'var(--success)', marginRight:'8px'}}></i>Cash on Delivery Available</li>
                </ul>
                <div style={{display:'flex', gap:'15px', marginBottom:'30px'}}>
                  <button className="btn-outline" onClick={() => addToCart(selectedProduct)}>Add to Cart</button>
                  <button className="btn-main" onClick={() => { if(!currentUser) return setIsLoginOpen(true); setCheckoutMode('single'); setIsCheckoutOpen(true); }}>Buy Now</button>
                </div>
              </div>
            </div>
            <div style={{marginTop:'60px', borderTop:'1px solid var(--border-color)', paddingTop:'40px'}}>
              <h2 className="section-title">You May Also Like</h2>
              <div className="products-grid">{products.filter(p => p.id !== selectedProduct.id).sort(()=>0.5-Math.random()).slice(0,4).map(renderProductCard)}</div>
            </div>
          </motion.div>
        )}

        {currentView === 'cart' && (
          <motion.div className="view-container" style={{maxWidth:'700px', margin:'0 auto'}} initial={{opacity:0}} animate={{opacity:1}}>
            <h2 className="section-title">Your Cart</h2>
            {cart.length === 0 ? <p style={{textAlign:'center'}}>Cart is empty.</p> : (
              <>
                {cart.map((item, i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:'15px', padding:'15px', borderBottom:'1px solid var(--border-color)'}}>
                    <img src={item.img} style={{width:'70px', height:'90px', objectFit:'cover', borderRadius:'4px'}} alt={item.name}/>
                    <div style={{flex:1}}><h4 style={{fontSize:'15px', fontWeight:'500'}}>{item.name}</h4><p style={{fontWeight:'bold', color:'var(--accent)'}}>₹{item.finalPrice}</p></div>
                    <i className="fas fa-trash" style={{color:'var(--error)', cursor:'pointer', fontSize:'18px'}} onClick={() => removeFromCart(i)}></i>
                  </div>
                ))}
                <div style={{textAlign:'right', fontSize:'20px', fontWeight:'bold', margin:'20px 0'}}>Total: ₹{getCartTotal()}</div>
                <button className="btn-main" onClick={() => { if(!currentUser) return setIsLoginOpen(true); setCheckoutMode('cart'); setIsCheckoutOpen(true); }}>Checkout All Items</button>
              </>
            )}
          </motion.div>
        )}

        {currentView === 'profile' && currentUser && (
          <motion.div className="view-container" style={{maxWidth:'600px', margin:'0 auto'}} initial={{opacity:0}} animate={{opacity:1}}>
            <h2 className="section-title">My Profile</h2>
            <div style={{background:'var(--card-bg)', padding:'30px', borderRadius:'8px', border:'1px solid var(--border-color)', textAlign:'center'}}>
              <div style={{width:'80px', height:'80px', background:'var(--accent)', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 15px'}}><i className="fas fa-user"></i></div>
              <h3>{currentUser.name}</h3><p style={{color:'var(--text-muted)', fontSize:'12px'}}>User ID: {currentUser.userId}</p>
              <div style={{marginTop:'30px', textAlign:'left'}}>
                <h3 style={{fontSize:'18px', borderBottom:'1px solid var(--border-color)', paddingBottom:'10px', marginBottom:'15px'}}>My Orders</h3>
                {orders.length === 0 ? <p>No orders yet.</p> : orders.map((o, i) => (
                  <div key={i} style={{background:'var(--bg-color)', padding:'15px', borderRadius:'6px', marginBottom:'15px', border:'1px solid var(--border-color)'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}><b>{o.items}</b><span style={{background:'var(--accent)', color:'white', padding:'4px 10px', borderRadius:'4px', fontSize:'11px'}}>{o.status}</span></div>
                    <p style={{fontSize:'12px', marginTop:'10px', color:'var(--text-muted)'}}>Amount: ₹{o.totalAmount} ({o.paymentType})</p>
                  </div>
                ))}
              </div>
              <button onClick={() => {setCurrentUser(null); localStorage.removeItem('rsFashionUser'); navigate('home');}} style={{marginTop:'20px', padding:'12px', background:'var(--error)', color:'white', border:'none', borderRadius:'4px', width:'100%', fontWeight:'bold', cursor:'pointer'}}>Logout</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div className="modal"><div className="modal-content">
          <span className="close-modal" onClick={() => setIsLoginOpen(false)}>&times;</span>
          <h2 className="brand-font" style={{marginBottom:'20px'}}>User Login</h2>
          <form onSubmit={processLogin}>
            <input name="name" type="text" placeholder="Full Name" required />
            <input name="phone" type="tel" placeholder="Mobile Number" required />
            <button type="submit" className="btn-main">Login / Generate ID</button>
          </form>
        </div></div>
      )}

      {/* EXACT CHECKOUT MODAL FROM SCREENSHOT */}
      {isCheckoutOpen && (
        <div className="modal"><div className="modal-content">
          <span className="close-modal" onClick={() => setIsCheckoutOpen(false)}>&times;</span>
          <h2 className="brand-font" style={{marginBottom:'15px', fontSize:'20px'}}>Complete Order</h2>
          <form onSubmit={processCheckout} style={{textAlign:'left'}}>
            <p style={{fontSize:'12px', fontWeight:'600', marginBottom:'5px'}}>Shipping Details</p>
            <input name="add1" type="text" placeholder="Address Line 1 (House, Street)" required />
            <input name="add2" type="text" placeholder="Area / Landmark" required />
            <input name="pin" type="text" placeholder="Pincode" required />
            
            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
              <input type="text" placeholder="Enter Coupon Code" value={couponCode} onChange={(e)=>setCouponCode(e.target.value)} style={{marginBottom:0}}/>
              <button type="button" onClick={applyCoupon} style={{background:'var(--accent)', color:'white', border:'none', borderRadius:'6px', padding:'0 15px', cursor:'pointer', fontFamily:'Jost'}}>Apply</button>
            </div>

            <div style={{textAlign:'right', fontSize:'13px', fontWeight:'600', marginBottom:'15px'}}>
              <p>Subtotal: ₹{checkoutMode === 'single' ? (selectedProduct.finalPrice || selectedProduct.price) : getCartTotal()}</p>
              <p style={{color:'var(--error)'}}>Total to Pay: ₹{getFinalTotal()}</p>
            </div>

            <div className="payment-box">
              <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'10px'}}><i className="fas fa-wallet"></i> Select Payment Method:</p>
              <label style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', cursor:'pointer', fontSize:'14px'}}>
                <input type="radio" name="pay" value="COD" checked={paymentMethod==='COD'} onChange={()=>setPaymentMethod('COD')}/> Cash on Delivery
              </label>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px'}}>
                <input type="radio" name="pay" value="UPI" checked={paymentMethod==='UPI'} onChange={()=>setPaymentMethod('UPI')}/> Pay Online (UPI)
              </label>
              
              {paymentMethod === 'UPI' && (
                <div style={{marginTop:'15px', padding:'15px', border:'1px dashed #6528F7', borderRadius:'8px', background:'rgba(101, 40, 247, 0.05)', textAlign:'center'}}>
                  <p style={{fontSize:'13px', fontWeight:'bold', color:'#6528F7', marginBottom:'10px'}}>Step 1: Pay ₹{getFinalTotal()}</p>
                  <a href={`upi://pay?pa=yourname@upi&pn=RS Fashion&am=${getFinalTotal()}&cu=INR`} target="_blank" style={{display:'inline-block', background:'#6528F7', color:'white', textDecoration:'none', padding:'10px 15px', borderRadius:'6px', fontSize:'13px', fontWeight:'bold', marginBottom:'15px', width:'100%'}}><i className="fas fa-mobile-alt"></i> Open UPI App to Pay</a>
                  <p style={{fontSize:'13px', fontWeight:'bold', color:'var(--error)', marginBottom:'5px'}}>Step 2: Upload Screenshot</p>
                  <label style={{display:'block', padding:'15px', border:'1px dashed var(--text-muted)', cursor:'pointer', borderRadius:'6px', fontSize:'12px'}}>
                    <i className="fas fa-cloud-upload-alt" style={{fontSize:'20px', display:'block', marginBottom:'5px'}}></i> Tap here to attach
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload}/>
                  </label>
                  {upiScreenshot && <img src={upiScreenshot} style={{width:'100%', marginTop:'10px', borderRadius:'4px'}}/>}
                </div>
              )}
            </div>

            <button type="submit" className="btn-main" style={{background:'linear-gradient(90deg, #d4af37, #b58b22)'}}>🚀 Confirm & Order Now 🎁</button>
          </form>
        </div></div>
      )}

      <div className={`toast-notification ${toast.show ? 'show' : ''}`} style={{background: toast.type==='error'?'var(--error)':'var(--success)', color:'white'}}>{toast.msg}</div>

      <footer style={{ background: '#111', color: '#fff', textAlign: 'center', padding: '50px 20px', marginTop: '40px' }}>
        <h2 className="brand-font" style={{ letterSpacing: '2px', marginBottom: '10px' }}>RS FASHION</h2>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '25px' }}>Premium modest wear shipped directly to you.</p>
        <button style={{background:'#ff0000', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'4px', fontFamily:'Jost', fontWeight:'500', cursor:'pointer'}}><i className="fab fa-youtube" style={{marginRight:'8px'}}></i> Subscribe on YouTube</button>
      </footer>
    </>
  );
}


import React, { useState, useEffect } from 'react';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";

const heroImages = [
  "https://images.unsplash.com/photo-1550614000-4b95d4ed1b16?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80"
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // home, shop, product, cart, profile
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orders, setOrders] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState('single');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // --- INITIALIZE & FETCH FIREBASE ---
  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');

    const savedUser = localStorage.getItem('rsFashionUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('rsFashionCart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } catch (e) { console.error(e); }
    };
    fetchDB();
  }, []);

  // --- AUTO SLIDER ---
  useEffect(() => {
    if (currentView === 'home') {
      const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroImages.length), 4000);
      return () => clearInterval(timer);
    }
  }, [currentView]);

  // --- HELPER FUNCTIONS (YOUR VANILLA LOGIC) ---
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('rsDarkModeMain', !isDarkMode);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const navigate = (view, product = null) => {
    setSelectedProduct(product);
    setCurrentView(view);
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
    window.scrollTo(0, 0);
    if(view === 'profile') fetchMyOrders();
  };

  const addToCart = (product) => {
    if(product.status === 'Out of Stock' || product.stock <= 0) return showToast("⚠️ Sorry, Sold Out!", "error");
    const finalPrice = product.discount > 0 ? Math.round(product.price - (product.price * (product.discount/100))) : product.price;
    const newCart = [...cart, { ...product, finalPrice }];
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("🛍️ Item added to cart!", "success");
    if(currentUser?.dbKey) fetch(`${DB_URL}users/${currentUser.dbKey}.json`, { method: 'PATCH', body: JSON.stringify({ cart: newCart }) });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
  };

  const getCartTotal = () => cart.reduce((t, item) => t + (item.finalPrice || item.price), 0);

  const fetchMyOrders = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(DB_URL + 'orders.json');
      const data = await res.json();
      if(data) {
        const myOrders = Object.keys(data).map(k => data[k]).filter(o => o.userId === currentUser.userId).reverse();
        setOrders(myOrders);
      }
    } catch(e) {}
  };

  const processLogin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value; const phone = e.target.phone.value;
    try {
      const res = await fetch(DB_URL + 'users.json'); const data = await res.json();
      let existingUser = null; let existingKey = null;
      if(data) { Object.keys(data).forEach(k => { if(data[k].phone === phone) { existingUser = data[k]; existingKey = k; } }); }
      
      let userObj;
      if(existingUser) { userObj = existingUser; userObj.dbKey = existingKey; } 
      else {
        userObj = { name, phone, userId: `RS${Math.floor(10000+Math.random()*90000)}`, cart: [] };
        const postRes = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify(userObj) });
        const postData = await postRes.json(); userObj.dbKey = postData.name;
      }
      setCurrentUser(userObj); localStorage.setItem('rsFashionUser', JSON.stringify(userObj));
      setIsLoginOpen(false); navigate('profile'); showToast("✅ Logged in successfully!");
    } catch(e) { showToast("Network Error", "error"); }
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    const totalAmount = checkoutMode === 'single' ? (selectedProduct.finalPrice || selectedProduct.price) : getCartTotal();
    const orderData = {
      userId: currentUser.userId, customerName: currentUser.name, phone: currentUser.phone,
      address: `${e.target.add1.value}, ${e.target.add2.value} - ${e.target.pin.value}`,
      items: checkoutMode === 'single' ? selectedProduct.name : cart.map(i=>i.name).join(", "),
      totalAmount, status: "Pending", deliveryTime: "Awaiting Confirmation", paymentType: paymentMethod
    };
    try {
      await fetch(DB_URL + 'orders.json', { method: 'POST', body: JSON.stringify(orderData) });
      setIsCheckoutOpen(false);
      if(checkoutMode === 'cart') { setCart([]); localStorage.setItem('rsFashionCart', JSON.stringify([])); }
      showToast("🎉 Order Placed Successfully!"); navigate('profile');
    } catch(e) { showToast("Failed to place order.", "error"); }
  };
  // --- YOUR EXACT RENDER BLOCKS ---
  const renderProductCard = (p) => {
    const soldOut = p.status === 'Out of Stock' || p.stock <= 0;
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    return (
      <div key={p.id} className="product-card" onClick={() => navigate('product', { ...p, finalPrice })}>
        {soldOut && <div style={{position:'absolute', top:'10px', left:'10px', background:'#1e1e2d', color:'white', padding:'4px 8px', fontSize:'11px', fontWeight:'bold', borderRadius:'4px', zIndex:2}}>Sold Out</div>}
        {p.discount > 0 && !soldOut && <div style={{position:'absolute', top:'10px', right:'10px', background:'#f64e60', color:'white', padding:'4px 8px', fontSize:'11px', fontWeight:'bold', borderRadius:'4px', zIndex:2}}>{p.discount}% OFF</div>}
        <div className="product-img-wrap"><img src={p.img} style={{filter: soldOut ? 'grayscale(1)' : 'none'}} alt={p.name}/></div>
        <div className="product-info">
          <h3 className="p-title">{p.name}</h3>
          <p className="p-price">{p.discount > 0 ? <span style={{textDecoration:'line-through', color:'#888', fontSize:'11px', marginRight:'5px'}}>₹{p.price}</span> : ''}₹{finalPrice}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <header>
        <div className="header-left">
          <div className="menu-icon" onClick={() => setIsSidebarOpen(true)}><i className="fas fa-bars"></i></div>
          <div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div>
        </div>
        <div className="header-right">
          <i className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'} onClick={toggleTheme}></i> 
          <i className="fas fa-search" onClick={() => {setIsSearchOpen(!isSearchOpen); setSearchQuery('');}}></i> 
          <i className="far fa-user" onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}></i> 
          <div className="cart-icon-wrap" onClick={() => navigate('cart')}>
            <i className="fas fa-shopping-bag"></i><span className="cart-count">{cart.length}</span>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="search-container" style={{display: 'block'}}>
          <input type="text" className="search-input" placeholder="Search for products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>
      )}

      {isSidebarOpen && <div className="sidebar-overlay" style={{display:'block'}} onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header"><h3 style={{fontFamily:'Playfair Display'}}>Menu</h3><i className="fas fa-times" style={{fontSize:'20px', cursor:'pointer'}} onClick={() => setIsSidebarOpen(false)}></i></div>
        <div className="sidebar-links">
          <div onClick={() => navigate('home')}><i className="fas fa-home"></i> Home</div>
          <div onClick={() => navigate('shop')}><i className="fas fa-tshirt"></i> All Products</div>
          <div onClick={() => navigate('cart')}><i className="fas fa-shopping-cart"></i> Cart</div>
          <div onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}><i className="fas fa-user"></i> My Profile</div>
        </div>
        <div style={{padding: '20px', textAlign: 'center', fontSize: '14px'}}>{currentUser ? `Logged in as ${currentUser.name}` : 'Not Logged In'}</div>
      </div>

      <div style={{minHeight: '80vh'}}>
        {currentView === 'home' && (
          <div className="view-section">
            <div className="slider-container">
              {heroImages.map((img, i) => (
                <div key={i} className={`slide ${i === currentSlide ? 'active' : ''}`} style={{backgroundImage: `url(${img})`}}>
                  <div className="slide-content"><h1>{i === 0 ? 'Modest & Elegant' : 'Premium Quality'}</h1></div>
                </div>
              ))}
            </div>
            <h2 className="section-title">Shop by Category</h2>
            <section className="categories">
              {['Chiffon', 'Cotton', 'Abayas', 'Undercaps'].map(cat => (
                <div key={cat} className="category-item" onClick={() => navigate('shop')}><img src="https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=150" className="category-img" alt={cat}/><p>{cat}</p></div>
              ))}
            </section>
            <h2 className="section-title">Trending Now</h2>
            <div className="products-grid">{products.slice(0,8).map(renderProductCard)}</div>
          </div>
        )}

        {currentView === 'shop' && (
          <div className="view-section" style={{paddingTop:'20px'}}>
            <h2 className="section-title">All Products</h2>
            <div className="products-grid">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(renderProductCard)}
            </div>
          </div>
        )}

        {currentView === 'product' && selectedProduct && (
          <div className="view-section">
            <div className="product-detail-container">
              <div className="detail-img-box"><img src={selectedProduct.img} alt={selectedProduct.name} /></div>
              <div className="detail-info-box">
                <p style={{color:'var(--text-gray)', fontSize:'13px', marginBottom:'5px'}}>Product ID: {selectedProduct.id}</p>
                <h1 className="detail-title">{selectedProduct.name}</h1>
                <p className="detail-price">₹{selectedProduct.finalPrice}</p>
                <ul className="features">
                  <li><i className="fas fa-check-circle"></i> Premium Quality Fabric</li>
                  <li><i className="fas fa-check-circle"></i> Cash on Delivery (COD) Available</li>
                </ul>
                <div className="btn-group">
                  <button className="btn-add" onClick={() => addToCart(selectedProduct)}>Add to Cart</button>
                  <button className="btn-buy" onClick={() => { if(!currentUser) return setIsLoginOpen(true); setCheckoutMode('single'); setIsCheckoutOpen(true); }}>Buy Now</button>
                </div>
              </div>
            </div>
            
            {/* YOU MAY ALSO LIKE */}
            <div style={{marginTop:'50px', borderTop:'1px solid var(--border-color)'}}>
              <h2 className="section-title">You May Also Like</h2>
              <div className="products-grid">{products.filter(p => p.id !== selectedProduct.id).slice(0,4).map(renderProductCard)}</div>
            </div>
          </div>
        )}

        {currentView === 'cart' && (
          <div className="view-section"><div className="cart-container">
            <h2 className="section-title">Your Cart</h2>
            {cart.length === 0 ? <p style={{textAlign:'center'}}>Cart is empty.</p> : cart.map((item, i) => (
              <div key={i} className="cart-item"><img src={item.img} alt={item.name}/><div><h4 style={{fontSize:'15px', fontWeight:'500'}}>{item.name}</h4><p style={{fontWeight:'bold'}}>₹{item.finalPrice}</p></div><i className="fas fa-trash" style={{color:'#d9534f', marginLeft:'auto', cursor:'pointer'}} onClick={() => removeFromCart(i)}></i></div>
            ))}
            <div className="cart-total">Total: ₹{getCartTotal()}</div>
            <button className="order-all-btn" onClick={() => { if(!currentUser) return setIsLoginOpen(true); if(cart.length===0) return; setCheckoutMode('cart'); setIsCheckoutOpen(true); }}><i className="fas fa-shopping-cart"></i> Checkout All Items</button>
          </div></div>
        )}

        {currentView === 'profile' && currentUser && (
          <div className="view-section"><div className="about-container">
            <h2 className="section-title">My Profile</h2>
            <div className="dev-card" style={{textAlign:'center'}}>
              <div style={{width:'80px', height:'80px', background:'#c5a880', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 15px'}}><i className="fas fa-user"></i></div>
              <h3>{currentUser.name}</h3><p style={{marginBottom:'15px'}}>User ID: <strong>{currentUser.userId}</strong></p>
              <div className="contact-info" style={{textAlign:'left'}}><p><strong><i className="fas fa-phone"></i> Mobile:</strong> {currentUser.phone}</p></div>
              <h3 style={{marginTop:'25px', textAlign:'left', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>My Orders</h3>
              <div style={{textAlign:'left', marginTop:'15px'}}>
                {orders.length === 0 ? <p>No orders yet.</p> : orders.map((o, i) => (
                  <div key={i} style={{background:'var(--card-bg)', padding:'15px', borderRadius:'8px', marginBottom:'15px', border:'1px solid var(--border-color)'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}><b>{o.items}</b><span style={{background:'#c5a880', color:'white', padding:'4px 10px', borderRadius:'4px', fontSize:'11px'}}>{o.status}</span></div>
                    <p style={{fontSize:'13px', marginTop:'10px'}}>🚚 {o.deliveryTime}</p><p style={{fontSize:'12px', color:'var(--text-gray)'}}>Total: ₹{o.totalAmount} ({o.paymentType})</p>
                  </div>
                ))}
              </div>
              <button onClick={() => {setCurrentUser(null); localStorage.removeItem('rsFashionUser'); navigate('home');}} style={{marginTop:'20px', padding:'12px', background:'#d9534f', color:'white', border:'none', borderRadius:'5px', width:'100%', fontWeight:'bold'}}>Logout</button>
            </div>
          </div></div>
        )}
      </div>

      {isLoginOpen && (
        <div className="modal" style={{display:'flex'}}><div className="modal-content">
          <span className="close-modal" onClick={() => setIsLoginOpen(false)}>&times;</span>
          <h2 style={{fontFamily:'Playfair Display', marginBottom:'20px'}}>User Login</h2>
          <form onSubmit={processLogin}>
            <input name="name" type="text" placeholder="Full Name" required />
            <input name="phone" type="tel" placeholder="Mobile Number" required />
            <button type="submit" style={{width:'100%', padding:'12px', background:'#1e1e2d', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold'}}>Login / Generate ID</button>
          </form>
        </div></div>
      )}

      {isCheckoutOpen && (
        <div className="modal" style={{display:'flex'}}><div className="modal-content" style={{maxHeight:'90vh', overflowY:'auto'}}>
          <span className="close-modal" onClick={() => setIsCheckoutOpen(false)}>&times;</span>
          <h2 style={{fontFamily:'Playfair Display', marginBottom:'15px'}}>Complete Order</h2>
          <form onSubmit={processCheckout}>
            <p style={{fontSize:'13px', fontWeight:'bold', marginBottom:'5px', textAlign:'left'}}>Shipping Details</p>
            <input name="add1" type="text" placeholder="Address Line 1" required />
            <input name="add2" type="text" placeholder="Area / Landmark" required />
            <input name="pin" type="text" placeholder="Pincode" required />
            <div style={{background:'var(--light-bg)', padding:'15px', borderRadius:'8px', border:'1px solid var(--border-color)', marginBottom:'15px', textAlign:'left'}}>
              <p style={{fontWeight:'bold', marginBottom:'10px', fontSize:'14px'}}>Payment Method:</p>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}><input type="radio" name="pay" value="COD" checked={paymentMethod==='COD'} onChange={()=>setPaymentMethod('COD')}/> Cash on Delivery</label>
            </div>
            <button type="submit" style={{width:'100%', padding:'15px', background:'#1e1e2d', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Order Now (₹{checkoutMode === 'single' ? selectedProduct.finalPrice : getCartTotal()})</button>
          </form>
        </div></div>
      )}

      <div className={`toast-notification ${toast.show ? 'show' : ''}`} style={{background: toast.type==='error'?'#d9534f':'#25D366', color:'white'}}>{toast.msg}</div>

      <footer>
        <h2 style={{fontFamily:'Playfair Display', marginBottom:'10px'}}>RS FASHION</h2>
        <p style={{fontSize:'14px', marginBottom:'20px'}}>Premium modest wear shipped directly to you.</p>
        <div className="footer-social-box">
          <a href="#" className="social-btn yt"><i className="fab fa-youtube"></i> Subscribe on YouTube</a>
          <a href="#" className="social-btn ig"><i className="fab fa-instagram"></i> Follow on Instagram</a>
        </div>
        <p style={{fontSize:'12px', color:'#aaa', marginTop:'20px'}}>© 2026 RS Fashion. Developed by Robiul Islam.</p>
      </footer>
    </>
  );
}