import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#FF6B35",
  primaryDark: "#E5501A",
  primaryLight: "#FF8C5A",
  secondary: "#1A1A2E",
  accent: "#FFD700",
  white: "#FFFFFF",
  offWhite: "#F8F9FA",
  grey: "#F0F2F5",
  greyMid: "#E4E6EA",
  greyDark: "#65676B",
  text: "#1C1E21",
  textLight: "#65676B",
  success: "#31A24C",
  error: "#FA3E3E",
  premium: "#FFD700",
  card: "#FFFFFF",
  border: "#E4E6EA",
};

const FONT = "'DM Sans', 'Nunito', sans-serif";

// ── Mock Data ──────────────────────────────────────────────────
const STORIES = [
  { id: 1, user: "Ama's Fashion", avatar: "👗", hasStory: true, seen: false },
  { id: 2, user: "TechHub GH", avatar: "💻", hasStory: true, seen: false },
  { id: 3, user: "Kofi Eats", avatar: "🍔", hasStory: true, seen: true },
  { id: 4, user: "BeautyGlow", avatar: "💄", hasStory: true, seen: false },
  { id: 5, user: "FreshFarm", avatar: "🥦", hasStory: true, seen: true },
  { id: 6, user: "SportZone", avatar: "⚽", hasStory: true, seen: false },
];

const PRODUCTS = [
  { id: 1, name: "Ankara Dress", price: 180, seller: "Ama's Fashion", sellerId: 1, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80", category: "Fashion", likes: 234, rating: 4.8, reviews: 45, premium: true, stock: 12 },
  { id: 2, name: "Wireless Earbuds", price: 350, seller: "TechHub GH", sellerId: 2, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80", category: "Electronics", likes: 189, rating: 4.6, reviews: 32, premium: false, stock: 8 },
  { id: 3, name: "Shea Butter Cream", price: 85, seller: "BeautyGlow", sellerId: 4, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80", category: "Beauty", likes: 412, rating: 4.9, reviews: 89, premium: true, stock: 25 },
  { id: 4, name: "Smart Watch", price: 620, seller: "TechHub GH", sellerId: 2, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", category: "Electronics", likes: 156, rating: 4.5, reviews: 28, premium: false, stock: 5 },
  { id: 5, name: "Kente Bag", price: 220, seller: "Ama's Fashion", sellerId: 1, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", category: "Fashion", likes: 298, rating: 4.7, reviews: 61, premium: true, stock: 15 },
  { id: 6, name: "Organic Honey", price: 120, seller: "FreshFarm", sellerId: 5, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", category: "Food", likes: 334, rating: 4.9, reviews: 102, premium: false, stock: 30 },
  { id: 7, name: "Football Boots", price: 280, seller: "SportZone", sellerId: 6, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", category: "Sports", likes: 145, rating: 4.4, reviews: 19, premium: false, stock: 7 },
  { id: 8, name: "Natural Hair Oil", price: 95, seller: "BeautyGlow", sellerId: 4, image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=400&q=80", category: "Beauty", likes: 267, rating: 4.8, reviews: 74, premium: true, stock: 20 },
];

const SELLERS = [
  { id: 1, name: "Ama's Fashion", owner: "Ama Mensah", avatar: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&q=80", category: "Fashion", followers: 1240, rating: 4.8, products: 24, premium: true, description: "Authentic African fashion and accessories.", verified: true },
  { id: 2, name: "TechHub GH", owner: "Kwame Asante", avatar: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&q=80", category: "Electronics", followers: 890, rating: 4.6, products: 18, premium: false, description: "Latest gadgets and electronics at great prices.", verified: true },
  { id: 3, name: "Kofi Eats", owner: "Kofi Boateng", avatar: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80", category: "Food", followers: 2100, rating: 4.9, products: 12, premium: true, description: "Authentic Ghanaian meals delivered fresh.", verified: true },
  { id: 4, name: "BeautyGlow", owner: "Abena Osei", avatar: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80", category: "Beauty", followers: 3400, rating: 4.9, products: 31, premium: true, description: "Natural beauty products made in Ghana.", verified: true },
  { id: 5, name: "FreshFarm", owner: "Yaw Darko", avatar: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80", category: "Food", followers: 560, rating: 4.7, products: 8, premium: false, description: "Fresh organic produce from local farms.", verified: false },
  { id: 6, name: "SportZone", owner: "Nana Adu", avatar: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&q=80", category: "Sports", followers: 430, rating: 4.4, products: 15, premium: false, description: "Sports gear and equipment for all athletes.", verified: false },
];

const REELS = [
  { id: 1, seller: "Ama's Fashion", avatar: "👗", likes: 1240, shares: 89, description: "New Ankara collection just dropped! 🔥", video: "👗✨", sellerId: 1, premium: true },
  { id: 2, seller: "BeautyGlow", avatar: "💄", likes: 2890, shares: 234, description: "How to use our natural shea butter 💆", video: "💄🌟", sellerId: 4, premium: true },
  { id: 3, seller: "TechHub GH", avatar: "💻", likes: 456, shares: 45, description: "Unboxing the latest wireless earbuds 🎧", video: "💻📦", sellerId: 2, premium: false },
  { id: 4, seller: "Kofi Eats", avatar: "🍔", likes: 3210, shares: 412, description: "Making authentic Jollof Rice 🍚❤️", video: "🍔👨‍🍳", sellerId: 3, premium: true },
  { id: 5, seller: "FreshFarm", avatar: "🥦", likes: 789, shares: 67, description: "Fresh harvest from our organic farm 🌱", video: "🥦🌿", sellerId: 5, premium: false },
];

const MESSAGES = [
  { id: 1, user: "Ama's Fashion", avatar: "👗", lastMsg: "Yes, we have it in size L!", time: "2m", unread: 2 },
  { id: 2, user: "TechHub GH", avatar: "💻", lastMsg: "Your order has been shipped.", time: "1h", unread: 0 },
  { id: 3, user: "BeautyGlow", avatar: "💄", lastMsg: "Thank you for your purchase!", time: "3h", unread: 1 },
];

const CATEGORIES = ["All", "Fashion", "Electronics", "Beauty", "Food", "Sports", "Home"];

// ── Styles ─────────────────────────────────────────────────────
const S = {
  app: { fontFamily: FONT, background: C.offWhite, minHeight: "100vh", color: C.text },
  nav: {
    background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100, height: 56, boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
  },
  logo: { fontWeight: 800, fontSize: 22, color: C.primary, letterSpacing: -0.5, cursor: "pointer" },
  navIcons: { display: "flex", gap: 4, alignItems: "center" },
  navBtn: (active) => ({
    background: active ? `${C.primary}15` : "transparent",
    color: active ? C.primary : C.greyDark,
    border: "none", borderRadius: 8, padding: "8px 14px",
    cursor: "pointer", fontWeight: 600, fontSize: 13,
    transition: "all 0.15s", fontFamily: FONT
  }),
  page: { maxWidth: 1100, margin: "0 auto", padding: "20px 16px" },
  card: {
    background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
  },
  btn: (v = "primary") => ({
    background: v === "primary" ? C.primary : v === "outline" ? "transparent" : v === "grey" ? C.grey : C.secondary,
    color: v === "outline" ? C.primary : C.white,
    border: v === "outline" ? `1.5px solid ${C.primary}` : "none",
    borderRadius: 10, padding: "10px 20px", cursor: "pointer",
    fontWeight: 700, fontSize: 13, transition: "all 0.15s", fontFamily: FONT
  }),
  input: {
    width: "100%", background: C.grey, border: `1.5px solid transparent`,
    borderRadius: 10, padding: "11px 14px", color: C.text,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: FONT, transition: "border 0.15s"
  },
  label: { fontSize: 12, fontWeight: 700, color: C.greyDark, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
  badge: (color) => ({
    background: `${color}20`, color: color, borderRadius: 20,
    padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4
  }),
  sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 4, color: C.text },
  sectionSub: { fontSize: 13, color: C.greyDark, marginBottom: 16 },
  divider: { height: 1, background: C.border, margin: "20px 0" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { background: C.white, borderRadius: 18, padding: 28, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" },
  avatar: (size = 40) => ({
    width: size, height: size, borderRadius: "50%", background: `${C.primary}20`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.45, flexShrink: 0
  }),
  premiumBadge: { color: C.premium, fontSize: 14, marginLeft: 4 },
  bottomNav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: C.white, borderTop: `1px solid ${C.border}`,
    display: "flex", justifyContent: "space-around", alignItems: "center",
    padding: "8px 0 12px", zIndex: 100
  },
  bottomBtn: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    background: "none", border: "none", cursor: "pointer",
    color: active ? C.primary : C.greyDark, fontFamily: FONT,
    fontSize: 10, fontWeight: active ? 700 : 500, padding: "4px 16px"
  }),
};

// ── Sub Components ─────────────────────────────────────────────

function SearchBar({ placeholder = "Search products, sellers...", onSearch }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
      <input
        style={{ ...S.input, paddingLeft: 38 }}
        placeholder={placeholder}
        value={val}
        onChange={(e) => { setVal(e.target.value); onSearch && onSearch(e.target.value); }}
      />
    </div>
  );
}

function StoryBubble({ story, onClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", minWidth: 64 }} onClick={() => onClick(story)}>
      <div style={{
        width: 58, height: 58, borderRadius: "50%",
        background: story.seen ? C.greyMid : `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 2.5
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
          {story.avatar}
        </div>
      </div>
      <span style={{ fontSize: 10, color: C.text, fontWeight: 600, textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{story.user}</span>
    </div>
  );
}

function ProductCard({ product, onAdd, onClick }) {
  const [liked, setLiked] = useState(false);
  return (
    <div style={{ ...S.card, overflow: "hidden", cursor: "pointer", transition: "transform 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      onClick={() => onClick(product)}>
      <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display="none"; }} />
        {product.premium && <span style={{ position: "absolute", top: 8, right: 8, ...S.badge(C.premium) }}>⭐ Premium</span>}
        <button style={{ position: "absolute", top: 8, left: 8, background: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}>
          {liked ? "❤️" : "🤍"}
        </button>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{product.name}</div>
        <div style={{ color: C.greyDark, fontSize: 12, marginBottom: 8 }}>{product.seller}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.primary, fontWeight: 800, fontSize: 16 }}>GH₵{product.price}</span>
          <span style={{ fontSize: 11, color: C.greyDark }}>⭐ {product.rating}</span>
        </div>
        <button style={{ ...S.btn(), width: "100%", marginTop: 10, padding: "8px" }}
          onClick={e => { e.stopPropagation(); onAdd(product); }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ReelCard({ reel, onVisitStore }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  return (
    <div style={{ ...S.card, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.secondary}, #2d2d44)`, height: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
        {reel.video}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶️</div>
        </div>
        {reel.premium && <span style={{ position: "absolute", top: 8, right: 8, ...S.badge(C.premium) }}>⭐ Premium</span>}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={S.avatar(36)}>{reel.avatar}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{reel.seller}</div>
            <div style={{ fontSize: 11, color: C.greyDark }}>{reel.description}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btn("outline"), padding: "7px 14px", fontSize: 12 }}
            onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}>
            {liked ? "❤️" : "🤍"} {likes}
          </button>
          <button style={{ ...S.btn("grey"), padding: "7px 14px", fontSize: 12, color: C.text }}>🔗 {reel.shares}</button>
          <button style={{ ...S.btn(), padding: "7px 14px", fontSize: 12, marginLeft: "auto" }}
            onClick={() => onVisitStore(reel.sellerId)}>Visit Store</button>
        </div>
      </div>
    </div>
  );
}

function SellerCard({ seller, onFollow, onVisit }) {
  const [following, setFollowing] = useState(false);
  return (
    <div style={{ ...S.card, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <img src={seller.avatar} alt={seller.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display="none"; }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{seller.name}</span>
          {seller.premium && <span style={S.premiumBadge}>⭐</span>}
        </div>
        <div style={{ fontSize: 12, color: C.greyDark, marginBottom: 4 }}>{seller.category} · {seller.followers.toLocaleString()} followers</div>
        <div style={{ fontSize: 12, color: C.greyDark }}>⭐ {seller.rating} · {seller.products} products</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button style={{ ...S.btn(following ? "grey" : "primary"), padding: "7px 14px", fontSize: 12, color: following ? C.text : C.white }}
          onClick={() => { setFollowing(!following); onFollow && onFollow(seller); }}>
          {following ? "Following" : "Follow"}
        </button>
        <button style={{ ...S.btn("outline"), padding: "7px 14px", fontSize: 12 }} onClick={() => onVisit(seller)}>View</button>
      </div>
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────────

function Home({ setPage, cart, setCart, setSelectedSeller }) {
  const [activeStory, setActiveStory] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartAdded, setCartAdded] = useState(false);

  const filtered = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (p) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  return (
    <div style={S.page}>
      {cartAdded && (
        <div style={{ position: "fixed", top: 70, right: 20, background: C.success, color: "white", borderRadius: 10, padding: "10px 18px", zIndex: 200, fontWeight: 700, fontSize: 13 }}>
          ✅ Added to cart!
        </div>
      )}

      <SearchBar />

      {/* Stories */}
      <div style={{ ...S.card, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", minWidth: 64 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: C.grey, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `2px dashed ${C.primary}` }}>➕</div>
            <span style={{ fontSize: 10, color: C.greyDark, fontWeight: 600 }}>Your Story</span>
          </div>
          {STORIES.map(s => <StoryBubble key={s.id} story={s} onClick={setActiveStory} />)}
        </div>
      </div>

      {/* Premium Banner */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 14, padding: "18px 20px", marginBottom: 20, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Premium Promotion</div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>BeautyGlow Natural Skincare ⭐</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>Ghana's most trusted natural beauty brand. Shop now!</div>
        <button style={{ background: "white", color: C.primary, border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Shop Now</button>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} style={{ ...S.btn(activeCategory === cat ? "primary" : "grey"), padding: "8px 16px", whiteSpace: "nowrap", color: activeCategory === cat ? C.white : C.text, flexShrink: 0 }}
            onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      {/* Featured Products */}
      <div style={S.sectionTitle}>Featured Products</div>
      <p style={S.sectionSub}>Trending products from verified sellers</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onClick={setSelectedProduct} />)}
      </div>

      {/* Recommended Businesses */}
      <div style={S.sectionTitle}>Recommended Businesses</div>
      <p style={S.sectionSub}>Top sellers on E-Connect</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {SELLERS.slice(0, 3).map(s => <SellerCard key={s.id} seller={s} onVisit={(seller) => { setSelectedSeller(seller); setPage("store"); }} />)}
      </div>

      {/* Trending Reels */}
      <div style={S.sectionTitle}>Trending Reels</div>
      <p style={S.sectionSub}>Short videos from top sellers</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 80 }}>
        {REELS.slice(0, 4).map(r => <ReelCard key={r.id} reel={r} onVisitStore={(id) => { setSelectedSeller(SELLERS.find(s => s.id === id)); setPage("store"); }} />)}
      </div>

      {/* Story Viewer */}
      {activeStory && (
        <div style={S.modal} onClick={() => setActiveStory(null)}>
          <div style={{ background: C.secondary, borderRadius: 18, width: 320, height: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: "18px 18px 0 0" }}>
              <div style={{ height: "100%", width: "60%", background: C.white, borderRadius: "18px 0 0 0", transition: "width 5s linear" }} />
            </div>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={S.avatar(36)}>{activeStory.avatar}</div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{activeStory.user}</span>
            </div>
            <div style={{ fontSize: 80 }}>{activeStory.avatar}</div>
            <div style={{ color: "white", fontWeight: 700, marginTop: 16 }}>{activeStory.user}'s Story</div>
            <button style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer" }} onClick={() => setActiveStory(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div style={S.modal} onClick={() => setSelectedProduct(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ borderRadius: 12, height: 200, overflow: "hidden", marginBottom: 16 }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {selectedProduct.premium && <span style={{ ...S.badge(C.premium), marginBottom: 8 }}>⭐ Premium Store</span>}
            <h3 style={{ fontWeight: 800, fontSize: 20, margin: "8px 0 4px" }}>{selectedProduct.name}</h3>
            <div style={{ color: C.greyDark, fontSize: 13, marginBottom: 12 }}>By {selectedProduct.seller}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: C.primary, fontWeight: 800, fontSize: 26 }}>GH₵{selectedProduct.price}</span>
              <span style={{ color: C.greyDark, fontSize: 13 }}>⭐ {selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
            </div>
            <div style={{ background: C.grey, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.greyDark }}>
              📦 {selectedProduct.stock} items in stock · 🚚 Delivery available
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1 }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to Cart</button>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Discover({ setPage, setSelectedSeller }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("businesses");

  const filteredSellers = SELLERS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Discover</div>
      <p style={S.sectionSub}>Find new businesses, products and reels</p>
      <SearchBar onSearch={setSearch} placeholder="Search businesses, products..." />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["businesses", "products", "reels"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", color: tab === t ? C.white : C.text, textTransform: "capitalize" }}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "businesses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredSellers.map(s => <SellerCard key={s.id} seller={s} onVisit={(seller) => { setSelectedSeller(seller); setPage("store"); }} />)}
        </div>
      )}

      {tab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={() => {}} onClick={() => {}} />)}
        </div>
      )}

      {tab === "reels" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {REELS.map(r => <ReelCard key={r.id} reel={r} onVisitStore={(id) => { setSelectedSeller(SELLERS.find(s => s.id === id)); setPage("store"); }} />)}
        </div>
      )}
    </div>
  );
}

function Reels() {
  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Reels</div>
      <p style={S.sectionSub}>Short videos from top sellers on E-Connect</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 80 }}>
        {REELS.map(r => <ReelCard key={r.id} reel={r} onVisitStore={() => {}} />)}
      </div>
    </div>
  );
}

function StoreProfile({ seller, setPage, cart, setCart }) {
  const s = seller || SELLERS[0];
  const sellerProducts = PRODUCTS.filter(p => p.sellerId === s.id);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState("products");

  return (
    <div style={{ ...S.page, paddingTop: 0 }}>
      {/* Cover */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, height: 120, borderRadius: "0 0 20px 20px", marginBottom: -40, position: "relative" }}>
        <button style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}
          onClick={() => setPage("home")}>← Back</button>
      </div>

      <div style={{ ...S.card, margin: "0 0 16px", padding: "50px 20px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: -30, left: 20, width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `3px solid ${C.white}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <img src={s.avatar} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{s.name}</span>
              {s.premium && <span style={S.premiumBadge}>⭐</span>}
              {s.verified && <span style={{ fontSize: 14 }}>✅</span>}
            </div>
            <div style={{ color: C.greyDark, fontSize: 13, margin: "2px 0 8px" }}>{s.category} · {s.owner}</div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 12 }}>{s.description}</div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ num: s.followers.toLocaleString(), label: "Followers" }, { num: s.products, label: "Products" }, { num: s.rating, label: "Rating ⭐" }].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>{stat.num}</div>
                  <div style={{ fontSize: 11, color: C.greyDark }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ ...S.btn(following ? "grey" : "primary"), padding: "8px 16px", color: following ? C.text : C.white }}
              onClick={() => setFollowing(!following)}>{following ? "Following" : "Follow"}</button>
            <button style={{ ...S.btn("outline"), padding: "8px 16px" }}>💬 Message</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["products", "reels", "reviews"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", color: tab === t ? C.white : C.text, textTransform: "capitalize" }}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 80 }}>
          {sellerProducts.map(p => <ProductCard key={p.id} product={p} onAdd={(product) => setCart(prev => [...prev, { ...product, qty: 1 }])} onClick={() => {}} />)}
        </div>
      )}

      {tab === "reels" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 80 }}>
          {REELS.filter(r => r.sellerId === s.id).map(r => <ReelCard key={r.id} reel={r} onVisitStore={() => {}} />)}
        </div>
      )}

      {tab === "reviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 80 }}>
          {[{ user: "Kwame A.", rating: 5, text: "Excellent quality products! Fast delivery too.", date: "2 days ago" },
            { user: "Abena M.", rating: 4, text: "Great seller, very responsive to inquiries.", date: "1 week ago" },
            { user: "Yaw D.", rating: 5, text: "Highly recommend this store to everyone!", date: "2 weeks ago" }
          ].map((r, i) => (
            <div key={i} style={{ ...S.card, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{r.user}</span>
                <span style={{ color: C.greyDark, fontSize: 12 }}>{r.date}</span>
              </div>
              <div style={{ color: C.accent, marginBottom: 6 }}>{"⭐".repeat(r.rating)}</div>
              <div style={{ color: C.text, fontSize: 13 }}>{r.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Cart({ cart, setCart, setPage }) {
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", delivery: "delivery" });
  const [done, setDone] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const handleOrder = () => {
    setDone(true);
    setCart([]);
    setTimeout(() => { setDone(false); setCheckout(false); setPage("home"); }, 3000);
  };

  if (done) return (
    <div style={{ ...S.page, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontWeight: 800, fontSize: 24, color: C.success }}>Order Placed!</h2>
      <p style={{ color: C.greyDark }}>Your order has been sent to the sellers. You will be contacted shortly.</p>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Your Cart</div>
      <p style={S.sectionSub}>{cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <p style={{ color: C.greyDark }}>Your cart is empty. Start shopping!</p>
          <button style={{ ...S.btn(), marginTop: 16 }} onClick={() => setPage("home")}>Browse Products</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {cart.map(item => (
              <div key={item.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                  <div style={{ color: C.greyDark, fontSize: 12 }}>by {item.seller}</div>
                  <div style={{ color: C.primary, fontWeight: 800 }}>GH₵{item.price} × {item.qty}</div>
                </div>
                <button style={{ background: "none", border: "none", color: C.error, cursor: "pointer", fontSize: 20 }} onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ ...S.card, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.greyDark }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>GH₵{total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: C.greyDark }}>Delivery</span>
              <span style={{ fontWeight: 700, color: C.success }}>Calculated at checkout</span>
            </div>
            <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>GH₵{total}</span>
            </div>
          </div>

          <button style={{ ...S.btn(), width: "100%", padding: 14, fontSize: 15, marginBottom: 80 }} onClick={() => setCheckout(true)}>
            Proceed to Checkout
          </button>
        </>
      )}

      {checkout && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Checkout</h3>
            <p style={{ color: C.greyDark, fontSize: 13, marginBottom: 16 }}>Fill in your details to complete your order.</p>

            <label style={S.label}>Full Name</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

            <label style={S.label}>Phone Number</label>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder="+233..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label style={S.label}>Delivery Option</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {["delivery", "pickup"].map(opt => (
                <button key={opt} style={{ ...S.btn(form.delivery === opt ? "primary" : "grey"), flex: 1, color: form.delivery === opt ? C.white : C.text, textTransform: "capitalize" }}
                  onClick={() => setForm({ ...form, delivery: opt })}>{opt === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}</button>
              ))}
            </div>

            {form.delivery === "delivery" && (
              <>
                <label style={S.label}>Delivery Address</label>
                <input style={{ ...S.input, marginBottom: 12 }} placeholder="Your address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </>
            )}

            <div style={{ background: `${C.primary}10`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
              💳 Payment on delivery available. For direct payment contact: +233 54 194 0967
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn(), flex: 1 }} onClick={handleOrder}>Place Order</button>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setCheckout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Messages() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState({ 1: [{ from: "them", text: "Hello! How can I help you?" }], 2: [{ from: "them", text: "Your order has been shipped." }], 3: [{ from: "them", text: "Thank you for your purchase!" }] });

  const sendMsg = () => {
    if (!msg.trim()) return;
    setChats(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), { from: "me", text: msg }] }));
    setMsg("");
    setTimeout(() => {
      setChats(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), { from: "them", text: "Thanks for your message! We will get back to you shortly." }] }));
    }, 1000);
  };

  return (
    <div style={S.page}>
      {!selected ? (
        <>
          <div style={S.sectionTitle}>Messages</div>
          <p style={S.sectionSub}>Chat with sellers and buyers</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {MESSAGES.map(m => (
              <div key={m.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                onClick={() => setSelected(m)}>
                <div style={S.avatar(48)}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.user}</div>
                  <div style={{ color: C.greyDark, fontSize: 13, marginTop: 2 }}>{m.lastMsg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.greyDark }}>{m.time}</span>
                  {m.unread > 0 && <span style={{ background: C.primary, color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{m.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }} onClick={() => setSelected(null)}>←</button>
            <div style={S.avatar(40)}>{selected.avatar}</div>
            <span style={{ fontWeight: 700 }}>{selected.user}</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {(chats[selected.id] || []).map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: c.from === "me" ? "flex-end" : "flex-start" }}>
                <div style={{ background: c.from === "me" ? C.primary : C.grey, color: c.from === "me" ? "white" : C.text, borderRadius: c.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px", maxWidth: "70%", fontSize: 13 }}>
                  {c.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input style={{ ...S.input, flex: 1 }} placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
            <button style={{ ...S.btn(), padding: "10px 18px" }} onClick={sendMsg}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ setPage }) {
  const [tab, setTab] = useState("products");
  const [showPremium, setShowPremium] = useState(false);

  return (
    <div style={{ ...S.page, paddingTop: 0 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, height: 100, borderRadius: "0 0 20px 20px", marginBottom: -40 }} />
      <div style={{ ...S.card, margin: "0 0 16px", padding: "50px 20px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: -30, left: 20, width: 72, height: 72, borderRadius: "50%", background: C.white, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          👤
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Gideon Asante</div>
            <div style={{ color: C.greyDark, fontSize: 13, marginBottom: 12 }}>@gideonasante · Small Business Owner</div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ num: "124", label: "Following" }, { num: "890", label: "Followers" }, { num: "45", label: "Friends" }].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>{stat.num}</div>
                  <div style={{ fontSize: 11, color: C.greyDark }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <button style={{ ...S.btn("outline"), padding: "8px 14px", fontSize: 12 }}>Edit Profile</button>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <div style={{ ...S.card, flex: 1, padding: 12, textAlign: "center", border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 800, color: C.primary }}>234</div>
            <div style={{ fontSize: 11, color: C.greyDark }}>Reel Likes</div>
          </div>
          <div style={{ ...S.card, flex: 1, padding: 12, textAlign: "center", border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 800, color: C.primary }}>567</div>
            <div style={{ fontSize: 11, color: C.greyDark }}>Product Likes</div>
          </div>
          <div style={{ ...S.card, flex: 1, padding: 12, textAlign: "center", border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 800, color: C.primary }}>4.8⭐</div>
            <div style={{ fontSize: 11, color: C.greyDark }}>Store Rating</div>
          </div>
        </div>
        <button style={{ ...S.btn(), width: "100%", marginTop: 12, background: `linear-gradient(135deg, ${C.accent}, #FFA500)`, color: C.secondary }}
          onClick={() => setShowPremium(true)}>
          ⭐ Upgrade to Premium · GH₵10/month
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["products", "reels", "reviews"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", color: tab === t ? C.white : C.text, textTransform: "capitalize" }}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 80 }}>
          {PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onAdd={() => {}} onClick={() => {}} />)}
        </div>
      )}

      {tab === "reels" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 80 }}>
          {REELS.slice(0, 3).map(r => <ReelCard key={r.id} reel={r} onVisitStore={() => {}} />)}
        </div>
      )}

      {showPremium && (
        <div style={S.modal} onClick={() => setShowPremium(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
              <h3 style={{ fontWeight: 800, fontSize: 22 }}>Go Premium</h3>
              <p style={{ color: C.greyDark, fontSize: 13 }}>Boost your business visibility on E-Connect</p>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${C.accent}20, #FFA50020)`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 28, color: C.primary, textAlign: "center" }}>GH₵10<span style={{ fontSize: 14, fontWeight: 500 }}>/month</span></div>
            </div>
            {["Gold ⭐ badge beside your business name", "Higher visibility in search results", "Products appear more in recommendations", "Ability to run promotional ads", "Priority placement on homepage"].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ color: C.success, fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13 }}>{b}</span>
              </div>
            ))}
            <button style={{ ...S.btn(), width: "100%", marginTop: 16, background: `linear-gradient(135deg, ${C.accent}, #FFA500)`, color: C.secondary }}>
              Subscribe Now · GH₵10/month
            </button>
            <button style={{ ...S.btn("outline"), width: "100%", marginTop: 10 }} onClick={() => setShowPremium(false)}>Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState("overview");
  return (
    <div style={S.page}>
      <div style={S.sectionTitle}>Admin Dashboard</div>
      <p style={S.sectionSub}>Manage E-Connect platform</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["overview", "users", "premium", "reports"].map(t => (
          <button key={t} style={{ ...S.btn(tab === t ? "primary" : "grey"), padding: "8px 16px", color: tab === t ? C.white : C.text, textTransform: "capitalize" }}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[{ num: "1,240", label: "Total Users", icon: "👥" }, { num: "6", label: "Active Sellers", icon: "🏪" }, { num: "4", label: "Premium Stores", icon: "⭐" }, { num: "GH₵ 40", label: "Monthly Revenue", icon: "💰" }, { num: "8", label: "Products Listed", icon: "📦" }, { num: "5", label: "Active Reels", icon: "🎬" }].map(s => (
              <div key={s.label} style={{ ...S.card, padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 22, color: C.primary }}>{s.num}</div>
                <div style={{ fontSize: 12, color: C.greyDark }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, padding: 16, background: `${C.success}10`, border: `1px solid ${C.success}30` }}>
            <div style={{ fontWeight: 700, color: C.success, marginBottom: 4 }}>✅ Platform Status</div>
            <div style={{ fontSize: 13, color: C.greyDark }}>All systems operational. No issues detected.</div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SELLERS.map(s => (
            <div key={s.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.avatar(44)}>{s.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 700 }}>{s.name}</span>
                  {s.premium && <span style={S.premiumBadge}>⭐</span>}
                </div>
                <div style={{ fontSize: 12, color: C.greyDark }}>{s.owner} · {s.followers} followers</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...S.badge(C.success) }}>Active</span>
                <button style={{ ...S.btn("grey"), padding: "6px 12px", fontSize: 12, color: C.error }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "premium" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SELLERS.filter(s => s.premium).map(s => (
            <div key={s.id} style={{ ...S.card, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.avatar(44)}>{s.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{s.name} ⭐</div>
                <div style={{ fontSize: 12, color: C.greyDark }}>Premium · GH₵10/month · Active</div>
              </div>
              <span style={{ ...S.badge(C.premium) }}>Premium</span>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>No Reports Yet</div>
          <div style={{ color: C.greyDark, fontSize: 13 }}>All content is clean. No reports from users.</div>
        </div>
      )}
    </div>
  );
}

function Auth({ setUser, setPage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");

  const handle = () => {
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    setUser({ name: form.name || "Gideon Asante", email: form.email, role: form.email === "admin@econnect.gh" ? "admin" : "user" });
    setPage(form.email === "admin@econnect.gh" ? "admin" : "home");
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
              onClick={() => setIsLogin(t === "Login")}>{t}</button>
          ))}
        </div>

        {error && <div style={{ background: `${C.error}15`, border: `1px solid ${C.error}30`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.error, marginBottom: 14 }}>{error}</div>}

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

        <button style={{ ...S.btn(), width: "100%", padding: 14, fontSize: 15 }} onClick={handle}>
          {isLogin ? "Login" : "Create Account"}
        </button>

        <p style={{ color: C.greyDark, fontSize: 12, textAlign: "center", marginTop: 16 }}>
          Demo: any email/password · Admin: admin@econnect.gh
        </p>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("auth");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.head.appendChild(script);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
      });
    }
  }, []);

  if (page === "auth") return <Auth setUser={setUser} setPage={setPage} />;

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "reels", icon: "🎬", label: "Reels" },
    { id: "cart", icon: "🛒", label: "Cart", badge: cart.length },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  const renderPage = () => {
    switch (page) {
      case "home": return <Home setPage={setPage} cart={cart} setCart={setCart} setSelectedSeller={setSelectedSeller} />;
      case "discover": return <Discover setPage={setPage} setSelectedSeller={setSelectedSeller} />;
      case "reels": return <Reels />;
      case "store": return <StoreProfile seller={selectedSeller} setPage={setPage} cart={cart} setCart={setCart} />;
      case "cart": return <Cart cart={cart} setCart={setCart} setPage={setPage} />;
      case "messages": return <Messages />;
      case "profile": return <Profile setPage={setPage} />;
      case "admin": return <Admin />;
      default: return <Home setPage={setPage} cart={cart} setCart={setCart} setSelectedSeller={setSelectedSeller} />;
    }
  };

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setPage("home")}>E-Connect</div>
        <div style={S.navIcons}>
          <SearchBar placeholder="Search..." />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {user?.role === "admin" && (
            <button style={S.navBtn(page === "admin")} onClick={() => setPage("admin")}>Admin</button>
          )}
          <div style={S.avatar(34)}>{user?.name?.[0] || "U"}</div>
          <button style={{ ...S.btn("grey"), padding: "7px 12px", fontSize: 12, color: C.text }} onClick={() => { setUser(null); setPage("auth"); }}>Logout</button>
        </div>
      </nav>

      <div style={{ paddingBottom: 80 }}>{renderPage()}</div>

      <div style={S.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={S.bottomBtn(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: 22, position: "relative" }}>
              {item.icon}
              {item.badge > 0 && (
                <span style={{ position: "absolute", top: -4, right: -6, background: C.primary, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>
              )}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

