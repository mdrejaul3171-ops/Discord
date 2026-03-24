import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const DB_URL = "https://leon-41242-default-rtdb.firebaseio.com/";

// Auto-Slider Images for Hero
const heroImages = [
  "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d4ed1b16?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607581561706-0346a060e7dc?auto=format&fit=crop&q=80"
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // home, all-products, product, cart
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // FETCH FIREBASE DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${DB_URL}products.json`);
        const data = await res.json();
        if (data) {
          const loadedProducts = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setProducts(loadedProducts);
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  // AUTO SLIDER LOGIC
  useEffect(() => {
    if (currentView !== 'home') return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Changes every 4 seconds
    return () => clearInterval(timer);
  }, [currentView]);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  // NAVIGATION & ACTIONS
  const navigate = (view, product = null) => {
    setSelectedProduct(product);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const addToCart = (p) => {
    setCart([...cart, p]);
    alert("Added to cart! 🛍️"); // Replace with toast later
  };

  const getSuggestedProducts = () => {
    if (!selectedProduct) return [];
    return products.filter(p => p.id !== selectedProduct.id).slice(0, 4);
  };
  // VIEW: HOME PAGE
  const renderHome = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      {/* Auto-Sliding Hero */}
      <div className="hero-slider">
        {heroImages.map((img, index) => (
          <img key={index} src={img} className={`hero-slide ${index === currentSlide ? 'active' : ''}`} alt="Hero" />
        ))}
        <div className="hero-text">
          <h1 style={{ fontSize: '42px', letterSpacing: '2px', marginBottom: '10px' }}>Modest & Elegant</h1>
          <p style={{ fontSize: '16px', letterSpacing: '1px', marginBottom: '20px' }}>Premium Quality Abayas</p>
          <button className="btn-main" style={{ background: '#fff', color: '#000' }} onClick={() => navigate('all-products')}>Shop Collection</button>
        </div>
      </div>

      {/* Categories */}
      <div className="view-container" style={{ paddingBottom: '0' }}>
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-row">
          {['Chiffon', 'Cotton', 'Abayas', 'Undercaps'].map((cat, i) => (
            <div key={i} className="category-item" onClick={() => navigate('all-products')}>
              <img src={`https://source.unsplash.com/random/100x100/?fabric,${cat}`} className="category-img" alt={cat} />
              <p style={{ fontSize: '12px', marginTop: '8px' }}>{cat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <div className="view-container">
        <h2 className="section-title">Trending Now</h2>
        <div className="product-grid">
          {products.slice(0, 8).map((p) => (
            <div key={p.id} className="product-card" onClick={() => navigate('product', p)}>
              <img src={p.img} alt={p.name} className="product-img" />
              <div className="product-info">
                <h3 style={{ fontSize: '14px', marginBottom: '5px', fontWeight: '400' }}>{p.name}</h3>
                <p style={{ fontWeight: '600', color: 'var(--accent)' }}>₹{p.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('all-products')}>View All Products</button>
        </div>
      </div>
    </motion.div>
  );

  // VIEW: ALL PRODUCTS PAGE (Like Amazon/Flipkart)
  const renderAllProducts = () => (
    <motion.div className="view-container" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="brand-font" style={{ fontSize: '28px' }}>Complete Collection</h2>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{products.length} Products</span>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card" onClick={() => navigate('product', p)}>
            <img src={p.img} alt={p.name} className="product-img" />
            <div className="product-info">
              <h3 style={{ fontSize: '14px', marginBottom: '5px', fontWeight: '400' }}>{p.name}</h3>
              <p style={{ fontWeight: '600', color: 'var(--accent)' }}>₹{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
  // VIEW: PRODUCT DETAIL & "YOU MAY ALSO LIKE"
  const renderProduct = () => {
    if (!selectedProduct) return null;
    const suggestions = getSuggestedProducts();

    return (
      <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="detail-layout">
          <div className="detail-img-col">
            <img src={selectedProduct.img} style={{ width: '100%', borderRadius: '8px' }} alt={selectedProduct.name} />
          </div>
          <div className="detail-info-col">
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>PRODUCT ID: {selectedProduct.id}</p>
            <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{selectedProduct.name}</h1>
            <h2 style={{ color: 'var(--accent)', fontSize: '24px', marginBottom: '20px' }}>₹{selectedProduct.price}</h2>
            
            <ul style={{ listStyle: 'none', marginBottom: '30px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '10px' }}><i className="fas fa-check-circle" style={{ color: 'var(--success)', marginRight: '8px' }}></i> Premium Quality Fabric</li>
              <li style={{ marginBottom: '10px' }}><i className="fas fa-check-circle" style={{ color: 'var(--success)', marginRight: '8px' }}></i> Cash on Delivery (COD) Available</li>
            </ul>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => addToCart(selectedProduct)}>Add to Cart</button>
              <button className="btn-main" style={{ flex: 1 }} onClick={() => navigate('cart')}>Buy Now</button>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Leave a Review</h3>
              <textarea placeholder="Write your review here..." style={{ width: '100%', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '4px', minHeight: '100px', fontFamily: 'Jost' }}></textarea>
              <button className="btn-main" style={{ marginTop: '10px', fontSize: '12px', padding: '10px 20px' }}>Submit Review</button>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        {suggestions.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-color)', paddingTop: '50px' }}>
            <h2 className="section-title">You May Also Like</h2>
            <div className="product-grid">
              {suggestions.map(p => (
                <div key={p.id} className="product-card" onClick={() => navigate('product', p)}>
                  <img src={p.img} alt={p.name} className="product-img" />
                  <div className="product-info">
                    <h3 style={{ fontSize: '14px', marginBottom: '5px', fontWeight: '400' }}>{p.name}</h3>
                    <p style={{ fontWeight: '600', color: 'var(--accent)' }}>₹{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // MAIN APP RENDER
  return (
    <>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="fas fa-bars icon-btn" style={{ fontSize: '20px' }} onClick={() => navigate('all-products')}></i>
          <div className="brand-logo" onClick={() => navigate('home')}>RS FASHION</div>
        </div>
        <div className="header-icons">
          <i className={`icon-btn ${isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}`} onClick={() => setIsDarkMode(!isDarkMode)}></i>
          <i className="icon-btn fas fa-search" onClick={() => navigate('all-products')}></i>
          <i className="icon-btn far fa-user"></i>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('cart')}>
            <i className="icon-btn fas fa-shopping-bag"></i>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentView === 'home' && renderHome()}
        {currentView === 'all-products' && renderAllProducts()}
        {currentView === 'product' && renderProduct()}
        {currentView === 'cart' && (
          <motion.div className="view-container" initial={{opacity:0}} animate={{opacity:1}}>
             <h2 className="section-title">Your Cart</h2>
             {cart.length === 0 ? <p style={{textAlign:'center'}}>Cart is empty.</p> : <p style={{textAlign:'center'}}>You have {cart.length} items. (Checkout UI Here)</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ background: '#111', color: '#fff', textAlign: 'center', padding: '50px 20px', marginTop: '40px' }}>
        <h2 className="brand-font" style={{ letterSpacing: '2px', marginBottom: '10px' }}>RS FASHION</h2>
        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>Premium modest wear shipped directly to you.</p>
        <p style={{ fontSize: '12px', color: '#666' }}>© 2026 RS Fashion. Developed by Robiul Islam.</p>
      </footer>
    </>
  );
}
