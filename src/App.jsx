import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  collection, addDoc, getDocs, doc, setDoc,
  getDoc, query, orderBy, onSnapshot, serverTimestamp,
  where
} from "firebase/firestore";

const C = {
  primary: "#FF6B35", primaryDark: "#E5501A", primaryLight: "#FF8C5A",
  secondary: "#1A1A2E", accent: "#FFD700", white: "#FFFFFF",
  offWhite: "#F8F9FA", grey: "#F0F2F5", greyMid: "#E4E6EA",
  greyDark: "#65676B", text: "#1C1E21", textLight: "#65676B",
  success: "#31A24C", error: "#FA3E3E", premium: "#FFD700",
  card: "#FFFFFF", border: "#E4E6EA",
};

const FONT = "'DM Sans', 'Nunito', sans-serif";

const CATEGORIES = ["All", "Fashion", "Electronics", "Beauty", "Food", "Sports", "Home"];

const S = {
  app: { fontFamily: FONT, background: C.offWhite, minHeight: "100vh", color: C.text, paddingBottom: 80 },
  nav: { background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, height: 56, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  logo: { fontWeight: 800, fontSize: 22, color: C.primary, letterSpacing: -0.5, cursor: "pointer" },
  page: { maxWidth: 1100, margin: "0 auto", padding: "20px 16px" },
  card: { background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  btn: (v = "primary") => ({ background: v === "primary" ? C.primary : v === "outline" ? "transparent" : v === "grey" ? C.grey : C.secondary, color: v === "outline" ? C.primary : v === "grey" ? C.text : C.white, border: v === "outline" ? `1.5px solid ${C.primary}` : "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.15s", fontFamily: FONT }),
  input: { width: "100%", background: C.grey, border: `1.5px solid transparent`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: FONT },
  label: { fontSize: 12, fontWeight: 700, color: C.greyDark, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 4, color: C.text },
  sectionSub: { fontSize: 13, color: C.greyDark, marginBottom: 16 },
  divider: { height: 1, background: C.border, margin: "20px 0" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { background: C.white, borderRadius: 18, padding: 28, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" },
  avatar: (size = 40) => ({ width: size, height: size, borderRadius: "50%", background: `${C.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, flexShrink: 0 }),
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 12px", zIndex: 100 },
  bottomBtn: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: active ? C.primary : C.greyDark, fontFamily: FONT, fontSize: 10, fontWeight: active ? 700 : 500, padding: "4px 16px" }),
  alert: (type) => ({ background: type === "success" ? "rgba(49,162,76,0.1)" : "rgba(250,62,62,0.1)", border: `1px solid ${type === "success" ? C.success : C.error}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: type === "success" ? C.success : C.error, marginBottom: 12 }),
};

// ── Auth Page ──────────────────────────────────────────────────
function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (isLogin) {
        const res = await signInWithEmailAndPassword(auth, form.email, form.password);
        setUser(res.user);
      } else {
        if (!form.name) { setError("Please enter your full name."); setLoading(false); return; }
        const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(res.user, { displayName: form.name });
        await setDoc(doc(db, "users", res.user.uid), {
          name: form.name, email: form.email, phone: form.phone,
          role: form.email === "admin@econnect.gh" ? "admin" : "user",
          followers: 0, following: 0, createdAt: serverTimestamp()
        });
        setUser(res.user);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, "").trim());
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.primary}15, ${C.offWhite})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...S.card, padding: 32, maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 32, color: C.primary, marginBottom: 4 }}>E-Connect</div>
          <div style={{ color: C.greyDark, fontSize: 13 }}>Social Commerce for African Businesses</div>
        </div>
        <div style={{ display: "flex", background: C.grey, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["Login", "Register"].map(t => (
            <button key={t} style={{ flex: 1, background: (t === "Login") === isLogin ? C.white : "transparent", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: (t === "Login") === isLogin ? C.primary : C.greyDark, fontFamily: FONT, boxShadow: (t === "Login") === isLogin ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}
              onClick={() => { setIsLogin(t === "Login"); setError(""); }}>{t}</button>
          ))}
        </div>
        {error && <div style={S.alert("error")}>{error}</div>}
        {!isLogin && (
          <>
            <label style={S.label}>Full Name</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="+233..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </>
        )}
        <label style={S.label}>Email Address</label>
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <label style={S.label}>Password</label>
        <input style={{ ...S.input, marginBottom: 20 }} type="password" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button style={{ ...S.btn(), width: "100%", padding: 14, fontSize: 15, opacity: loading ? 0.7 : 1 }} onClick={handle} disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
        </button>
        <p style={{ color: C.greyDark, fontSize: 12, textAlign: "center", marginTop: 16 }}>Admin access: admin@econnect.gh</p>
      </div>
    </div>
  );
}

// ── Add Product Modal ──────────────────────────────────────────
function AddProductModal({ user, onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", price: "", category: "Fashion", description: "", imageUrl: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.name || !form.price || !form.imageUrl) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: form.name, price: Number(form.price), category: form.category,
        description: form.description, image: form.imageUrl, stock: Number(form.stock) || 0,
        seller: user.displayName || "Unknown", sellerId: user.uid,
        likes: 0, rating: 0, reviews: 0, premium: false,
        createdAt: serverTimestamp()
      });
      onAdded(); onClose();
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Add New Product</h3>
        {error && <div style={S.alert("error")}>{error}</div>}
        <label style={S.label}>Product Name *</label>
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="e.g. Ankara Dress" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label style={S.label}>Price (GH₵) *</label>
        <input style={{ ...S.input, marginBottom: 12 }} type="number" placeholder="e.g. 150" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <label style={S.label}>Category</label>
        <select style={{ ...S.input, marginBottom: 12 }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={S.label}>Image URL * (paste a link to your product image)</label>
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        <label style={S.label}>Description</label>
        <textarea style={{ ...S.input, marginBottom: 12, height: 80, resize: "vertical" }} placeholder="Describe your product..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label style={S.label}>Stock Quantity</label>
        <input style={{ ...S.input, marginBottom: 16 }} type="number" placeholder="e.g. 10" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btn(), flex: 1, opacity: loading ? 0.7 : 1 }} onClick={handle} disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
          <button style={{ ...S.btn("outline"), flex: 1 }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ──────────────────────────────────────────────────
function Home({ user, cart, setCart, setPage, setSelectedProduct }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [cartMsg, setCartMsg] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (p) => {
    setCart(prev => { const ex = prev.find(i => i.id === p.id); if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...p, qty: 1 }]; });
    setCartMsg(true); setTimeout(() => setCartMsg(false), 2000);
  };

  return (
    <div style={S.page}>
      {cartMsg && <div style={{ position: "fixed", top: 70, right: 20, background: C.success, color: "white", borderRadius: 10, padding: "10px 18px", zIndex: 200, fontWeight: 700, fontSize: 13 }}>✅ Added to cart!</div>}

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input style={{ ...S.input, paddingLeft: 38 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 14, padding: "18px 20px", marginBottom: 20, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Welcome to E-Connect</div>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Ghana's Social Commerce Platform</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>Buy from local sellers. Support small businesses.</div>
        <button style={{ background: "white", color: C.primary, border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={() => setPage("discover")}>Discover Sellers</button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} style={{ ...S.btn(activeCategory === cat ? "primary" : "grey"), padding: "8px 16px", whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={S.sectionTitle}>Products</div>
          <div style={{ fontSize: 13, color: C.greyDark }}>{filtered.length} products available</div>
        </div>
        <button style={{ ...S.btn(), padding: "8px 14px", fontSize: 12 }} onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>Loading products...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ color: C.greyDark }}>No products yet. Be the first to add one!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...S.card, overflow: "hidden", cursor: "pointer" }} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
              <div style={{ height: 140, overflow: "hidden", background: C.grey }}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📦</div>}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                <div style={{ color: C.greyDark, fontSize: 12, marginBottom: 8 }}>{p.seller}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: C.primary, fontWeight: 800, fontSize: 16 }}>GH₵{p.price}</span>
                  <span style={{ fontSize: 11, color: C.greyDark }}>{p.category}</span>
                </div>
                <button style={{ ...S.btn(), width: "100%", marginTop: 10, padding: "8px" }} onClick={e => { e.stopPropagation(); addToCart(p); }}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddProductModal user={user} onClose={() => setShowAdd(false)} onAdded={fetchProducts} />}
    </div>
  );
}

// ── Product Detail ─────────────────────────────────────────────
function ProductDetail({ product, setCart, setPage }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!product) return;
    const q = query(collection(db, "reviews"), where("productId", "==", product.id));
    getDocs(q).then(snap => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [product]);

  if (!product) return null;

  const addToCart = () => {
    setCart(prev => { const ex = prev.find(i => i.id === product.id); if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...product, qty: 1 }]; });
    setPage("cart");
  };

  const submitReview = async () => {
    if (!review.trim()) return;
    await addDoc(collection(db, "reviews"), { productId: product.id, text: review, rating, createdAt: serverTimestamp() });
    setSubmitted(true);
    setReview("");
  };

  return (
    <div style={S.page}>
      <button style={{ ...S.btn("grey"), marginBottom: 16, color: C.text }} onClick={() => setPage("home")}>← Back</button>
      <div style={S.card}>
        <div style={{ height: 260, overflow: "hidden", borderRadius: "14px 14px 0 0", background: C.grey }}>
          {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>📦</div>}
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: C.greyDark, marginBottom: 4 }}>{product.category}</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>{product.name}</h2>
          <div style={{ color: C.greyDark, fontSize: 13, marginBottom: 12 }}>By {product.seller}</div>
          <div style={{ color: C.primary, fontWeight: 800, fontSize: 28, marginBottom: 12 }}>GH₵{product.price}</div>
          {product.description && <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>}
          <div style={{ background: C.grey, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.greyDark }}>
            📦 {product.stock || 0} items in stock · 📞 Contact: +233 54 194 0967
          </div>
          <button style={{ ...S.btn(), width: "100%", padding: 14, fontSize: 15 }} onClick={addToCart}>Add to Cart</button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={S.sectionTitle}>Reviews</div>
        {submitted && <div style={{ ...S.alert("success"), marginTop: 8 }}>✅ Review submitted!</div>}
        <div style={{ ...S.card, padding: 16, marginTop: 12, marginBottom: 16 }}>
          <label style={S.label}>Leave a Review</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[1,2,3,4,5].map(s => <button key={s} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", opacity: s <= rating ? 1 : 0.3 }} onClick={() => setRating(s)}>⭐</button>)}
          </div>
          <textarea style={{ ...S.input, height: 80, resize: "vertical", marginBottom: 10 }} placeholder="Write your review..." value={review} onChange={e => setReview(e.target.value)} />
          <button style={S.btn()} onClick={submitReview}>Submit Review</button>
        </div>
        {reviews.map(r => (
          <div key={r.id} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
            <div style={{ color: C.accent, marginBottom: 6 }}>{"⭐".repeat(r.rating)}</div>
            <div style={{ fontSize: 13 }}>{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cart ───────────────────────────────────────────────────────
function Cart({ cart, setCart, setPage, user }) {
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: user?.displayName || "", phone: "", address: "", delivery: "delivery" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    await addDoc(collection(db, "orders"), {
      items: cart, total, customerName: form.name, customerPhone: form.phone,
      address: form.address, delivery: form.delivery, userId: user?.uid || "guest",
      status: "pending", createdAt: serverTimestamp()
    });
    setDone(true); setCart([]);
    setLoading(false);
    setTimeout(() => { setDone(false); setCheckout(false); setPage("home"); }, 3000);
  };

  if (done) return (
    <div style={{ ...S.page, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontWeight: 800, fontSize: 24, color: C.success }}>Order Placed!</h2>
      <p style={{ color: C.greyDark }}>Your order has been saved. The seller will contact you at {form.phone}.</p>
      <p style={{ color: C.greyDark, fontSize: 13 }}>Support: +233 54 194 0967</p>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Your Cart</div>
      <p style={S.sectionSub}>{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <p style={{ color: C.greyDark }}>Your cart is empty.</p>
          <button style={{ ...S.btn(), marginTop: 16 }} onClick={() => setPage("home")}>Browse Products</button>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: C.grey, flexShrink: 0 }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                <div style={{ color: C.primary, fontWeight: 800 }}>GH₵{item.price} × {item.qty}</div>
              </div>
              <button style={{ background: "none", border: "none", color: C.error, cursor: "pointer", fontSize: 20 }} onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}>✕</button>
            </div>
          ))}
          <div style={{ ...S.card, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>GH₵{total}</span>
            </div>
          </div>
          <button style={{ ...S.btn(), width: "100%", padding: 14, fontSize: 15 }} onClick={() => setCheckout(true)}>Proceed to Checkout</button>
        </>
      )}
      {checkout && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Checkout · GH₵{total}</h3>
            <label style={S.label}>Full Name</label>
            <input style={{ ...S.input, marginBottom: 12 }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, marginBottom: 12 }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233..." />
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {["delivery", "pickup"].map(opt => (
                <button key={opt} style={{ ...S.btn(form.delivery === opt ? "primary" : "grey"), flex: 1 }} onClick={() => setForm({ ...form, delivery: opt })}>{opt === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}</button>
              ))}
            </div>
            {form.delivery === "delivery" && <input style={{ ...S.input, marginBottom: 12 }} placeholder="Delivery address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />}
            <div style={{ background: `${C.primary}10`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
              📞 Payment contact: +233 54 194 0967
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1, opacity: loading ? 0.7 : 1 }} onClick={handleOrder} disabled={loading}>{loading ? "Placing..." : "Place Order"}</button>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setCheckout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Messages ───────────────────────────────────────────────────
function Messages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    const q = query(collection(db, "conversations", selected.id, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [selected]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    await addDoc(collection(db, "conversations", selected.id, "messages"), {
      text: newMsg, senderId: user.uid, senderName: user.displayName, createdAt: serverTimestamp()
    });
    setNewMsg("");
  };

  return (
    <div style={S.page}>
      {!selected ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.sectionTitle}>Messages</div>
            <button style={{ ...S.btn(), padding: "8px 14px", fontSize: 12 }} onClick={() => setNewChat(true)}>+ New Chat</button>
          </div>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ color: C.greyDark }}>No messages yet. Start a conversation!</p>
            </div>
          ) : conversations.map(c => (
            <div key={c.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 8, cursor: "pointer" }} onClick={() => setSelected(c)}>
              <div style={S.avatar(48)}>💬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.participantNames?.filter(n => n !== user.displayName).join(", ") || "Chat"}</div>
                <div style={{ color: C.greyDark, fontSize: 13 }}>{c.lastMessage || "No messages yet"}</div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }} onClick={() => setSelected(null)}>←</button>
            <span style={{ fontWeight: 700 }}>{selected.participantNames?.filter(n => n !== user.displayName).join(", ")}</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.senderId === user.uid ? "flex-end" : "flex-start" }}>
                <div style={{ background: m.senderId === user.uid ? C.primary : C.grey, color: m.senderId === user.uid ? "white" : C.text, borderRadius: 14, padding: "10px 14px", maxWidth: "70%", fontSize: 13 }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input style={{ ...S.input, flex: 1 }} placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button style={{ ...S.btn(), padding: "10px 18px" }} onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────────
function Profile({ user, setPage, setUser }) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [myProducts, setMyProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(d => { if (d.exists()) setProfile(d.data()); });
    getDocs(query(collection(db, "orders"), where("userId", "==", user.uid))).then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(query(collection(db, "products"), where("sellerId", "==", user.uid))).then(snap => setMyProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const handleLogout = async () => { await signOut(auth); setUser(null); };

  return (
    <div style={{ ...S.page, paddingTop: 0 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, height: 100, borderRadius: "0 0 20px 20px", marginBottom: -40 }} />
      <div style={{ ...S.card, margin: "0 0 16px", padding: "50px 20px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: -30, left: 20, width: 72, height: 72, borderRadius: "50%", background: C.white, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>👤</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.displayName || "User"}</div>
            <div style={{ color: C.greyDark, fontSize: 13, marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ num: myProducts.length, label: "Products" }, { num: orders.length, label: "Orders" }, { num: profile?.followers || 0, label: "Followers" }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, color: C.primary }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: C.greyDark }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <button style={{ ...S.btn("outline"), padding: "8px 14px", fontSize: 12, height: "fit-content" }} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["orders", "products"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", textTransform: "capitalize" }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "orders" && (
        orders.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>No orders yet.</div> :
        orders.map(o => (
          <div key={o.id} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Order · GH₵{o.total}</div>
            <div style={{ fontSize: 13, color: C.greyDark }}>{o.items?.length} items · {o.delivery} · {o.status}</div>
          </div>
        ))
      )}

      {tab === "products" && (
        myProducts.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>No products yet. Add one from the home page!</div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {myProducts.map(p => (
            <div key={p.id} style={{ ...S.card, overflow: "hidden" }}>
              <div style={{ height: 120, background: C.grey, overflow: "hidden" }}>
                {p.image && <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ color: C.primary, fontWeight: 700 }}>GH₵{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin ──────────────────────────────────────────────────────
function Admin() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    getDocs(collection(db, "orders")).then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users")).then(snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "products")).then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Admin Dashboard</div>
      <p style={S.sectionSub}>Manage E-Connect platform</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["overview", "orders", "users", "products"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", textTransform: "capitalize" }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {[{ num: users.length, label: "Total Users", icon: "👥" }, { num: products.length, label: "Products", icon: "📦" }, { num: orders.length, label: "Total Orders", icon: "🛒" }, { num: `GH₵${totalRevenue}`, label: "Total Revenue", icon: "💰" }].map(s => (
            <div key={s.label} style={{ ...S.card, padding: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.primary }}>{s.num}</div>
              <div style={{ fontSize: 12, color: C.greyDark }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {tab === "orders" && orders.map(o => (
        <div key={o.id} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>{o.customerName} · GH₵{o.total}</div>
          <div style={{ fontSize: 13, color: C.greyDark }}>{o.customerPhone} · {o.delivery} · {o.status}</div>
        </div>
      ))}
      {tab === "users" && users.map(u => (
        <div key={u.id} style={{ ...S.card, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: C.greyDark }}>{u.email} · {u.role}</div>
          </div>
        </div>
      ))}
      {tab === "products" && products.map(p => (
        <div key={p.id} style={{ ...S.card, padding: 14, marginBottom: 10, display: "flex", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: C.grey }}>
            {p.image && <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: C.greyDark }}>GH₵{p.price} · {p.seller} · {p.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Discover ───────────────────────────────────────────────────
function Discover({ setPage, setSelectedProduct }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))).then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.seller?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Discover</div>
      <p style={S.sectionSub}>Find products and sellers on E-Connect</p>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input style={{ ...S.input, paddingLeft: 38 }} placeholder="Search products and sellers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...S.card, overflow: "hidden", cursor: "pointer" }} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
            <div style={{ height: 140, background: C.grey, overflow: "hidden" }}>
              {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📦</div>}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: C.greyDark, fontSize: 12, marginBottom: 4 }}>{p.seller}</div>
              <div style={{ color: C.primary, fontWeight: 800 }}>GH₵{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
    }
  }, []);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: FONT, color: C.primary, fontSize: 20, fontWeight: 700 }}>Loading E-Connect...</div>;
  if (!user) return <Auth setUser={setUser} />;

  const isAdmin = user.email === "admin@econnect.gh";

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "cart", icon: "🛒", label: "Cart", badge: cart.length },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  const renderPage = () => {
    switch (page) {
      case "home": return <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "discover": return <Discover setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "product": return <ProductDetail product={selectedProduct} setCart={setCart} setPage={setPage} />;
      case "cart": return <Cart cart={cart} setCart={setCart} setPage={setPage} user={user} />;
      case "messages": return <Messages user={user} />;
      case "profile": return <Profile user={user} setPage={setPage} setUser={setUser} />;
      case "admin": return isAdmin ? <Admin /> : <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      default: return <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setPage("home")}>E-Connect</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isAdmin && <button style={{ ...S.btn("grey"), padding: "7px 12px", fontSize: 12, color: C.text }} onClick={() => setPage("admin")}>Admin</button>}
          <div style={{ ...S.avatar(34), background: `${C.primary}20`, fontSize: 16 }}>👤</div>
        </div>
      </nav>
      {renderPage()}
      <div style={S.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={S.bottomBtn(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: 22, position: "relative" }}>
              {item.icon}
              {item.badge > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.primary, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
