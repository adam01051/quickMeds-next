# QuickMeds Design System - Quick Reference Guide

## 📱 Complete Page Hierarchy

```
quickMeds.com/
│
├─ 🏠 Home (/)
│  ├─ Hero Search Bar
│  ├─ Featured Pharmacies Grid (6-8 cards)
│  ├─ Popular Pharmacies Carousel
│  ├─ Trust/Features Section (4-5 feature cards)
│  └─ Footer
│
├─ 🔍 Pharmacy Catalog (/pharmacies)
│  ├─ LEFT SIDEBAR
│  │  ├─ Search Input (autocomplete)
│  │  ├─ Location Filter (distance slider + auto-detect)
│  │  ├─ Pharmacy Type (retail, hospital, compounding, online)
│  │  ├─ Services (insurance, delivery, 24/7, consultation)
│  │  ├─ Delivery Fee Range (slider)
│  │  ├─ Sorting Options
│  │  ├─ Favorites Toggle
│  │  └─ Clear/Reset Button
│  │
│  └─ MAIN CONTENT
│     ├─ Sort & View Controls
│     ├─ Applied Filters Pills (removable)
│     ├─ Pharmacy Cards Grid (3 cols desktop, 2 tablet, 1 mobile)
│     │  └─ [Image, Name, Address, Distance, Rating, 3 Badges, CTA, Heart]
│     ├─ Results Count
│     ├─ Pagination/Infinite Scroll
│     └─ Empty State (if no results)
│
├─ 💊 Pharmacy Detail (/pharmacies/detail)
│  ├─ HERO
│  │  ├─ Large Image Carousel (4-6 photos)
│  │  ├─ Pharmacy Name + Rating
│  │  ├─ Action Buttons (Call, Directions, Share)
│  │  └─ Trust Badges
│  │
│  ├─ QUICK INFO
│  │  ├─ Rating & Review Count
│  │  ├─ Service Pills (24/7, Delivery, Insurance)
│  │  └─ Primary CTA (Order Now)
│  │
│  ├─ CONTENT SECTIONS
│  │  ├─ About Pharmacy
│  │  ├─ Services Offered
│  │  ├─ Popular Medications/Products
│  │  ├─ Reviews & Ratings
│  │  ├─ Location & Hours
│  │  └─ FAQ Accordion
│  │
│  └─ RIGHT SIDEBAR
│     ├─ Contact Card (Phone, Email, Website)
│     ├─ Share Buttons
│     └─ Report Link
│
├─ 👥 Community (/community)
│  ├─ Header (Title, Filters, Sort, Create CTA)
│  ├─ Community Card List
│  │  └─ [Author, Title, Excerpt, Engagement Metrics, Category Badge]
│  ├─ Sort Options (Recent, Popular, Trending)
│  ├─ Category Filters
│  └─ Create Post Button (bottom-right mobile, top-right desktop)
│
├─ 📰 Community Detail (/community/detail)
│  ├─ Article Hero (Title, Author, Date, Read Time)
│  ├─ Author Card (Avatar, Name, Role Badge, Bio)
│  ├─ Article Content (Text, Images)
│  ├─ Related Articles (3-4 similar)
│  ├─ Comments Section (Nested replies)
│  └─ Share Buttons
│
├─ 👤 Member Profile (/member)
│  ├─ Profile Card (Avatar, Name, Type, Stats)
│  ├─ Action Buttons (Follow, Message, Contact)
│  ├─ Tabs
│  │  ├─ About
│  │  ├─ Listed Pharmacies
│  │  ├─ Posts
│  │  └─ Reviews Received
│  └─ Content per Tab
│
├─ 👨‍⚕️ Pharmacy Owner Directory (/agent)
│  ├─ Owner Cards Grid
│  │  └─ [Avatar/Logo, Name, # Pharmacies, Rating, Location, CTA]
│  ├─ Filters (Location, Specialty, Rating)
│  └─ Search
│
├─ 👨‍⚕️ Pharmacy Owner Detail (/agent/detail)
│  ├─ Owner Profile
│  ├─ Credentials & Verification
│  ├─ Managed Pharmacies Grid
│  ├─ About Section
│  └─ Contact Info
│
├─ ℹ️ About Page (/about)
│  ├─ Mission Statement Hero
│  ├─ Company History/Timeline
│  ├─ Team Bios
│  ├─ Credentials/Certifications
│  ├─ Testimonials
│  └─ Contact Info
│
├─ 💬 Support Page (/cs)
│  ├─ FAQ Search
│  ├─ FAQ Accordion
│  ├─ Support Request Form
│  ├─ Ticket History (if logged in)
│  ├─ Knowledge Base Categories
│  └─ Contact Options
│
├─ 👤 Account Pages (/account/join)
│  ├─ Login Form
│  │  └─ [Email, Password, Remember Me, Forgot Password, Sign Up Link]
│  └─ Registration Form
│     └─ [Name, Email, Password, Confirm, Terms Checkbox, Submit]
│
├─ 👤 My Page (User Dashboard) (/mypage)
│  ├─ Profile Tab
│  │  └─ [Edit User Info, Password, Preferences]
│  ├─ Saved/Favorites Tab
│  │  └─ [Pharmacy Cards Grid]
│  ├─ Recently Viewed Tab
│  │  └─ [Pharmacy Cards Grid]
│  ├─ Orders/Transactions Tab
│  │  └─ [Past Orders List]
│  ├─ Notifications Tab
│  │  └─ [Notification Preferences]
│  ├─ Address Book Tab
│  │  └─ [Saved Addresses]
│  └─ Settings Tab
│     └─ [Privacy, Notifications, Language, Theme]
│
└─ 🔐 Admin Dashboard (/_admin/)
   ├─ TOP BAR
   │  └─ [Logo, Admin User, Settings, Logout]
   │
   ├─ LEFT SIDEBAR (Collapsible)
   │  ├─ Users
   │  │  └─ → Users List (/users)
   │  │
   │  ├─ Pharmacies
   │  │  ├─ → Pharmacies List (/properties)
   │  │  ├─ → Create New
   │  │  └─ → Pending Approval
   │  │
   │  ├─ Community
   │  │  ├─ → Posts List (/community)
   │  │  ├─ → Reports
   │  │  └─ → Moderation Queue
   │  │
   │  ├─ Support (CS)
   │  │  ├─ → FAQ Management (/cs/faq)
   │  │  ├─ → Inquiries (/cs/inquiry)
   │  │  ├─ → Notices (/cs/notice)
   │  │  └─ → Action Logs (/cs/logs)
   │  │
   │  ├─ Settings
   │  │  └─ → System Config
   │  │
   │  └─ Analytics (optional future)
   │
   └─ MAIN CONTENT (per module)
      ├─ Users Module (/admin/users)
      │  └─ [Table: ID, Name, Email, Type, Status, Actions]
      │
      ├─ Pharmacies Module (/admin/properties)
      │  └─ [Table: Name, Owner, Type, Status, Location, Actions]
      │
      ├─ Community Module (/admin/community)
      │  └─ [Posts List + Reports Queue]
      │
      └─ Support Module (/admin/cs)
         ├─ FAQ: Create/Edit/Delete entries
         ├─ Inquiries: Support tickets with status
         ├─ Notices: Create announcements
         └─ Logs: Audit trail
```

---

## 🎨 Color Palette

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Primary Red** | #E92C28 | Primary buttons, urgent alerts, featured items | rgb(233, 44, 40) |
| **Trust Blue** | #1646C1 | Secondary actions, links, trust indicators | rgb(22, 70, 193) |
| **Background Light** | #f4f6f8 | Page backgrounds | rgb(244, 246, 248) |
| **Pure White** | #ffffff | Cards, content areas | rgb(255, 255, 255) |
| **Healing Green** | #10A37F | Success, approved, positive | rgb(16, 163, 127) |
| **Medicine Purple** | #8B5CF6 | Accents, hover states, badges | rgb(139, 92, 246) |
| **Friendly Teal** | #0EA5E9 | Info states, secondary actions | rgb(14, 165, 233) |
| **Alert Orange** | #F97316 | Warnings, caution, special notices | rgb(249, 115, 22) |
| **Neutral Gray** | #6B7280 | Secondary text, disabled | rgb(107, 114, 128) |
| **Error Red** | #EF4444 | Errors, out of stock | rgb(239, 68, 68) |
| **Light Divider** | #E5E7EB | Border, divider | rgb(229, 231, 235) |
| **Dark Text** | #212121 | Primary text | rgb(33, 33, 33) |
| **Secondary Text** | #616161 | Secondary text, labels | rgb(97, 97, 97) |

### Gradient Combinations
- **Pharmacy Sunrise**: Green (#10A37F) → Teal (#0EA5E9) → Blue (#1646C1)
- **Healthcare Hero**: Blue (#1646C1) → Purple (#8B5CF6)
- **Wellness Glow**: Teal (#0EA5E9) → Green (#10A37F)

---

## 🔤 Typography System

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| **H1** | Poppins | 48px | 700 | 1.2 | Page titles, heroes |
| **H2** | Poppins | 36px | 700 | 1.3 | Section headers |
| **H3** | Poppins | 28px | 600 | 1.4 | Subsection headers |
| **H4** | Poppins | 22px | 600 | 1.4 | Card titles, features |
| **H5** | Poppins | 18px | 600 | 1.5 | Smaller headings |
| **Body Large** | Poppins | 16px | 400 | 1.6 | Main body, pharmacy names |
| **Body Regular** | Poppins | 14px | 400 | 1.6 | Secondary body text |
| **Label** | Poppins | 12px | 500 | 1.5 | Labels, badges, captions |
| **Button** | Poppins | 14px | 600 | 1.5 | Button text |

**Font Weights Available**: 100, 200, 300, 400, 500, 600, 700, 800, 900

---

## 📐 Spacing System

| Scale | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Tight spacing, icon padding |
| **sm** | 8px | Small margins, component padding |
| **md** | 16px | Default padding, card spacing |
| **lg** | 24px | Section spacing, large margins |
| **xl** | 32px | Major section breaks |
| **2xl** | 48px | Hero sections, page margins |
| **3xl** | 64px | Large content spacing |

---

## 🧩 Key Component Specs

### Cards
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 12px
- **Padding**: 16px
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)` (default)
- **Shadow Hover**: `0 8px 16px rgba(0,0,0,0.12)`
- **Background**: White
- **Border Radius**: 12px
- **Transition**: 200ms ease-out

### Buttons

#### Primary Button
- **Background**: #E92C28
- **Text**: White, 600 weight
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **Hover**: Darken to #D42422 + lift
- **Active**: #C01E1A
- **Disabled**: Gray + 50% opacity

#### Secondary Button
- **Background**: Transparent
- **Border**: 2px solid #1646C1
- **Text**: #1646C1
- **Hover**: Light blue background (#F0F4FF)
- **Disabled**: Gray

#### Icon Button
- **Size**: 40x40px
- **Hover Background**: 2% color opacity

### Inputs
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Focus**: Border #1646C1 + `0 0 0 3px rgba(22,70,193,0.1)` shadow
- **Error**: Border #EF4444 + red shadow
- **Disabled**: Background #F9FAFB

### Badges
- **Padding**: 6px 12px
- **Border Radius**: 6px (pill style) or 4px (square)
- **Font Size**: 12px, 500 weight
- **Color**: Context-based (success=green, warning=orange, info=blue)

---

## 🎬 Animation Guidelines

| Interaction | Duration | Easing | Details |
|-------------|----------|--------|---------|
| **Page Transition** | 300ms | ease-out | Fade + subtle slide-up |
| **Card Hover** | 200ms | ease-out | translateY(-4px) + shadow elevation |
| **Button Hover** | 200ms | ease-out | Scale 1.02 |
| **Button Click** | 100ms | ease-out | Scale 0.98 → 1.0 (press feedback) |
| **Like Toggle** | 300ms | spring | Scale-up + color change |
| **Filter Results** | 300ms | ease-out | Staggered fade + slide-up (50ms per item) |
| **Modal Open** | 300ms | ease-out | Fade + scale 0.95 → 1.0 |
| **Modal Close** | 200ms | ease-out | Reverse animation |
| **Success Flash** | 400ms | ease-out | Green highlight + checkmark scale |
| **Error Shake** | 300ms | ease-out | Horizontal shake (±4px) |
| **Loading Pulse** | 2000ms | ease-in-out | Opacity 0.5 → 1.0 → 0.5 |
| **Scroll Reveal** | 400ms | ease-out | Fade + translateY(20px) |

**Framer Motion Spring Config**:
```typescript
spring: { damping: 15, mass: 1, stiffness: 100 }
```

---

## 📱 Responsive Breakpoints

| Device | Width | Grid Cols | Navigation |
|--------|-------|-----------|------------|
| **Mobile** | 320-640px | 1 | Bottom nav bar |
| **Tablet** | 641-1024px | 2 | Top + Collapsible sidebar |
| **Desktop** | 1025px+ | 3-4 | Top nav + Fixed sidebar |

**Container Max-Width**: 1400px
**Horizontal Padding**: 24px (desktop), 16px (tablet), 8px (mobile)

---

## 🏗️ Component Library Priority

### Tier 1 (Foundation)
- [ ] Button (Primary, Secondary, Icon, Loading states)
- [ ] Input (Text, Textarea, Select, Search)
- [ ] Card (Base, Pharmacy, Community, Admin)
- [ ] Badge (Status, Category, Verification)
- [ ] Checkbox & Radio
- [ ] Toggle/Switch

### Tier 2 (Navigation)
- [ ] Navbar/Header
- [ ] Sidebar
- [ ] Footer
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Pagination

### Tier 3 (Complex)
- [ ] Modal/Dialog
- [ ] Dropdown/Menu
- [ ] Autocomplete Search
- [ ] Image Carousel
- [ ] Rating Component
- [ ] Accordion/Collapsible

### Tier 4 (Domain-Specific)
- [ ] Pharmacy Card
- [ ] Filter Panel
- [ ] Review Card
- [ ] Favorite/Heart Button
- [ ] Location Picker
- [ ] Hours Table

---

## 📊 Layout Patterns

### Featured Section
```
Hero Title
    ↓
Grid of Cards (featured items)
    ↓
"See All" or "Load More" CTA
```

### List with Sidebar
```
┌─────────────────┬──────────────────────┐
│                 │                      │
│ Left Sidebar    │  Main Content Grid   │
│ - Filters       │  - Sort Controls     │
│ - Search        │  - Card Grid         │
│ - Categories    │  - Pagination        │
│                 │                      │
└─────────────────┴──────────────────────┘
```

### Detail Page
```
Hero Section (Image + Overlay)
    ↓
Quick Info Section (Rating, CTA)
    ↓
Content Tabs/Sections (scrollable)
    ↓
Related/Sidebar Info
    ↓
Footer
```

### Form Page
```
Form Title
    ↓
Form Fields (organized in sections)
    ↓
Required/Optional Indicators
    ↓
Primary CTA Button
    ↓
Secondary Links
```

---

## 🎯 Accessibility Checklist

- [ ] Color contrast 4.5:1 (text on background)
- [ ] Focus indicators visible on all interactive elements
- [ ] Semantic HTML (nav, main, article, section)
- [ ] Alt text for all images
- [ ] ARIA labels for icons & buttons
- [ ] Keyboard navigation fully supported
- [ ] Tab order is logical
- [ ] Respect `prefers-reduced-motion`
- [ ] Form labels associated with inputs
- [ ] Touch targets 44x44px minimum
- [ ] Screen reader tested
- [ ] No color-only information

---

## 💻 Technologies & Libraries

| Tool | Purpose | Version |
|------|---------|---------|
| Next.js | React framework | 14.2.0 |
| Material-UI | Component library | 5.10.1 |
| Apollo Client | GraphQL client | 3.5.10 |
| Framer Motion | Animation library | 12.40.0 |
| SCSS | Styling | Built-in |
| Phosphor React | Icons | Latest |
| next-i18next | i18n | 21.6.11 |
| TypeScript | Type safety | Latest |

---

## 🚀 Quick Implementation Tips

1. **Start with design tokens**: Export colors, spacing, typography to CSS variables
2. **Component-first development**: Build components before pages
3. **Use CSS modules** for scoped styles alongside global SCSS
4. **Leverage Material-UI theme customization** to align with design system
5. **Test on real devices**: Mobile, tablet, desktop
6. **Performance first**: Lighthouse scores 90+ target
7. **Animation polish last**: Add Framer Motion after structure is solid
8. **Accessibility embedded**: Not a final pass, check throughout

---

## 📚 File Structure Reference

```
/libs/
  ├── components/
  │   ├── layout/
  │   │   ├── LayoutHome.tsx
  │   │   ├── LayoutBasic.tsx
  │   │   ├── LayoutAdmin.tsx
  │   │   └── LayoutFull.tsx
  │   ├── common/
  │   │   ├── AgentCard.tsx
  │   │   ├── BrandLogo.tsx
  │   │   ├── CommunityCard.tsx
  │   │   ├── PropertyCard.tsx (pharmacy card)
  │   │   └── Filter.tsx
  │   ├── property/ (TODO: rename to pharmacy/)
  │   ├── homepage/
  │   ├── community/
  │   ├── admin/
  │   ├── Top.tsx (navbar)
  │   ├── Footer.tsx
  │   └── Chat.tsx
  ├── scss/
  │   ├── variables.scss (update with design tokens)
  │   ├── MaterialTheme/
  │   │   ├── index.ts (theme config)
  │   │   ├── shadow.ts
  │   │   ├── typography.ts
  │   │   └── styled.ts
  │   ├── pc/ (desktop styles)
  │   ├── mobile/ (mobile styles)
  │   └── app.scss (global)
  ├── apollo/ (GraphQL client)
  ├── hooks/ (custom React hooks)
  ├── types/ (TypeScript types)
  └── enums/
/pages/
  ├── index.tsx (home)
  ├── pharmacies/ (catalog)
  ├── agent/ (owner directory)
  ├── community/
  ├── member/
  ├── mypage/
  ├── cs/ (support)
  ├── account/ (login/signup)
  ├── about/
  ├── _admin/ (admin dashboard)
  └── _app.tsx, _document.tsx
```

---

## ✅ Handoff Checklist for Codex

- [ ] All 10+ main pages designed
- [ ] All admin modules designed
- [ ] Component library documented (20+ components)
- [ ] Design tokens exported (colors, spacing, typography)
- [ ] Micro-interactions specified (animations, transitions)
- [ ] Responsive breakpoints tested
- [ ] Accessibility audit passed
- [ ] Figma design file created (component library)
- [ ] Implementation guide written
- [ ] Color palette with usage guide
- [ ] Typography scale with examples
- [ ] Navigation structure clear
- [ ] Approved by stakeholders

