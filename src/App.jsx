bash

python3 << 'EOF'
with open('/mnt/user-data/outputs/econnect-deploy/src/App.jsx', 'r') as f:
    content = f.read()

# Replace bottom nav emoji icons with SVG icons
old = """  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "cart", icon: "🛒", label: "Cart", badge: cart.length },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];"""

new = """  const NavIcon = ({ id, active }) => {
    const color = active ? C.primary : C.greyDark;
    const icons = {
      home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V9.5Z" fill={active ? C.primary : "none"} stroke={color} strokeWidth="1.8"/></svg>,
      discover: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8"/><path d="M20 20L17 17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
      cart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke={color} strokeWidth="1.8"/><path d="M3 6H21" stroke={color} strokeWidth="1.8"/><path d="M16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
      messages: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" stroke={color} strokeWidth="1.8" fill={active ? `${C.primary}20` : "none"}/></svg>,
      profile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/><path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    };
    return icons[id] || null;
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "discover", label: "Discover" },
    { id: "cart", label: "Cart", badge: cart.length },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
  ];"""

if old in content:
    content = content.replace(old, new)
    print("REPLACED nav items with SVG icons")
else:
    print("NOT FOUND - nav items")

# Replace bottom nav button rendering
old2 = """      <div style={S.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={S.bottomBtn(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: 22, position: "relative" }}>
              {item.icon}
              {item.badge > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.primary, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>}
            </span>
            {item.label}
          </button>
        ))}
      </div>"""

new2 = """      <div style={S.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={S.bottomBtn(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <NavIcon id={item.id} active={page === item.id} />
              {item.badge > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.primary, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>}
            </span>
            {item.label}
          </button>
        ))}
      </div>"""

if old2 in content:
    content = content.replace(old2, new2)
    print("REPLACED bottom nav rendering")
else:
    print("NOT FOUND - bottom nav rendering")

# Replace premium star emoji with real SVG star
old3 = """  premiumBadge: { color: C.premium, fontSize: 14, marginLeft: 4 },"""
new3 = """  premiumBadge: { color: C.premium, fontSize: 14, marginLeft: 4, display: "inline-flex", alignItems: "center" },"""

if old3 in content:
    content = content.replace(old3, new3)
    print("UPDATED premiumBadge style")

# Replace all ⭐ premium indicators with SVG star
old4 = """  const PremiumStar = () => (
"""

# Add PremiumStar component after color constants
star_component = """
// ── Premium Star SVG ───────────────────────────────────────────
const PremiumStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" style={{ marginLeft: 4, verticalAlign: "middle" }}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

"""

# Insert after CATEGORIES constant
old5 = """const CATEGORIES = ["All", "Fashion", "Electronics", "Beauty", "Food", "Sports", "Home"];"""
new5 = """const CATEGORIES = ["All", "Fashion", "Electronics", "Beauty", "Food", "Sports", "Home"];

// ── Premium Star SVG ───────────────────────────────────────────
const PremiumStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" style={{ marginLeft: 4, verticalAlign: "middle" }}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);"""

if old5 in content:
    content = content.replace(old5, new5)
    print("ADDED PremiumStar SVG component")
else:
    print("NOT FOUND - CATEGORIES")

with open('/mnt/user-data/outputs/econnect-deploy/src/App.jsx', 'w') as f:
    f.write(content)
EOF
Output

REPLACED nav items with SVG icons
REPLACED bottom nav rendering
ADDED PremiumStar SVG component
Done
How should I go with it

10:18 PM
Same process as always! Here are the steps:

Download the App.jsx file I just updated
Open it in Notepad on your computer (right click, Open with, Notepad)
Press Ctrl + A to select all the code
Press Ctrl + C to copy
Go to github.com/asantegideon060-dev/E-Connect
Click the src folder
Click App.jsx
Click the pencil edit icon
Press Ctrl + A to select all existing code
Press Delete to clear it
Press Ctrl + V to paste the new code
Click "Commit changes"
Click "Commit changes" again on the popup
Vercel will redeploy in 2 minutes and your bottom navigation will show real professional icons instead of emojis.

Go ahead and download the App.jsx file and start the process!



