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

const THEMES = {
  light: {
    primary: "#00A896", primaryDark: "#007A6E", primaryLight: "#00C4B4",
    secondary: "#1A1A2E", accent: "#FFD700", white: "#FFFFFF",
    offWhite: "#F8F9FA", grey: "#F0F2F5", greyMid: "#E4E6EA",
    greyDark: "#65676B", text: "#1C1E21", textLight: "#65676B",
    success: "#31A24C", error: "#FA3E3E", premium: "#FFD700",
    card: "#FFFFFF", border: "#E4E6EA",
  },
  dark: {
    primary: "#00C4B4", primaryDark: "#00A896", primaryLight: "#00D4C4",
    secondary: "#0A0A0A", accent: "#FFD700", white: "#1A1A1A",
    offWhite: "#121212", grey: "#2A2A2A", greyMid: "#333333",
    greyDark: "#AAAAAA", text: "#F0F0F0", textLight: "#AAAAAA",
    success: "#4ADE80", error: "#F87171", premium: "#FFD700",
    card: "#1E1E1E", border: "#333333",
  },
};

// Theme will be set dynamically - default to light
let C = { ...THEMES.light };

const FONT = "'DM Sans', 'Nunito', sans-serif";

const CATEGORIES = ["All", "Fashion", "Electronics", "Beauty", "Food", "Sports", "Home"];

// ── Premium Star SVG ───────────────────────────────────────────
const PremiumStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" style={{ marginLeft: 4, verticalAlign: "middle" }}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

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
        const adminEmails = ["admin@econnect.gh", "asantegideon060@gmail.com", "selormatsubonuedie@gmail.com", "akowuahisaac686@gmail.com", "nyarkomatthew925491@gmail.com", "ebenezer.boateng009@stu.ucc.edu.gh"];
        await setDoc(doc(db, "users", res.user.uid), {
          name: form.name, email: form.email, phone: form.phone,
          role: adminEmails.includes(form.email) ? "admin" : "user",
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
        <p style={{ color: C.greyDark, fontSize: 12, textAlign: "center", marginTop: 16 }}>Register with your email to get started</p>
      </div>
    </div>
  );
}

// ── Cloudinary Config ─────────────────────────────────────────
const CLOUDINARY_CLOUD = "dxmmsq0gq";
const CLOUDINARY_PRESET = "Econnect";

// ── Add Product Modal ──────────────────────────────────────────
function AddProductModal({ user, onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", price: "", category: "Fashion", description: "", stock: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: data });
      const result = await res.json();
      setImageUrl(result.secure_url);
      setImagePreview(result.secure_url);
    } catch (err) { setError("Image upload failed. Please try again."); }
    setUploading(false);
  };

  const handle = async () => {
    if (!form.name || !form.price) { setError("Please fill in name and price."); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: form.name, price: Number(form.price), category: form.category,
        description: form.description, image: imageUrl, stock: Number(form.stock) || 0,
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

        <label style={S.label}>Product Image</label>
        <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12, cursor: "pointer" }}
          onClick={() => document.getElementById("imgInput").click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
          ) : (
            <div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, color: C.greyDark }}>{uploading ? "Uploading..." : "Tap to upload product image"}</div>
            </div>
          )}
        </div>
        <input id="imgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

        <label style={S.label}>Product Name *</label>
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="e.g. Ankara Dress" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label style={S.label}>Price (GH₵) *</label>
        <input style={{ ...S.input, marginBottom: 12 }} type="number" placeholder="e.g. 150" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <label style={S.label}>Category</label>
        <select style={{ ...S.input, marginBottom: 12 }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={S.label}>Description</label>
        <textarea style={{ ...S.input, marginBottom: 12, height: 80, resize: "vertical" }} placeholder="Describe your product..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label style={S.label}>Stock Quantity</label>
        <input style={{ ...S.input, marginBottom: 16 }} type="number" placeholder="e.g. 10" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btn(), flex: 1, opacity: (loading || uploading) ? 0.7 : 1 }} onClick={handle} disabled={loading || uploading}>
            {loading ? "Adding..." : uploading ? "Uploading image..." : "Add Product"}
          </button>
          <button style={{ ...S.btn("outline"), flex: 1 }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}


// ── Stories Feature ────────────────────────────────────────────
function StoriesBar({ user }) {
  const [stories, setStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchStories = async () => {
    const snap = await getDocs(collection(db, "stories"));
    const now = Date.now();
    const active = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => {
      if (!s.expiresAt) return false;
      const exp = s.expiresAt.toMillis ? s.expiresAt.toMillis() : new Date(s.expiresAt).getTime();
      return exp > now;
    });
    setStories(active);
  };

  useEffect(() => { fetchStories(); }, []);

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file); data.append("upload_preset", "Econnect"); data.append("cloud_name", "dxmmsq0gq");
      const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/image/upload", { method: "POST", body: data });
      const result = await res.json();
      await addDoc(collection(db, "stories"), {
        imageUrl: result.secure_url, userName: user?.displayName || "User",
        userId: user?.uid, userPhoto: user?.photoURL || "",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: serverTimestamp(),
      });
      fetchStories();
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  return (
    <div style={{ ...S.card, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", minWidth: 64 }}
          onClick={() => document.getElementById("storyUploadInput").click()}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", background: C.grey, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${C.primary}` }}>
            {uploading ? <span style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>...</span> : <span style={{ fontSize: 26 }}>+</span>}
          </div>
          <span style={{ fontSize: 10, color: C.greyDark, fontWeight: 600 }}>Add Story</span>
          <input id="storyUploadInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleStoryUpload} />
        </div>
        {stories.map(s => (
          <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", minWidth: 64 }}
            onClick={() => setViewingStory(s)}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: 2.5 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: C.white }}>
                {s.userPhoto ? <img src={s.userPhoto} alt={s.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: C.text, fontWeight: 600, textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.userName}</span>
          </div>
        ))}
        {stories.length === 0 && <div style={{ display: "flex", alignItems: "center", color: C.greyDark, fontSize: 13, paddingLeft: 8 }}>No stories yet. Be the first!</div>}
      </div>
      {viewingStory && (
        <div style={{ ...S.modal, zIndex: 400 }} onClick={() => setViewingStory(null)}>
          <div style={{ background: C.secondary, borderRadius: 18, width: 300, height: 480, position: "relative", overflow: "hidden" }}>
            <img src={viewingStory.imageUrl} alt="story" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.3)" }}>
              <div style={{ height: "100%", width: "100%", background: C.white }} />
            </div>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: C.white }}>
                {viewingStory.userPhoto ? <img src={viewingStory.userPhoto} alt={viewingStory.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>}
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{viewingStory.userName}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>Expires in 24hrs</div>
              </div>
            </div>
            <button style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", border: "none", color: "white", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, fontWeight: 700 }} onClick={() => setViewingStory(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Approved Ads Banner ────────────────────────────────────────
function ApprovedAdsBanner() {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getDocs(query(collection(db, "ads"), where("status", "==", "approved"))).then(snap => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % ads.length), 4000);
    return () => clearInterval(timer);
  }, [ads]);

  if (ads.length === 0) return null;

  const ad = ads[current];
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16, position: "relative", cursor: "pointer" }}>
      {ad.adType === "video" ? (
        <video src={ad.mediaUrl || ad.imageUrl} style={{ width: "100%", height: 200, objectFit: "cover" }} autoPlay muted loop playsInline poster={ad.imageUrl} />
      ) : (
        <img src={ad.imageUrl} alt={ad.businessName} style={{ width: "100%", height: 160, objectFit: "cover" }} />
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "20px 16px 12px" }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{ad.title || ad.businessName}</div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{ad.description}</div>
      </div>
      <div style={{ position: "absolute", top: 10, right: 10, background: "#FFD700", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#333"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        Promoted
      </div>
      {ads.length > 1 && (
        <div style={{ position: "absolute", bottom: 8, right: 12, display: "flex", gap: 4 }}>
          {ads.map((_, i) => <div key={i} style={{ width: i === current ? 16 : 6, height: 6, borderRadius: 3, background: i === current ? "white" : "rgba(255,255,255,0.5)", transition: "width 0.3s" }} />)}
        </div>
      )}
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
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.deleted));
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

      <StoriesBar user={user} />

      <ApprovedAdsBanner />

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

      {filtered.some(p => p.premium) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Premium Stores</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {filtered.filter(p => p.premium).slice(0, 4).map(p => (
              <div key={p.id} style={{ ...S.card, overflow: "hidden", cursor: "pointer", border: `2px solid #FFD700` }} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                <div style={{ height: 140, overflow: "hidden", background: C.grey, position: "relative" }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📦</div>}
                  <div style={{ position: "absolute", top: 8, right: 8, background: "#FFD700", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#333"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Premium
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: C.greyDark, fontSize: 12, marginBottom: 4 }}>{p.seller}</div>
                  <div style={{ color: C.primary, fontWeight: 800, fontSize: 16 }}>GH₵{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: C.primary, fontWeight: 800, fontSize: 16 }}>GH₵{p.price}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.greyDark, padding: 0 }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await setDoc(doc(db, "productLikes", p.id + "_" + (user?.uid || "guest")), { productId: p.id, userId: user?.uid, createdAt: serverTimestamp() }, { merge: true });
                      }}>
                      ♥ Like
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.greyDark, padding: 0 }}
                      onClick={(e) => { e.stopPropagation(); navigator.share ? navigator.share({ title: p.name, text: `Check out ${p.name} for GH₵${p.price} on E-Connect!`, url: window.location.href }) : navigator.clipboard.writeText(window.location.href); }}>
                      ↗ Share
                    </button>
                  </div>
                </div>
                <button style={{ ...S.btn(), width: "100%", padding: "8px" }} onClick={e => { e.stopPropagation(); addToCart(p); }}>Add to Cart</button>
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

// ── Reels Page ────────────────────────────────────────────────
function ReelsPage({ user }) {
  const [reels, setReels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [reelForm, setReelForm] = useState({ description: "" });
  const [loading, setLoading] = useState(true);

  const fetchReels = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "reels"), orderBy("createdAt", "desc")));
    setReels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchReels(); }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file); data.append("upload_preset", "Econnect"); data.append("cloud_name", "dxmmsq0gq"); data.append("resource_type", "video");
      const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/video/upload", { method: "POST", body: data });
      const result = await res.json();
      await addDoc(collection(db, "reels"), {
        videoUrl: result.secure_url, thumbnailUrl: result.secure_url.replace("/upload/", "/upload/so_0/").replace(".mp4", ".jpg"),
        description: reelForm.description, userName: user?.displayName || "User",
        userId: user?.uid, userPhoto: user?.photoURL || "",
        likes: 0, shares: 0, createdAt: serverTimestamp(),
      });
      setShowUpload(false); setReelForm({ description: "" });
      fetchReels();
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const handleLike = async (reelId, currentLikes) => {
    await setDoc(doc(db, "reelLikes", reelId + "_" + user?.uid), { reelId, userId: user?.uid, createdAt: serverTimestamp() }, { merge: true });
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, likes: (currentLikes || 0) + 1 } : r));
  };

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={S.sectionTitle}>Reels</div>
          <div style={{ fontSize: 13, color: C.greyDark }}>Short videos from sellers</div>
        </div>
        <button style={{ ...S.btn(), padding: "8px 14px", fontSize: 12 }} onClick={() => setShowUpload(true)}>+ Upload Reel</button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>Loading reels...</div> :
      reels.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p style={{ color: C.greyDark }}>No reels yet. Upload the first one!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 80 }}>
          {reels.map(r => (
            <div key={r.id} style={S.card}>
              <div style={{ background: C.secondary, borderRadius: "14px 14px 0 0", overflow: "hidden", position: "relative" }}>
                <video src={r.videoUrl} style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} controls poster={r.thumbnailUrl} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: C.grey }}>
                    {r.userPhoto ? <img src={r.userPhoto} alt={r.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.userName}</div>
                    <div style={{ fontSize: 12, color: C.greyDark }}>{r.description}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={{ ...S.btn("grey"), padding: "7px 14px", fontSize: 12, color: C.text }}
                    onClick={() => handleLike(r.id, r.likes)}>
                    ♥ {r.likes || 0}
                  </button>
                  <button style={{ ...S.btn("grey"), padding: "7px 14px", fontSize: 12, color: C.text }}
                    onClick={() => navigator.share ? navigator.share({ title: r.description, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}>
                    ↗ Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div style={S.modal} onClick={() => setShowUpload(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Upload a Reel</h3>
            <label style={S.label}>Description</label>
            <textarea style={{ ...S.input, height: 80, resize: "vertical", marginBottom: 16 }} placeholder="Describe your reel..." value={reelForm.description} onChange={e => setReelForm({ ...reelForm, description: e.target.value })} />
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 16, cursor: "pointer" }}
              onClick={() => document.getElementById("reelVideoInput").click()}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 13, color: C.greyDark }}>{uploading ? "Uploading video..." : "Tap to select a video"}</div>
              <div style={{ fontSize: 11, color: C.greyDark, marginTop: 4 }}>MP4, MOV supported</div>
            </div>
            <input id="reelVideoInput" type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoUpload} />
            <button style={{ ...S.btn("outline"), width: "100%" }} onClick={() => setShowUpload(false)}>Cancel</button>
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
function Profile({ user, setPage, setUser, theme, setTheme }) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [myProducts, setMyProducts] = useState([]);
  const [showPremium, setShowPremium] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showStore, setShowStore] = useState(false);
  const [storeForm, setStoreForm] = useState({ businessName: "", description: "", contact: "", logoUrl: "", adType: "image", adMediaUrl: "", adTitle: "", adDescription: "", adThumbnail: "", adUploading: false });
  const [storeSaved, setStoreSaved] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(d => { if (d.exists()) { setProfile(d.data()); setIsPremium(d.data().premium || false); setStoreForm({ businessName: d.data().businessName || "", description: d.data().storeDescription || "", contact: d.data().storeContact || "", logoUrl: d.data().logoUrl || "" }); } });
    getDocs(query(collection(db, "orders"), where("userId", "==", user.uid))).then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(query(collection(db, "products"), where("sellerId", "==", user.uid))).then(snap => setMyProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users", user.uid, "followers")).then(snap => setFollowers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users", user.uid, "following")).then(snap => setFollowing(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users", user.uid, "friends")).then(snap => setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || "");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.displayName || "", phone: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleLogout = async () => { await signOut(auth); setUser(null); };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editForm.name });
      await setDoc(doc(db, "users", user.uid), {
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
      }, { merge: true });
      setProfileSaved(true);
      setTimeout(() => { setProfileSaved(false); setShowEditProfile(false); }, 2000);
    } catch (err) { console.error(err); }
    setSavingProfile(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Econnect");
      data.append("cloud_name", "dxmmsq0gq");
      const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/image/upload", { method: "POST", body: data });
      const result = await res.json();
      setProfilePhoto(result.secure_url);
      await updateProfile(auth.currentUser, { photoURL: result.secure_url });
      await setDoc(doc(db, "users", user.uid), { photoURL: result.secure_url }, { merge: true });
    } catch (err) { console.error(err); }
    setUploadingPhoto(false);
  };

  return (
    <div style={{ ...S.page, paddingTop: 0 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, height: 100, borderRadius: "0 0 20px 20px", marginBottom: -40 }} />
      <div style={{ ...S.card, margin: "0 0 16px", padding: "50px 20px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: -30, left: 20, cursor: "pointer" }} onClick={() => document.getElementById("profilePhotoInput").click()}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.white, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", overflow: "hidden", position: "relative" }}>
            {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>👤</span>}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.4)", padding: "4px 0", textAlign: "center", fontSize: 10, color: "white", fontWeight: 700 }}>
              {uploadingPhoto ? "..." : "Edit"}
            </div>
          </div>
        </div>
        <input id="profilePhotoInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.displayName || "User"}</div>
            <div style={{ color: C.greyDark, fontSize: 13, marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[{ num: myProducts.length, label: "Products" }, { num: orders.length, label: "Orders" }, { num: followers.length, label: "Followers" }, { num: following.length, label: "Following" }, { num: friends.length, label: "Friends" }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, color: C.primary }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: C.greyDark }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            <button style={{ ...S.btn("outline"), padding: "8px 14px", fontSize: 12 }} onClick={() => setShowEditProfile(true)}>Edit Profile</button>
            <button style={{ ...S.btn("grey"), padding: "8px 14px", fontSize: 12, color: C.error }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button style={{ ...S.btn(), flex: 1, background: isPremium ? `linear-gradient(135deg, ${C.accent}, #FFA500)` : `linear-gradient(135deg, ${C.accent}, #FFA500)`, color: "#333", fontWeight: 800 }}
            onClick={() => !isPremium && setShowPremium(true)}>
            {isPremium ? "⭐ Premium Active" : "⭐ Go Premium · GH₵20/mo"}
          </button>
          <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setShowStore(true)}>
            🏪 My Store
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {["orders", "products", "followers", "following", "friends"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 14px", textTransform: "capitalize", whiteSpace: "nowrap", flexShrink: 0 }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Appearance</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {["system", "light", "dark"].map(t => {
            const isActive = theme === t || (t === "system" && !["light", "dark"].includes(theme));
            return (
              <div key={t} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => {
                if (t === "system") {
                  const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  setTheme(sys);
                } else { setTheme(t); }
              }}>
                <div style={{ width: 72, height: 100, borderRadius: 12, background: t === "dark" ? "#1A1A1A" : t === "light" ? "#F8F9FA" : "linear-gradient(135deg, #1A1A1A 50%, #F8F9FA 50%)", border: isActive ? `2px solid ${C.primary}` : `2px solid ${C.border}`, marginBottom: 8, overflow: "hidden", display: "flex", flexDirection: "column", gap: 4, padding: 8 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 8, borderRadius: 4, background: t === "dark" ? "#333" : "#E0E0E0" }} />)}
                </div>
                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? C.primary : C.greyDark, textTransform: "capitalize" }}>{t}</div>
                {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, margin: "4px auto 0" }} />}
              </div>
            );
          })}
        </div>
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

      {tab === "followers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {followers.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>No followers yet.</div> :
          followers.map(f => (
            <div key={f.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.avatar(44)}>👤</div>
              <div style={{ fontWeight: 600 }}>{f.name || "User"}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "following" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {following.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>Not following anyone yet.</div> :
          following.map(f => (
            <div key={f.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.avatar(44)}>👤</div>
              <div style={{ fontWeight: 600 }}>{f.name || "User"}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {friends.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>No friends yet. Go to Discover to add friends!</div> :
          friends.map(f => (
            <div key={f.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.avatar(44)}>👤</div>
              <div style={{ fontWeight: 600 }}>{f.name || "User"}</div>
            </div>
          ))}
        </div>
      )}

      {showStore && (
        <div style={S.modal} onClick={() => setShowStore(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>My Store</h3>
            <p style={{ color: C.greyDark, fontSize: 13, marginBottom: 16 }}>Set up your online store on E-Connect</p>
            {storeSaved && <div style={S.alert("success")}>✅ Store saved successfully!</div>}

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => document.getElementById("logoUpload").click()}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: C.grey, border: `2px dashed ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {storeForm.logoUrl ? <img src={storeForm.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center", fontSize: 12, color: C.greyDark }}>🏪<br/>Logo</div>}
                </div>
              </div>
              <input id="logoUpload" type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files[0]; if (!file) return;
                setUploadingLogo(true);
                const data = new FormData(); data.append("file", file); data.append("upload_preset", "Econnect"); data.append("cloud_name", "dxmmsq0gq");
                const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/image/upload", { method: "POST", body: data });
                const result = await res.json();
                setStoreForm(prev => ({ ...prev, logoUrl: result.secure_url }));
                setUploadingLogo(false);
              }} />
            </div>

            <label style={S.label}>Business Name</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="e.g. Ama's Fashion" value={storeForm.businessName} onChange={e => setStoreForm({ ...storeForm, businessName: e.target.value })} />
            <label style={S.label}>Store Description</label>
            <textarea style={{ ...S.input, marginBottom: 12, height: 80, resize: "vertical" }} placeholder="What do you sell?" value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} />
            <label style={S.label}>Contact (Phone or WhatsApp)</label>
            <input style={{ ...S.input, marginBottom: 16 }} placeholder="+233..." value={storeForm.contact} onChange={e => setStoreForm({ ...storeForm, contact: e.target.value })} />

            {isPremium && (
              <div style={{ background: "#FFF8E1", border: "2px solid #FFD700", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  Run a Promotional Ad
                </div>
                <p style={{ fontSize: 12, color: C.greyDark, marginBottom: 10 }}>Submit an ad banner. Admin will review and approve within 24 hours. Approved ads show on the Home and Discover pages.</p>
                <label style={S.label}>Ad Type</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {["image", "video"].map(t => (
                    <button key={t} style={{ ...S.btn(storeForm.adType === t ? "primary" : "grey"), flex: 1, textTransform: "capitalize", fontSize: 12 }}
                      onClick={() => setStoreForm(prev => ({ ...prev, adType: t, adMediaUrl: "", adThumbnail: "" }))}>
                      {t === "image" ? "📸 Image Ad" : "🎬 Video Ad (30s - 1min)"}
                    </button>
                  ))}
                </div>

                <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 10, cursor: "pointer", background: C.grey }}
                  onClick={() => document.getElementById("adMediaUpload").click()}>
                  {storeForm.adMediaUrl ? (
                    storeForm.adType === "video"
                      ? <video src={storeForm.adMediaUrl} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} controls />
                      : <img src={storeForm.adMediaUrl} alt="Ad" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{storeForm.adType === "video" ? "🎬" : "📸"}</div>
                      <div style={{ fontSize: 12, color: C.greyDark, fontWeight: 600 }}>
                        {storeForm.adType === "video" ? "Tap to upload video (30 seconds to 1 minute)" : "Tap to upload ad image"}
                      </div>
                      {storeForm.adType === "video" && <div style={{ fontSize: 11, color: C.greyDark, marginTop: 4 }}>MP4, MOV · Max 1 minute</div>}
                      {storeForm.adUploading && <div style={{ fontSize: 12, color: C.primary, marginTop: 6, fontWeight: 700 }}>Uploading... please wait</div>}
                    </div>
                  )}
                </div>

                <input id="adMediaUpload" type="file" accept={storeForm.adType === "video" ? "video/*" : "image/*"} style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files[0]; if (!file) return;
                  if (storeForm.adType === "video") {
                    const video = document.createElement("video");
                    video.preload = "metadata";
                    video.onloadedmetadata = async () => {
                      window.URL.revokeObjectURL(video.src);
                      if (video.duration > 65) { alert("Video must be 30 seconds to 1 minute long. Please trim your video and try again."); return; }
                      if (video.duration < 20) { alert("Video must be at least 30 seconds long."); return; }
                      setStoreForm(prev => ({ ...prev, adUploading: true }));
                      const data = new FormData(); data.append("file", file); data.append("upload_preset", "Econnect"); data.append("cloud_name", "dxmmsq0gq"); data.append("resource_type", "video");
                      const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/video/upload", { method: "POST", body: data });
                      const result = await res.json();
                      setStoreForm(prev => ({ ...prev, adMediaUrl: result.secure_url, adThumbnail: result.secure_url.replace("/upload/", "/upload/so_0/").replace(/\.(mp4|mov|avi)$/i, ".jpg"), adUploading: false }));
                    };
                    video.src = URL.createObjectURL(file);
                  } else {
                    setStoreForm(prev => ({ ...prev, adUploading: true }));
                    const data = new FormData(); data.append("file", file); data.append("upload_preset", "Econnect"); data.append("cloud_name", "dxmmsq0gq");
                    const res = await fetch("https://api.cloudinary.com/v1_1/dxmmsq0gq/image/upload", { method: "POST", body: data });
                    const result = await res.json();
                    setStoreForm(prev => ({ ...prev, adMediaUrl: result.secure_url, adUploading: false }));
                  }
                }} />

                <label style={S.label}>Ad Title</label>
                <input style={{ ...S.input, marginBottom: 8 }} placeholder="e.g. Weekend Sale - 50% Off!" value={storeForm.adTitle || ""} onChange={e => setStoreForm({ ...storeForm, adTitle: e.target.value })} />

                <label style={S.label}>Ad Description</label>
                <textarea style={{ ...S.input, marginBottom: 10, height: 60, resize: "vertical" }} placeholder="e.g. Shop the biggest sale of the season. Limited time only!" value={storeForm.adDescription || ""} onChange={e => setStoreForm({ ...storeForm, adDescription: e.target.value })} />

                <button style={{ ...S.btn(), width: "100%", fontSize: 13, opacity: storeForm.adUploading ? 0.6 : 1 }}
                  disabled={storeForm.adUploading}
                  onClick={async () => {
                    if (!storeForm.adMediaUrl) { alert("Please upload an image or video first."); return; }
                    if (!storeForm.adTitle) { alert("Please add an ad title."); return; }
                    await addDoc(collection(db, "ads"), {
                      mediaUrl: storeForm.adMediaUrl,
                      imageUrl: storeForm.adType === "image" ? storeForm.adMediaUrl : storeForm.adThumbnail || storeForm.adMediaUrl,
                      adType: storeForm.adType || "image",
                      title: storeForm.adTitle || "",
                      description: storeForm.adDescription || "",
                      businessName: storeForm.businessName || user.displayName,
                      userId: user.uid, status: "pending", createdAt: serverTimestamp(),
                    });
                    setStoreForm(prev => ({ ...prev, adMediaUrl: "", adTitle: "", adDescription: "", adThumbnail: "", adType: "image" }));
                    alert("Ad submitted! Admin will review within 24 hours.");
                  }}>
                  {storeForm.adUploading ? "Uploading..." : "Submit Ad for Review"}
                </button>
              </div>
            )}

            {!isPremium && (
              <div style={{ background: C.grey, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 12, color: C.greyDark, textAlign: "center" }}>
                🔒 Upgrade to Premium (GH₵20/month) to run promotional advertisements
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={{ ...S.btn(), flex: 1 }} onClick={async () => {
                await setDoc(doc(db, "users", user.uid), { businessName: storeForm.businessName, storeDescription: storeForm.description, storeContact: storeForm.contact, logoUrl: storeForm.logoUrl, isSeller: true }, { merge: true });
                setStoreSaved(true); setTimeout(() => { setStoreSaved(false); setShowStore(false); }, 2000);
              }}>Save Store</button>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setShowStore(false)}>Close</button>
            </div>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            <button style={{ ...S.btn("outline"), width: "100%", color: C.error, borderColor: C.error, fontSize: 13 }}
              onClick={async () => {
                const confirm = window.confirm("Are you sure you want to delete your store and all your products? This cannot be undone.");
                if (!confirm) return;
                await setDoc(doc(db, "users", user.uid), { businessName: "", storeDescription: "", storeContact: "", logoUrl: "", isSeller: false }, { merge: true });
                const productsSnap = await getDocs(query(collection(db, "products"), where("sellerId", "==", user.uid)));
                const deletePromises = productsSnap.docs.map(d => setDoc(doc(db, "products", d.id), { deleted: true }, { merge: true }));
                await Promise.all(deletePromises);
                const adsSnap = await getDocs(query(collection(db, "ads"), where("userId", "==", user.uid)));
                const deleteAds = adsSnap.docs.map(d => setDoc(doc(db, "ads", d.id), { status: "deleted" }, { merge: true }));
                await Promise.all(deleteAds);
                setStoreForm({ businessName: "", description: "", contact: "", logoUrl: "", adType: "image", adMediaUrl: "", adTitle: "", adDescription: "", adThumbnail: "", adUploading: false });
                setMyProducts([]);
                setStoreSaved(false);
                setShowStore(false);
                alert("Your store and all products have been deleted successfully.");
              }}>
              🗑️ Delete Store
            </button>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div style={S.modal} onClick={() => setShowEditProfile(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Edit Profile</h3>
            {profileSaved && <div style={S.alert("success")}>✅ Profile updated successfully!</div>}

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => document.getElementById("editProfilePhoto").click()}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: C.grey, border: `3px solid ${C.primary}` }}>
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, background: C.primary, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>
              <input id="editProfilePhoto" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            </div>

            <label style={S.label}>Full Name</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="Your full name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />

            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="+233..." value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />

            <label style={S.label}>Bio</label>
            <textarea style={{ ...S.input, marginBottom: 16, height: 80, resize: "vertical" }} placeholder="Tell people about yourself or your business..." value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1, opacity: savingProfile ? 0.7 : 1 }} onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setShowEditProfile(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPremium && (
        <div style={S.modal} onClick={() => setShowPremium(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
              <h3 style={{ fontWeight: 800, fontSize: 22 }}>Go Premium</h3>
              <p style={{ color: C.greyDark, fontSize: 13 }}>GH₵20/month · Exclusive benefits for subscribers only</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              {[
                "Gold ⭐ star badge displayed beside your business name",
                "Higher visibility across the platform",
                "Products and stores appear more in search and recommendations",
                "Ability to run promotional advertisements",
                "Priority placement on homepage and discovery pages",
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: C.success, fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, lineHeight: 1.4, color: C.text }}>{b}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFF8E1", border: "2px solid #FFD700", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#333", marginBottom: 12, textAlign: "center" }}>💛 Pay with MTN Mobile Money</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "MoMo Number", value: "0541940967" },
                  { label: "Account Name", value: "E-Connect GH" },
                  { label: "Amount", value: "GH₵20.00" },
                  { label: "Reference", value: "PREMIUM-SUB" },
                ].map(item => (
                  <div key={item.label} style={{ background: "white", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.greyDark, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#333" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#FFF3CD", borderRadius: 10, padding: 12, marginTop: 12, fontSize: 12, color: "#856404", lineHeight: 1.8 }}>
                📱 How to pay via MTN MoMo:
                <br />1. Dial *170# on your MTN phone
                <br />2. Select Transfer Money
                <br />3. Enter number: 0541940967
                <br />4. Enter amount: 20
                <br />5. Enter reference: PREMIUM-SUB
                <br />6. Enter your PIN to confirm
                <br />7. Send payment screenshot to +233 54 194 0967 on WhatsApp
              </div>
            </div>

            <div style={{ background: `${C.primary}10`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: C.greyDark, textAlign: "center", lineHeight: 1.6 }}>
              After payment, send your screenshot to <strong>+233 54 194 0967</strong> on WhatsApp. Your Premium ⭐ badge will be activated within 24 hours.
            </div>

            <a href="tel:*170%23" style={{ display: "block", textDecoration: "none" }}>
              <button style={{ ...S.btn(), width: "100%", background: "#FFD700", color: "#333", fontWeight: 800, fontSize: 15, padding: 14, marginBottom: 10 }}>
                📱 Dial *170# to Pay Now
              </button>
            </a>
            <button style={{ ...S.btn("outline"), width: "100%" }} onClick={() => setShowPremium(false)}>Maybe Later</button>
          </div>
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
  const [ads, setAds] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    getDocs(collection(db, "orders")).then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users")).then(snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "products")).then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "ads")).then(snap => setAds(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Admin Dashboard</div>
      <p style={S.sectionSub}>Manage E-Connect platform</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["overview", "orders", "users", "products", "ads"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", textTransform: "capitalize", position: "relative" }} onClick={() => setTab(t)}>
            {t}
            {t === "ads" && ads.filter(a => a.status === "pending").length > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: C.error, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ads.filter(a => a.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {[{ num: users.length, label: "Total Users", icon: "👥" }, { num: products.length, label: "Products", icon: "📦" }, { num: orders.length, label: "Total Orders", icon: "🛒" }, { num: `GH₵${totalRevenue}`, label: "Total Revenue", icon: "💰" }, { num: ads.filter(a => a.status === "pending").length, label: "Pending Ads", icon: "📢" }].map(s => (
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
        <div key={u.id} style={{ ...S.card, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{u.name} {u.premium && <span style={{ color: "#FFD700" }}>⭐</span>}</div>
            <div style={{ fontSize: 13, color: C.greyDark }}>{u.email} · {u.role || "user"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...S.btn(u.premium ? "grey" : "primary"), padding: "6px 12px", fontSize: 11 }}
              onClick={async () => {
                await setDoc(doc(db, "users", u.id), { premium: !u.premium }, { merge: true });
                setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, premium: !usr.premium } : usr));
              }}>
              {u.premium ? "Remove Premium" : "Activate Premium"}
            </button>
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

      {tab === "ads" && (
        <div>
          <p style={{ color: C.greyDark, fontSize: 13, marginBottom: 16 }}>Review and approve promotional ads from premium subscribers.</p>
          {ads.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.greyDark }}>No ads submitted yet.</div> :
          ads.map(a => (
            <div key={a.id} style={{ ...S.card, marginBottom: 12, overflow: "hidden" }}>
              {a.adType === "video" ? (
                <video src={a.mediaUrl} style={{ width: "100%", height: 120, objectFit: "cover" }} controls poster={a.imageUrl} />
              ) : (
                a.imageUrl && <img src={a.imageUrl} alt={a.businessName} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              )}
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{a.businessName}</div>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: C.greyDark, marginBottom: 10 }}>{a.description}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: a.status === "approved" ? C.success : a.status === "rejected" ? C.error : "#F59E0B", background: a.status === "approved" ? `${C.success}20` : a.status === "rejected" ? `${C.error}20` : "#FEF3C720", padding: "3px 10px", borderRadius: 20 }}>
                    {a.status}
                  </span>
                  {a.status === "pending" && (
                    <>
                      <button style={{ ...S.btn(), padding: "6px 14px", fontSize: 12 }} onClick={async () => {
                        await setDoc(doc(db, "ads", a.id), { status: "approved" }, { merge: true });
                        setAds(prev => prev.map(ad => ad.id === a.id ? { ...ad, status: "approved" } : ad));
                      }}>Approve</button>
                      <button style={{ ...S.btn("outline"), padding: "6px 14px", fontSize: 12, color: C.error, borderColor: C.error }} onClick={async () => {
                        await setDoc(doc(db, "ads", a.id), { status: "rejected" }, { merge: true });
                        setAds(prev => prev.map(ad => ad.id === a.id ? { ...ad, status: "rejected" } : ad));
                      }}>Reject</button>
                    </>
                  )}
                  {a.status === "approved" && (
                    <button style={{ ...S.btn("outline"), padding: "6px 14px", fontSize: 12, color: C.error, borderColor: C.error }} onClick={async () => {
                      await setDoc(doc(db, "ads", a.id), { status: "pending" }, { merge: true });
                      setAds(prev => prev.map(ad => ad.id === a.id ? { ...ad, status: "pending" } : ad));
                    }}>Remove</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Discover ───────────────────────────────────────────────────
function Discover({ setPage, setSelectedProduct, user }) {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("products");
  const [following, setFollowing] = useState({});
  const [friends, setFriends] = useState({});

  useEffect(() => {
    getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))).then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, "users")).then(snap => setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    if (user) {
      getDocs(collection(db, "users", user.uid, "following")).then(snap => {
        const f = {}; snap.docs.forEach(d => f[d.id] = true); setFollowing(f);
      });
      getDocs(collection(db, "users", user.uid, "friends")).then(snap => {
        const f = {}; snap.docs.forEach(d => f[d.id] = true); setFriends(f);
      });
    }
  }, [user]);

  const handleFollow = async (sellerId, sellerName) => {
    if (!user) return;
    const isFollowing = following[sellerId];
    const newFollowing = { ...following };
    if (isFollowing) {
      delete newFollowing[sellerId];
      await setDoc(doc(db, "users", user.uid, "following", sellerId), { deleted: true });
    } else {
      newFollowing[sellerId] = true;
      await setDoc(doc(db, "users", user.uid, "following", sellerId), { name: sellerName, followedAt: serverTimestamp() });
      await setDoc(doc(db, "users", sellerId, "followers", user.uid), { name: user.displayName, followedAt: serverTimestamp() });
    }
    setFollowing(newFollowing);
  };

  const handleAddFriend = async (userId, userName) => {
    if (!user) return;
    const isFriend = friends[userId];
    const newFriends = { ...friends };
    if (isFriend) {
      delete newFriends[userId];
    } else {
      newFriends[userId] = true;
      await setDoc(doc(db, "users", user.uid, "friends", userId), { name: userName, addedAt: serverTimestamp() });
      await setDoc(doc(db, "users", userId, "friends", user.uid), { name: user.displayName, addedAt: serverTimestamp() });
    }
    setFriends(newFriends);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.seller?.toLowerCase().includes(search.toLowerCase()));
  const filteredSellers = sellers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())).filter(s => s.id !== user?.uid);

  return (
    <div style={S.page}>
      <ApprovedAdsBanner />
      <div style={S.sectionTitle}>Discover</div>
      <p style={S.sectionSub}>Find products, sellers and connect with people</p>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input style={{ ...S.input, paddingLeft: 38 }} placeholder="Search products and sellers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["products", "sellers", "people"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", textTransform: "capitalize" }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          {filteredProducts.some(p => p.premium) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Premium Products</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {filteredProducts.filter(p => p.premium).map(p => (
                  <div key={"prem-" + p.id} style={{ ...S.card, overflow: "hidden", cursor: "pointer", border: `2px solid #FFD700` }} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                    <div style={{ height: 120, background: C.grey, overflow: "hidden", position: "relative" }}>
                      {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>📦</div>}
                      <div style={{ position: "absolute", top: 6, right: 6, background: "#FFD700", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#333"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      </div>
                    </div>
                    <div style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                      <div style={{ color: C.primary, fontWeight: 800, fontSize: 14 }}>GH₵{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: C.text }}>All Products</div>
        </div>
      )}
      {tab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {filteredProducts.map(p => (
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
      )}

      {tab === "sellers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredSellers.filter(s => s.role !== "admin").map(s => (
            <div key={s.id} style={{ ...S.card, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: C.grey, flexShrink: 0 }}>
                {s.photoURL ? <img src={s.photoURL} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{s.name || "User"}</span>
                  {s.premium && <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
                </div>
                <div style={{ fontSize: 12, color: C.greyDark }}>{s.bio || "E-Connect member"}</div>
              </div>
              <button style={{ ...S.btn(following[s.id] ? "grey" : "primary"), padding: "7px 14px", fontSize: 12 }}
                onClick={() => handleFollow(s.id, s.name)}>
                {following[s.id] ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "people" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredSellers.map(s => (
            <div key={s.id} style={{ ...S.card, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: C.grey, flexShrink: 0 }}>
                {s.photoURL ? <img src={s.photoURL} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name || "User"}</div>
                <div style={{ fontSize: 12, color: C.greyDark }}>{s.email}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn(following[s.id] ? "grey" : "primary"), padding: "7px 12px", fontSize: 11 }}
                  onClick={() => handleFollow(s.id, s.name)}>
                  {following[s.id] ? "Following" : "Follow"}
                </button>
                <button style={{ ...S.btn(friends[s.id] ? "grey" : "outline"), padding: "7px 12px", fontSize: 11 }}
                  onClick={() => handleAddFriend(s.id, s.name)}>
                  {friends[s.id] ? "Friends ✓" : "+ Friend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("econnect-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    C = { ...THEMES[theme] };
    localStorage.setItem("econnect-theme", theme);
    document.body.style.background = THEMES[theme].offWhite;
  }, [theme]);

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

  const ADMIN_EMAILS = ["admin@econnect.gh", "asantegideon060@gmail.com", "selormatsubonuedie@gmail.com", "akowuahisaac686@gmail.com", "nyarkomatthew925491@gmail.com", "ebenezer.boateng009@stu.ucc.edu.gh"];
  const isAdmin = ADMIN_EMAILS.includes(user.email);

  const NavIcon = ({ id, active }) => {
    const color = active ? C.primary : C.greyDark;
    const icons = {
      home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V9.5Z" fill={active ? C.primary : "none"} stroke={color} strokeWidth="1.8"/></svg>,
      discover: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8"/><path d="M20 20L17 17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
      cart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke={color} strokeWidth="1.8"/><path d="M3 6H21" stroke={color} strokeWidth="1.8"/><path d="M16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
      messages: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" stroke={color} strokeWidth="1.8" fill={active ? `${C.primary}20` : "none"}/></svg>,
      reels: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth="1.8"/><path d="M10 8L16 12L10 16V8Z" fill={active ? C.primary : "none"} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
      profile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/><path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    };
    return icons[id] || null;
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "discover", label: "Discover" },
    { id: "reels", label: "Reels" },
    { id: "cart", label: "Cart", badge: cart.length },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
  ];

  const renderPage = () => {
    switch (page) {
      case "home": return <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "discover": return <Discover setPage={setPage} setSelectedProduct={setSelectedProduct} user={user} />;
      case "product": return <ProductDetail product={selectedProduct} setCart={setCart} setPage={setPage} />;
      case "cart": return <Cart cart={cart} setCart={setCart} setPage={setPage} user={user} />;
      case "reels": return <ReelsPage user={user} />;
      case "messages": return <Messages user={user} />;
      case "profile": return <Profile user={user} setPage={setPage} setUser={setUser} theme={theme} setTheme={setTheme} />;
      case "admin": return isAdmin ? <Admin /> : <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      default: return <Home user={user} cart={cart} setCart={setCart} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <div style={{ ...S.app, background: THEMES[theme]?.offWhite || C.offWhite, color: THEMES[theme]?.text || C.text }}>
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
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <NavIcon id={item.id} active={page === item.id} />
              {item.badge > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.primary, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

