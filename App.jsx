import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";
const SLIDERS = ["./slider1.jpg", "./slider2.jpg", "./slider3.jpg"];
const CATS = [
  { name: "Chiffon", img: "./cat1.jpg" },
  { name: "Cotton", img: "./cat2.jpg" },
  { name: "Abayas", img: "./cat3.jpg" },
  { name: "Undercaps", img: "./cat1.jpg" }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
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
  const [upiScreenshot, setUpiScreenshot] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [stars, setStars] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    const isDark = localStorage.getItem('rsDarkModeMain') === 'true';
    setIsDarkMode(isDark);
    if(isDark) document.body.classList.add('dark-mode');
    const savedUser = localStorage.getItem('rsFashionUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const fetchDB = async () => {
      try {
        const res = await fetch(DB_URL + 'products.json');
        const data = await res.json();
        if(data) setProducts(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } catch (e) {}
    };
    fetchDB();
    setStars(Array.from({ length: 40 }).map((_, i) => ({
      id: i, top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
      size: Math.random() * 2 + 'px', delay: Math.random() * 5 + 's'
    })));
  }, []);

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
    if(product) setSelectedProduct(product);
    setCurrentView(view);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
    if(view === 'orders') fetchMyOrders();
    if(view === 'chat' && currentUser) fetchMessages();
  };

  const fetchMessages = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(`${DB_URL}chat_${currentUser.userId}.json`);
      const data = await res.json();
      if (data) setChatMessages(Object.values(data));
    } catch(e) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    const msg = { text: chatInput, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setChatMessages([...chatMessages, msg]);
    setChatInput('');
    try {
      await fetch(`${DB_URL}chat_${currentUser.userId}.json`, { method: 'POST', body: JSON.stringify(msg) });
    } catch(e) {}
  };

  const fetchMyOrders = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(DB_URL + 'orders.json');
      const data = await res.json();
      if(data) setOrders(Object.keys(data).map(k => data[k]).filter(o => o.userId === currentUser.userId).reverse());
    } catch(e) {}
  };
  const processLogin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value; const phone = e.target.phone.value;
    try {
      const res = await fetch(DB_URL + 'users.json'); const data = await res.json();
      let user = null;
      if(data) { for(let k in data) { if(data[k].phone === phone) { user = { ...data[k], dbKey: k }; break; } } }
      if(!user) {
        const uid = `RS${Math.floor(10000+Math.random()*90000)}`;
        const post = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify({ name, phone, userId: uid }) });
        const postD = await post.json(); user = { name, phone, userId: uid, dbKey: postD.name };
      }
      setCurrentUser(user); localStorage.setItem('rsFashionUser', JSON.stringify(user));
      setIsLoginOpen(false); showToast("Welcome!");
    } catch(e) { showToast("Login failed", "error"); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUpiScreenshot(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    const orderData = {
      userId: currentUser.userId, customerName: currentUser.name,
      items: checkoutMode === 'single' ? selectedProduct.name : cart.map(i=>i.name).join(", "),
      totalAmount: checkoutMode === 'single' ? selectedProduct.finalPrice : cart.reduce((t,i)=>t+i.finalPrice,0),
      status: "Pending", deliveryTime: "Awaiting Confirmation", paymentType: paymentMethod
    };
    try {
      await fetch(DB_URL + 'orders.json', { method: 'POST', body: JSON.stringify(orderData) });
      setIsCheckoutOpen(false); showToast("Order Placed!"); navigate('orders');
    } catch(e) {}
  };
  const processLogin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value; const phone = e.target.phone.value;
    try {
      const res = await fetch(DB_URL + 'users.json'); const data = await res.json();
      let user = null;
      if(data) { for(let k in data) { if(data[k].phone === phone) { user = { ...data[k], dbKey: k }; break; } } }
      if(!user) {
        const uid = `RS${Math.floor(10000+Math.random()*90000)}`;
        const post = await fetch(DB_URL + 'users.json', { method: 'POST', body: JSON.stringify({ name, phone, userId: uid }) });
        const postD = await post.json(); user = { name, phone, userId: uid, dbKey: postD.name };
      }
      setCurrentUser(user); localStorage.setItem('rsFashionUser', JSON.stringify(user));
      setIsLoginOpen(false); showToast("Welcome!");
    } catch(e) { showToast("Login failed", "error"); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUpiScreenshot(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    const orderData = {
      userId: currentUser.userId, customerName: currentUser.name,
      items: checkoutMode === 'single' ? selectedProduct.name : cart.map(i=>i.name).join(", "),
      totalAmount: checkoutMode === 'single' ? selectedProduct.finalPrice : cart.reduce((t,i)=>t+i.finalPrice,0),
      status: "Pending", deliveryTime: "Awaiting Confirmation", paymentType: paymentMethod
    };
    try {
      await fetch(DB_URL + 'orders.json', { method: 'POST', body: JSON.stringify(orderData) });
      setIsCheckoutOpen(false); showToast("Order Placed!"); navigate('orders');
    } catch(e) {}
  };
  const renderProductCard = (p) => {
    const finalPrice = p.discount > 0 ? Math.round(p.price - (p.price * (p.discount/100))) : p.price;
    return (
      <div key={p.id} className="product-card glass" onClick={() => navigate('product', { ...p, finalPrice })}>
        <div className="product-img-wrap"><img src={p.img} alt=""/></div>
        <div className="product-info"><h3>{p.name}</h3><b style={{color:'var(--accent)'}}>₹{finalPrice}</b></div>
      </div>
    );
  };

  return (
    <>
      {isDarkMode && <div style={{position:'fixed',inset:0,zIndex:-1,pointerEvents:'none'}}>
        {stars.map(s => <div key={s.id} className="star" style={{top:s.top,left:s.left,width:s.size,height:s.size}}></div>)}
      </div>}
      <header className="glass">
        <i className="fas fa-bars" onClick={() => setIsSidebarOpen(true)}></i>
        <div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div>
        <div className="header-icons">
          <i className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'} onClick={toggleTheme}></i>
          <div onClick={() => navigate('cart')} style={{position:'relative'}}>
            <i className="fas fa-shopping-bag"></i>{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>

      <div className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-links" style={{paddingTop:'50px'}}>
          <div onClick={()=>navigate('home')}><i className="fas fa-home"></i> Home</div>
          <div onClick={()=>navigate('shop')}><i className="fas fa-tshirt"></i> Products</div>
          <div onClick={()=>navigate('orders')}><i className="fas fa-box"></i> My Orders</div>
          <div onClick={()=>navigate('chat')}><i className="fas fa-headset"></i> Support</div>
        </div>
      </div>
      <div style={{minHeight:'80vh'}}>
        {currentView === 'home' && (
          <div>
            <div style={{height:'50vh', background:'#000', position:'relative', overflow:'hidden'}}>
               {SLIDERS.map((img, i) => (<div key={i} style={{position:'absolute', inset:0, backgroundImage:`url(${img})`, backgroundSize:'cover', opacity:i===currentSlide?0.7:0, transition:'1s'}}></div>))}
               <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'}}><h1>Sky Collection</h1></div>
            </div>
            <div className="view-container">
              <div className="categories">
                {CATS.map(c => <div key={c.name} className="category-item" onClick={()=>navigate('shop')}><img src={c.img} className="category-img"/><p>{c.name}</p></div>)}
              </div>
              <h2 className="section-title">Trending</h2>
              <div className="products-grid">{products.slice(0,8).map(renderProductCard)}</div>
            </div>
          </div>
        )}
        {currentView === 'shop' && <div className="view-container"><div className="products-grid">{products.map(renderProductCard)}</div></div>}
        {currentView === 'orders' && <div className="view-container">
          {orders.map((o,i) => <div key={i} className="glass" style={{padding:'15px',marginBottom:'10px',borderRadius:'10px'}}><b>{o.items}</b><p>₹{o.totalAmount} - {o.status}</p></div>)}
        </div>}
        {currentView === 'chat' && <div className="view-container">
          <div className="glass chat-wrapper">
             <div className="chat-messages">{chatMessages.map((m,i)=><div key={i} className={`chat-bubble ${m.sender==='user'?'sent':'received'}`}>{m.text}</div>)}</div>
             <form onSubmit={handleSendMessage} style={{display:'flex',padding:'10px'}}><input className="glass" style={{flex:1,padding:'10px',borderRadius:'20px'}} value={chatInput} onChange={e=>setChatInput(e.target.value)}/><button type="submit">Go</button></form>
          </div>
        </div>}
      </div>
      {isCheckoutOpen && (
        <div className="modal" style={{display:'flex'}}>
          <div className="modal-content glass">
            <h2 onClick={()=>setIsCheckoutOpen(false)}>Close X</h2>
            <form onSubmit={processCheckout}>
              <input name="add1" placeholder="Address" required />
              <div onClick={()=>setPaymentMethod('COD')}>COD</div>
              <div onClick={()=>setPaymentMethod('UPI')}>UPI</div>
              <button type="submit" className="btn-main">Confirm</button>
            </form>
          </div>
        </div>
      )}

      {isLoginOpen && (
        <div className="modal" style={{display:'flex'}}>
          <div className="modal-content glass">
            <form onSubmit={processLogin}>
              <input name="name" placeholder="Name" required />
              <input name="phone" placeholder="Phone" required />
              <button type="submit" className="btn-main">Login</button>
            </form>
          </div>
        </div>
      )}

      <div className={`toast-notification glass ${toast.show ? 'show' : ''}`} style={{background:'var(--accent)',color:'white'}}>{toast.msg}</div>
      <footer style={{textAlign:'center',padding:'40px',opacity:0.5}}>© 2026 RS Fashion</footer>
    </>
  );
}
