import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [upiScreenshot, setUpiScreenshot] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState([]);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'user', text: 'Hi', time: '01:12' },
    { id: 2, sender: 'admin', text: 'Hello, how can we help you?', time: '11:26' }
  ]);

  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');

    const savedUser = localStorage.getItem('rsFashionUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('rsFashionCart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedReads = localStorage.getItem('rsReadNotifs');
    if (savedReads) setReadNotifs(JSON.parse(savedReads));

    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));

        const notifRes = await fetch(DB_URL + 'notifications.json');
        const notifData = await notifRes.json();
        if(notifData) setNotifications(Object.keys(notifData).map(k => ({ id: k, ...notifData[k] })).reverse());
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
    if(view === 'orders') fetchMyOrders();
  };

  const handleSearchIconClick = () => {
    navigate('shop');
    setTimeout(() => document.getElementById('main-search-input')?.focus(), 100);
  };

  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length;
  const handleOpenNotifs = () => {
    setIsNotifOpen(true);
    const allIds = notifications.map(n => n.id);
    setReadNotifs(allIds);
    localStorage.setItem('rsReadNotifs', JSON.stringify(allIds));
  };

  const addToCart = (product) => {
    if(product.status === 'Out of Stock' || product.stock <= 0) return showToast("⚠️ Sorry, Sold Out!", "error");
    const finalPrice = product.discount > 0 ? Math.round(product.price - (product.price * (product.discount/100))) : product.price;
    const newCart = [...cart, { ...product, finalPrice }];
    setCart(newCart);
    localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("🛍️ Added to cart!", "success");
    if(currentUser?.dbKey) fetch(`${DB_URL}users/${currentUser.dbKey}.json`, { method: 'PATCH', body: JSON.stringify({ cart: newCart }) });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart]; newCart.splice(index, 1);
    setCart(newCart); localStorage.setItem('rsFashionCart', JSON.stringify(newCart));
    showToast("🗑️ Item removed", "info");
  };

  const getCartTotal = () => cart.reduce((t, item) => t + parseInt(item.finalPrice || item.price), 0);
  const getFinalTotal = () => Math.max(0, (checkoutMode === 'single' ? (selectedProduct.finalPrice || selectedProduct.price) : getCartTotal()) - discountAmount);

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if(s.includes('pending')) return 'var(--warning)';
    if(s.includes('reject') || s.includes('cancel')) return 'var(--error)';
    return 'var(--success)';
  };
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
      if(data) { for(let k in data) { if(data[k].phone === phone) { existingUser = data[k]; existingKey = k; break; } } }
      
      let userObj;
      if(existingUser) { userObj = existingUser; userObj.dbKey = existingKey; } 
      else {
        userObj = { name, phone, userId: `RS${Math.floor(10000+Math.random()*90000)}`, cart: [] };
        const postRes = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify(userObj) });
        const postData = await postRes.json(); userObj.dbKey = postData.name;
      }
      setCurrentUser(userObj); localStorage.setItem('rsFashionUser', JSON.stringify(userObj));
      setIsLoginOpen(false); navigate('home'); showToast("🎉 Welcome back!", "success");
    } catch(e) { showToast("⚠️ Network Error", "error"); }
  };

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
          showToast("📸 Screenshot Attached!", "info");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
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
      setIsCheckoutOpen(false); setUpiScreenshot(''); setDiscountAmount(0);
      if(checkoutMode === 'cart') { setCart([]); localStorage.setItem('rsFashionCart', JSON.stringify([])); }
      if (window.confetti) window.confetti({ particleCount: 150, spread: 80 });
      showToast("🚀 Order Placed!", "success"); navigate('orders');
    } catch(e) { showToast("❌ Error", "error"); }
  };

  const handleSendMessage = (e) => {
    e.preventDefault(); if(!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setChatMessages([...chatMessages, { id: Date.now(), sender: 'user', text: chatInput, time }]);
    setChatInput('');
  };
  const renderProductCard = (p) => {
    const soldOut = p.status === 'Out of Stock' || p.stock <= 0;
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    return (
      <div key={p.id} className="product-card" onClick={() => navigate('product', { ...p, finalPrice })}>
        {p.discount > 0 && !soldOut && <div style={{position:'absolute', top:'10px', right:'10px', background:'var(--error)', color:'white', padding:'4px 8px', fontSize:'11px', fontWeight:'bold', borderRadius:'4px', zIndex:2}}>{p.discount}% OFF</div>}
        <div className="product-img-wrap"><img src={p.img} style={{filter: soldOut ? 'grayscale(1)' : 'none'}} alt={p.name}/></div>
        <div className="product-info"><h3 className="p-title" style={{fontSize:'13px'}}>{p.name}</h3><p className="p-price">₹{finalPrice}</p></div>
      </div>
    );
  };

  return (
    <>
      <header>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}><div className="icon-btn" onClick={() => setIsSidebarOpen(true)}><i className="fas fa-bars"></i></div><div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div></div>
        <div className="header-icons">
          <div className="icon-btn" style={{position:'relative'}} onClick={handleOpenNotifs}><i className={`fas fa-bell ${unreadCount > 0 ? 'shake-anim' : ''}`}></i>{unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}</div>
          <i className="fas fa-search icon-btn" onClick={handleSearchIconClick}></i> 
          <i className="far fa-user icon-btn" onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}></i> 
          <div className="icon-btn" style={{position:'relative'}} onClick={() => navigate('cart')}><i className="fas fa-shopping-bag"></i>{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}</div>
        </div>
      </header>

      {isSidebarOpen && <div className="sidebar-overlay" style={{display:'block'}} onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header"><h3 className="brand-font">Menu</h3><i className="fas fa-times" style={{fontSize:'20px', cursor:'pointer'}} onClick={() => setIsSidebarOpen(false)}></i></div>
        <div className="sidebar-links">
          <div onClick={() => navigate('home')}><i className="fas fa-home"></i> Home</div>
          <div onClick={() => navigate('shop')}><i className="fas fa-tshirt"></i> All Products</div>
          <div onClick={() => navigate('cart')}><i className="fas fa-shopping-cart"></i> Cart</div>
          {/* ✨ NEW SEPARATE ORDERS BUTTON ✨ */}
          <div onClick={() => currentUser ? navigate('orders') : setIsLoginOpen(true)}><i className="fas fa-box-open"></i> My Orders</div>
          <div onClick={() => currentUser ? navigate('profile') : setIsLoginOpen(true)}><i className="fas fa-user-circle"></i> My Profile</div>
          <div onClick={() => navigate('chat')}><i className="fas fa-headphones-alt" style={{color:'var(--accent)'}}></i> Live Support</div>
          <div onClick={() => navigate('about')}><i className="fas fa-code"></i> About Developer</div>
        </div>
        <div style={{padding: '20px', fontSize: '12px', borderTop:'1px solid var(--border-color)'}}>{currentUser ? <><span style={{color:'var(--text-muted)'}}>User: </span><b>{currentUser.name}</b><br/>ID: {currentUser.userId}</> : 'Not Logged In'}</div>
      </div>

      <div style={{minHeight: '80vh'}}>
        {currentView === 'home' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}} style={{padding: 0}}>
            <div className="hero-slider">{heroImages.map((img, i) => (<div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`} style={{backgroundImage: `url(${img})`}}><div className="hero-text"><h1 style={{fontSize:'32px'}}>{i === 0 ? 'Modest & Elegant' : 'Premium Quality'}</h1></div></div>))}</div>
            <h2 className="section-title">Shop by Category</h2>
            <div className="categories">
                {['Chiffon', 'Cotton', 'Abayas', 'Undercaps'].map(cat => (
                  <div key={cat} className="category-item" onClick={() => navigate('shop')}><img src="https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=150" className="category-img" alt={cat}/><p className="category-name">{cat}</p></div>
                ))}
            </div>
            <h2 className="section-title">Trending Now</h2><div className="products-grid">{products.slice(0,8).map(renderProductCard)}</div>
          </motion.div>
        )}
        {currentView === 'shop' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
            <h2 className="section-title">All Collection</h2>
            <div style={{padding: '0 5%'}}><input id="main-search-input" type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border-color)', marginBottom:'20px', background:'var(--card-bg)', color:'var(--text-main)', fontFamily:'Jost'}} /></div>
            <div className="products-grid">{products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(renderProductCard)}</div>
          </motion.div>
        )}

        {/* ✨ NEW SEPARATE MY ORDERS PAGE ✨ */}
        {currentView === 'orders' && (
          <motion.div className="view-container" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}}>
            <h2 className="section-title">My Orders</h2>
            <div style={{maxWidth:'600px', margin:'0 auto'}}>
                {orders.length === 0 ? (
                  <div style={{textAlign:'center', padding:'50px 0'}}><i className="fas fa-box-open" style={{fontSize:'50px', color:'#ddd', marginBottom:'15px'}}></i><p>No orders found yet.</p></div>
                ) : orders.map((o, i) => (
                  <div key={i} className="order-card" style={{borderLeft: `5px solid ${getStatusColor(o.status)}`}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px'}}>
                      <div style={{flex:1}}><h4 style={{fontSize:'15px', fontWeight:'600'}}>{o.items}</h4><p style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'5px'}}>🚚 {o.deliveryTime}</p></div>
                      <span className="status-badge" style={{background: getStatusColor(o.status)}}>{o.status}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-color)', paddingTop:'10px'}}>
                      <p style={{fontSize:'13px', fontWeight:'700'}}>Amount: ₹{o.totalAmount}</p>
                      <span style={{fontSize:'10px', background:'#eee', padding:'3px 8px', borderRadius:'4px', color:'#666'}}>{o.paymentType}</span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {currentView === 'chat' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
            <div className="chat-wrapper">
              <div className="chat-messages">
                <div className="secure-badge">Concierge Support Channel</div>
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-bubble ${msg.sender === 'user' ? 'sent' : 'received'}`}>
                    <p style={{margin:0}}>{msg.text}</p>
                    <div style={{fontSize:'9px', textAlign:'right', marginTop:'5px', opacity:0.7}}>{msg.time}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} style={{padding:'15px', background:'#1d1d29', display:'flex', gap:'10px'}}><input type="text" className="chat-input" placeholder="Type..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} /><button type="submit" style={{background:'none', border:'none', color:'white'}}><i className="fas fa-paper-plane"></i></button></form>
            </div>
          </motion.div>
        )}

        {currentView === 'profile' && currentUser && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}><div className="dev-card" style={{textAlign:'center'}}><div style={{width:'80px', height:'80px', background:'var(--accent)', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 15px'}}><i className="fas fa-user"></i></div><h3>{currentUser.name}</h3><p>User ID: {currentUser.userId}</p><button onClick={() => {setCurrentUser(null); localStorage.removeItem('rsFashionUser'); navigate('home');}} style={{marginTop:'30px', padding:'12px', background:'var(--error)', color:'white', border:'none', borderRadius:'8px', width:'100%', fontWeight:'bold'}}>Logout</button></div></motion.div>
        )}
        {currentView === 'product' && selectedProduct && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}><div className="product-detail-container"><div className="detail-img-box"><img src={selectedProduct.img} alt={selectedProduct.name} /></div><div className="detail-info-box"><h1 className="detail-title">{selectedProduct.name}</h1><p className="detail-price">₹{selectedProduct.finalPrice}</p><div className="btn-group"><button className="btn-add" onClick={() => addToCart(selectedProduct)}>Add to Cart</button><button className="btn-buy" onClick={() => { if(!currentUser) return setIsLoginOpen(true); setCheckoutMode('single'); setIsCheckoutOpen(true); }}>Buy Now</button></div></div></div></motion.div>
        )}

        {currentView === 'cart' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}><h2 className="section-title">Your Cart</h2>{cart.length === 0 ? <p style={{textAlign:'center'}}>Empty.</p> : <>{cart.map((item, i) => (<div key={i} style={{display:'flex', alignItems:'center', gap:'15px', padding:'15px', borderBottom:'1px solid var(--border-color)'}}><img src={item.img} style={{width:'60px', borderRadius:'5px'}} alt={item.name}/><div><h4>{item.name}</h4><b>₹{item.finalPrice}</b></div><i className="fas fa-trash" style={{color:'var(--error)', marginLeft:'auto'}} onClick={() => removeFromCart(i)}></i></div>))}<div style={{textAlign:'right', fontSize:'18px', margin:'20px 0'}}>Total: ₹{getCartTotal()}</div><button className="btn-buy" style={{width:'100%', padding:'15px'}} onClick={() => { if(!currentUser) return setIsLoginOpen(true); setCheckoutMode('cart'); setIsCheckoutOpen(true); }}>Checkout All Items</button></>}</motion.div>
        )}
      </div>

      {isCheckoutOpen && (() => {
        const upiLink = `upi://pay?pa=yourname@upi&pn=RS%20Fashion&am=${getFinalTotal()}&cu=INR`;
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return (<div className="modal" style={{display:'flex'}}><div className="modal-content"><span className="close-modal" onClick={() => setIsCheckoutOpen(false)}>&times;</span><h2 className="brand-font">Checkout</h2><form onSubmit={processCheckout} style={{textAlign:'left'}}><input name="add1" placeholder="Address..." required /><input name="pin" placeholder="Pincode..." required /><p style={{fontSize:'14px', color:'var(--error)', textAlign:'right'}}>Total: ₹{getFinalTotal()}</p><div style={{marginTop:'10px'}}><div onClick={() => setPaymentMethod('COD')} style={{padding:'10px', border: paymentMethod==='COD'?'1px solid var(--accent)':'1px solid #eee', borderRadius:'8px', cursor:'pointer', marginBottom:'10px'}}>💵 Cash on Delivery</div><div onClick={() => setPaymentMethod('UPI')} style={{padding:'10px', border: paymentMethod==='UPI'?'1px solid var(--accent)':'1px solid #eee', borderRadius:'8px', cursor:'pointer'}}>📱 Pay Online (UPI)</div>{paymentMethod==='UPI' && <div style={{textAlign:'center', marginTop:'10px'}}>{isMobileDevice ? <a href={upiLink} style={{background:'#6528F7', color:'white', padding:'10px', display:'block', borderRadius:'8px', textDecoration:'none'}}>Pay in UPI App</a> : <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`} alt="QR"/>}<input type="file" accept="image/*" onChange={handleImageUpload} style={{marginTop:'10px'}}/></div>}</div><button type="submit" style={{width:'100%', padding:'15px', background:'var(--accent)', color:'white', border:'none', borderRadius:'8px', marginTop:'15px', fontWeight:'bold'}}>🚀 Confirm Order Now 🎁</button></form></div></div>);
      })()}

      <AnimatePresence>{isNotifOpen && <div className="modal" style={{display:'flex'}}><div className="modal-content"><div style={{display:'flex', justifyContent:'space-between'}}><h2 className="brand-font">Notifications</h2><i className="fas fa-times" onClick={() => setIsNotifOpen(false)}></i></div>{notifications.map(n => (<div key={n.id} style={{padding:'10px', background:'#f9f9f9', borderRadius:'8px', marginTop:'10px', textAlign:'left'}}><p style={{fontSize:'13px', fontWeight:600}}>{n.title}</p><p style={{fontSize:'12px', opacity:0.8}}>{n.message}</p></div>))}</div></div>}</AnimatePresence>
      {isLoginOpen && (<div className="modal" style={{display:'flex'}}><div className="modal-content"><span className="close-modal" onClick={() => setIsLoginOpen(false)}>&times;</span><h2 className="brand-font">Login</h2><form onSubmit={processLogin}><input name="name" placeholder="Full Name" required /><input name="phone" placeholder="Phone" required /><button type="submit" style={{width:'100%', padding:'12px', background:'var(--primary)', color:'white', border:'none', borderRadius:'8px'}}>Login</button></form></div></div>)}
      <div className={`toast-notification ${toast.show ? 'show' : ''}`} style={{background: toast.type==='error'?'var(--error)':(toast.type==='info'?'var(--info)':'var(--success)'), color:'white'}}>{toast.msg}</div>
      <footer style={{ background: '#111', color: '#fff', textAlign: 'center', padding: '50px 20px', marginTop: '40px' }}><h2 className="brand-font">RS FASHION</h2><p style={{ fontSize: '12px', opacity:0.6 }}>© 2026 RS Fashion. Developed by Robiul Islam.</p></footer>
    </>
  );
}
