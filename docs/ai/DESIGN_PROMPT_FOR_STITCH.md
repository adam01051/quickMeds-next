# QuickMeds Unique Design System Prompt for Stitch.ai

## PROJECT BRIEF

### Vision
QuickMeds is a **modern pharmacy marketplace platform** that connects users with trusted pharmacies, enabling convenient access to medications, health advice, and pharmacy services. The platform bridges gap between patients and healthcare providers.

### Target Users
1. **End Customers**: People seeking medications, health products, and pharmacy services
2. **Pharmacy Owners/Operators**: Managing pharmacy inventory and customer interactions
3. **Platform Admins**: Managing users, pharmacies, community content, and support

### Core Business Model
- B2C marketplace: Users discover and interact with pharmacies
- B2B: Pharmacy owners manage presence and inventory
- B2B2C: Admin manages ecosystem quality and support

---

## CURRENT STATE ANALYSIS

### Existing Tech Stack
- **Frontend**: Next.js 14.2 (Pages Router) + Material-UI 5 + SCSS

- **State**: Apollo Client for GraphQL with server-side rendering
- **Animations**: Framer Motion available but underutilized
- **Internationalization**: Supports EN, KR, RU

### Current Visual State
- **Strengths**: Clean Material-UI structure, consistent spacing, responsive layout
- **Weaknesses**: Generic corporate aesthetic, lacks pharmacy/healthcare identity, dated Material-UI look, minimal animation/delight, no differentiation from standard real-estate origins
- **Opportunity**: Transform from "generic marketplace" to "trusted healthcare platform"

### Historical Context
- Recently migrated from real-estate (Nestar) to pharmacy domain
- UI terminology updated but visual identity is still generic/clinical
- No unique brand personality or healthcare-specific design language

---

## DESIGN VISION FOR UNIQUENESS

### Design Direction: "Modern Healthcare, Trusted Simplicity"
Create a **premium, trustworthy, human-centered pharmacy marketplace** that feels:

- **Medical but Warm**: Healthcare credentials without sterile clinical coldness
- **Trustworthy**: Transparent, professional, secure-feeling
- **Effortless**: Intuitive navigation, frictionless pharmacy discovery
- **Premium**: Subtle refinement, attention to detail, delightful interactions
- **Accessible**: Inclusive design for all ages, clear information hierarchy
- **Local**: Supports multiple languages/regions, location-aware pharmacy discovery

### Key Differentiators
1. **Pharmacy-First Information Architecture**: Cards, filters, and details prioritize pharmacy-specific data (medication availability, delivery, insurance, operating hours)
2. **Geolocation Intelligence**: Visual emphasis on nearby pharmacies, location-based filtering, delivery radius
3. **Trust Signals**: Ratings, verification badges, reviews, insurance partnerships prominently featured
4. **Medication Focus**: Product/medication discovery as primary flow, not pharmacy as destination
5. **Micro-interactions**: Delightful feedback on search, filtering, favoriting, ordering
6. **Healthcare Accessibility**: Clear CTAs for prescription uploads, pharmacist consultation, emergency access

---

## SITE STRUCTURE & PAGE DESIGN REQUIREMENTS

### 🏠 Home Page (`/`)
**Purpose**: Hero entry point, prime pharmacy discovery, value proposition

**Sections**:
1. **Hero/Search**: 
   - Large, prominent search bar with "Find Nearby Pharmacies" emphasis
   - Quick category filters below (Medicine, Wellness, Prescription, Consult)
   - Geolocation selector (map integration nice-to-have)
   - Call-to-action: "Upload Prescription" or "Start Shopping"

2. **Featured Pharmacies Section**:
   - 6-8 pharmacy cards in grid (featured by rank)
   - Card shows: Pharmacy logo/image, name, rating, 1-2 specialty flags (24h delivery, accepts insurance), distance, quick-action buttons
   - Hover state: Subtle lift, reveal full details

3. **Popular Pharmacies Section**:
   - Carousel or grid of most-viewed pharmacies
   - Tone: Softer visual treatment than featured (secondary importance)
   - Shows social proof: "Viewed 2.5K times this week"

4. **Trust/Features Section**:
   - 4-5 feature cards: (1) Find Nearby, (2) Fast Delivery, (3) Insurance Compatible, (4) Licensed Pharmacists, (5) Verified Medications
   - Each with icon, short copy, subtle CTA

5. **Footer**: Links, company info, support, language selector

**Design Unique Elements**:
- Subtle animation on page load (stagger featured pharmacies entrance)
- Soft gradient background or subtle pattern (medical-but-not-clinical)
- Location pin icons that feel premium (not generic)
- Pharmacy hero imagery: clean, modern pharmacy photos or illustrations

---

### 🔍 Pharmacy Catalog/Search Page (`/pharmacies`)
**Purpose**: Primary discovery interface; users browse, filter, compare pharmacies

**Layout (Desktop)**:
- Left Sidebar (25%): Advanced filters + search box
- Main Content (75%): Pharmacy results grid + sorting controls

**Left Sidebar - Advanced Filters**:
1. **Search Input**: Searchable text with auto-complete, icon placeholder
2. **Location Filter**: 
   - Interactive map selector or distance slider (1, 5, 10, 25+ km)
   - Current location auto-detect button
3. **Pharmacy Type**: 
   - Icons + labels: Retail, Hospital, Compounding, Online
   - Single or multi-select with visual feedback
4. **Services Filter**:
   - Checkboxes: Accepts Insurance, Has Delivery, 24/7 Hours, Compounding, Pharmacist Consultation
5. **Delivery Fee Range**: Slider from $0-$50 (currency-appropriate)
6. **Sort Controls**: Last, Popular, Highly Rated, Closest, Highest Review
7. **Clear/Reset Button**: Clear visual affordance
8. **Favorites Button**: Toggle to show only liked pharmacies

**Main Content - Grid**:
- Responsive grid: 3 columns (desktop), 2 (tablet), 1 (mobile)
- **Pharmacy Card** (per PropertyCard):
  - Image: High-quality pharmacy/storefront photo or branded image
  - Pharmacy Name + Address + Distance
  - Rating: ⭐⭐⭐⭐⭐ (4.8) + review count
  - 3 Key Facts: (1) "24/7 Open", (2) "Accepts Insurance", (3) "Delivery Available" - shown as badges/icons
  - Primary CTA: "View Details" button
  - Heart/Like button (top-right, persistent)
  - Hover: Lift effect, show full description snippet, brighten CTA

- **Sort/View Controls** (top-right):
  - Sorting dropdown
  - List/Grid toggle view (optional)
  - Results count

**Design Unique Elements**:
- Sidebar: Modern, clean, uses card-based sections with light borders
- Cards: Pharmacy photos with soft shadow, badge system for quick visual scanning
- Filter pills: Show applied filters above results (clickable to remove)
- Empty state: Helpful illustration + "No pharmacies found" copy with filter suggestions
- Loading state: Skeleton cards with gentle pulse animation

---

### 💊 Pharmacy Detail Page (`/pharmacies/detail`)
**Purpose**: Deep dive into pharmacy information, decision-making page

**Layout (Hero + Content Sections)**:

**Hero Section**:
- Large pharmacy image (carousel with 4-6 photos)
- Overlay gradient with pharmacy name, rating, address
- Quick action buttons: Call, Direction (Google Maps), Share
- Trust badges: Verified, Certified, Insurance Partner logos

**Above Fold**:
- Pharmacy Name, Address, Distance
- ⭐⭐⭐⭐⭐ (4.8/5) with 342 reviews link
- Key Services Pills: "24/7", "Delivery", "Insurance Accepted", "Online Order"
- Primary CTA: "Order Now" or "Contact Pharmacy"
- Like/Favorite button

**Scrollable Content Sections**:

1. **About Pharmacy**:
   - Description paragraph
   - Founded year, licenses, certifications (badges)
   - Operating hours (table or time picker)

2. **Services Offered**:
   - Medication categories
   - Consultation services (pharmacist chat)
   - Delivery info (fee, radius, hours)
   - Insurance partnerships (logo cards)

3. **Popular Medications/Products**:
   - 6-8 medication cards with image, name, common uses, price range
   - "View Full Catalog" link

4. **Reviews & Ratings**:
   - Rating breakdown (5☆ 234, 4☆ 98, etc.)
   - Top 5 reviews with photos, author, date
   - "Write Review" CTA

5. **Location & Hours**:
   - Google Maps embed
   - Table: Mon-Sun with opening/closing hours
   - Special hours note for holidays

6. **FAQ Section**:
   - Accordion items: Delivery timeframes, Payment methods, Return policy, etc.

**Sidebar (Right, Desktop)**:
- Contact card: Phone, Email, Website buttons
- Share buttons: WhatsApp, SMS, Email, Copy Link
- Report pharmacy link

**Design Unique Elements**:
- Photo carousel with dots/arrows (smooth transitions)
- Service pills: Colorful, icon-based badges (not just text)
- Reviews: Photo + author name + date + star rating inline
- Timeline-style hours display (creative alternative to table)
- Info cards: Subtle border + small shadow, not dense
- CTA buttons: Primary action very prominent, secondary actions outlined

---

### 👥 Community Page (`/community`)
**Purpose**: User discussions, health tips, community engagement

**Layout**:
- **Header**: Section title, category filters, sort controls, create post button
- **Main Feed**: Vertical list of discussion cards
- **Sidebar** (optional): Popular tags, trending topics, member stats

**Community Card Components**:
- Author avatar + name + timestamp
- Post title (prominent)
- Post excerpt (2-3 lines, truncated with "Read More")
- Engagement: 👍 (likes), 💬 (comments count), 👁 (views count)
- Category badge (e.g., "Health Tip", "Q&A", "Product Review")
- Author badge (if healthcare provider)

**Sort/Filter Options**:
- Recent, Most Liked, Most Commented, Trending This Week
- Category filters: All, Health Tips, Q&A, Product Reviews, Announcements

**Design Unique Elements**:
- Clean card design with author info in header
- Engagement metrics at bottom with icons
- Category badges with pharmacy-appropriate colors
- Hover: Lift + lighten background
- Create post CTA: Fixed bottom-right button (mobile) or top-right (desktop)

---

### 📰 Community Detail Page (`/community/detail`)
**Purpose**: Full article/discussion view, deep engagement

**Layout**:
- **Hero**: Article title, author, date, category, read time estimate
- **Author Card**: Avatar, name, role badge, follow button, bio snippet
- **Article Content**: Full text with images, formatting
- **Related Articles**: 3-4 similar posts at bottom
- **Comments Section**: Nested comments with reply capability
- **Share Buttons**: Top + Bottom sticky

**Design Unique Elements**:
- Article content: Generous line height, optimal text width, readable typography
- Author card: Trustworthy design with verification checkmark if applicable
- Comments: Nested with visual indentation, author avatars on each comment
- Comment input: Rich text editor (bold, italic, link, code formatting)

---

### 👤 Member Profile Page (`/member`)
**Purpose**: User profile, pharmacy owner profile directory

**Layout**:
- **Profile Card**: Avatar, name, member type badge, join date, stats (pharmacies managed, posts, followers)
- **Action Buttons**: Follow/Message/Contact/Report
- **Tabs**: About, Listed Pharmacies, Posts, Reviews
- **About Section**: Bio, specialties, verification badges
- **Listed Pharmacies**: Grid of owner's pharmacies
- **Posts**: Community posts by member
- **Reviews Received**: Grid of review cards

**Design Unique Elements**:
- Professional profile layout (not social-media casual)
- Verification badges prominent
- Stats cards with icons
- Role-based layout (different for pharmacist vs regular user)

---

### 👨‍⚕️ Pharmacy Owner/Agent Pages (`/agent`, `/agent/detail`)
**Purpose**: Directory of pharmacies, filter by pharmacy owner

**Agent List** (`/agent`):
- Grid of pharmacy owner cards
- Each card: Avatar/logo, name, # of pharmacies, rating, specialties, location
- Filters: Location, pharmacy count, rating

**Agent Detail** (`/agent/detail`):
- Owner profile info + credentials
- All pharmacies managed (grid with cards)
- About section, contact info
- Experience/background

---

### 🛠️ Admin Dashboard (`/_admin/`)
**Purpose**: System administration, moderation, analytics

**Admin Layout**:
- **Top Bar**: Logo, admin user info, settings, logout
- **Sidebar Menu** (Left, collapsible):
  - Users (List, Reports)
  - Pharmacies (List, Create, Pending Approval, Reports)
  - Community (Posts, Comments, User Reports)
  - Support (FAQ, Inquiries, Notice, Logs, Feedback)
  - Settings (Account, System)
- **Main Content**: Respective module screens

**Users Module** (`_admin/`):
- Table: User ID, Name, Email, Member Type, Status, Actions (view, edit, deactivate, delete)
- Filters: Member type, status, registration date
- Search: By name/email

**Pharmacies Module** (`_admin/properties/`):
- Table: Pharmacy name, owner, type, status, location, last updated, actions
- Bulk actions: Approve, Reject, Feature, Suspend
- Create pharmacy form

**Community Module** (`_admin/community/`):
- Posts list: Author, title, category, reported/flagged status, actions
- Reports list: Reported content, reason, reporter, actions (approve content, delete, warn user)
- Moderation tools

**Support Module** (`_admin/cs/`):
- **FAQ** (`faq`): Create, edit, delete FAQ entries, category organization
- **Inquiries** (`inquiry`): User support tickets with status (open, in-progress, resolved), assignment, priority
- **Notice** (`notice`): Create announcements/notices for platform
- **Logs** (`logs`): Admin action logs, user activity audit trail

**Design Unique Elements**:
- Clean, professional admin UI (not flashy)
- Dark/light mode toggle
- Dense information tables (but readable)
- Bulk action selections with checkboxes
- Modal dialogs for create/edit flows
- Status badges: color-coded (active=green, pending=yellow, inactive=gray, error=red)

---

### 🏥 About Page (`/about`)
**Purpose**: Company info, mission, trust building

**Sections**:
- Mission statement hero
- Company history/timeline
- Team bios (with photos, roles)
- Credentials/certifications
- Testimonials from pharmacies and users
- Contact info
- FAQ

---

### 💬 Support/CS Page (`/cs`)
**Purpose**: Customer support hub, self-service

**Sections**:
- FAQ search + accordion
- Contact form for inquiries
- Ticket history (if logged in)
- Knowledge base categories
- Chatbot availability indicator
- Emergency support contact

---

### 👤 My Page (User Dashboard) (`/mypage`)
**Purpose**: User account management, preferences, order history, saved items

**Tabs/Sections**:
1. **Profile**: Edit user info, password, preferences
2. **Saved/Favorites**: User's favorite pharmacies (grid)
3. **Recently Viewed**: Pharmacy browsing history
4. **Orders/Transactions**: Past pharmacy orders (if implemented)
5. **Notifications**: System notifications, preferences
6. **Address Book**: Saved addresses for delivery
7. **Settings**: Privacy, notifications, language, theme

**Design Unique Elements**:
- Card-based layout for sections
- Edit inline or modal forms
- Notification preferences as toggles
- Clear, scannable information

---

## DESIGN SYSTEM SPECIFICATIONS

### Color Palette

**Primary Colors** (Must-Keep for Brand Consistency):
- **Vibrant Red/Coral** (#E92C28): Primary action, urgent alerts, featured items
- **Trust Blue** (#1646C1): Secondary actions, links, trust indicators
- **Off-White** (#f4f6f8): Background default
- **Pure White** (#ffffff): Cards, paper, content areas

**Secondary Healthcare Colors** (NEW - Unique to Pharmacy):
- **Healing Green** (#10A37F): Success, positive feedback, approved status
- **Medicine Purple** (#8B5CF6): Hover states, accents, badges
- **Friendly Teal** (#0EA5E9): Info states, secondary actions
- **Alert Orange** (#F97316): Warnings, caution, special notices
- **Neutral Gray** (#6B7280): Secondary text, disabled states
- **Error Red** (#EF4444): Errors, out of stock, issues

**Gradients** (NEW - Adds Visual Depth):
- "Pharmacy Sunrise": Green → Teal → Blue (delivery, trust actions)
- "Healthcare Hero": Blue → Purple (hero sections)
- "Wellness Glow": Teal → Green (wellness/health content)

### Typography

**Font Family**: Poppins (maintain current) - clean, modern, professional

**Type Scale**:
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 48px | 700 | 1.2 | Page titles, major sections |
| H2 | 36px | 700 | 1.3 | Section headers |
| H3 | 28px | 600 | 1.4 | Subsection headers |
| H4 | 22px | 600 | 1.4 | Card titles, feature names |
| H5 | 18px | 600 | 1.5 | Smaller headings |
| Body Large | 16px | 400 | 1.6 | Main body text |
| Body Regular | 14px | 400 | 1.6 | Secondary body text |
| Label | 12px | 500 | 1.5 | Labels, badges, captions |
| Button | 14px | 600 | 1.5 | Button text |

**Best Practices**:
- H1/H2 for major transitions (hero titles)
- H3 for section breaks
- Body Large for pharmacy names, important info
- Body Regular for descriptions
- Labels for metadata (address, distance, fees)

### Spacing & Layout

**Base Unit**: 8px (Material-UI standard)

**Spacing Scale**:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

**Containers**:
- Max-width: 1400px (desktop)
- Horizontal padding: 24px (desktop), 16px (tablet), 8px (mobile)
- Vertical spacing: Sections spaced with lg (24px) - xl (32px)

### Cards & Surfaces

**Card Design** (Pharmacy Cards, Content Cards):
- Border: 1px solid #E5E7EB (light gray)
- Border-radius: 12px (modern, not stark 0px, not overly rounded)
- Padding: 16px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)` (light, subtle)
- Hover shadow: `0 8px 16px rgba(0,0,0,0.12)` (elevated feel)
- Background: White (#ffffff)

**Premium Card Variant** (Featured items):
- Border: None or subtle gradient border
- Shadow: `0 4px 20px rgba(0,0,0,0.08)` (more prominent)
- Gradient background: Soft white-to-cream or colored overlay (10% opacity)

### Buttons

**Primary Button**:
- Background: #E92C28 (Primary Red)
- Text: White, 600 weight
- Padding: 12px 24px
- Border-radius: 8px
- Hover: Darken to #D42422 or add subtle lift
- Active: Deeper color #C01E1A
- Disabled: Gray-out with reduced opacity

**Secondary Button**:
- Background: Transparent
- Border: 2px solid #1646C1
- Text: #1646C1, 600 weight
- Hover: Light blue background (#F0F4FF) or border-highlight
- Disabled: Gray border + gray text

**Icon Button**:
- 40x40px circular area for touch
- Subtle hover background (2% color opacity)
- No border by default

**Like/Heart Button**:
- Unfilled state: Outline icon, gray color
- Filled state: Solid icon, brand red (#E92C28)
- Smooth transition (0.2s ease)

### Forms & Inputs

**Text Inputs**:
- Border: 1px solid #D1D5DB (light gray)
- Border-radius: 8px
- Padding: 12px 16px
- Font size: 14px
- Focus: Border color → #1646C1, shadow: `0 0 0 3px rgba(22,70,193,0.1)`
- Error: Border color → #EF4444, shadow: `0 0 0 3px rgba(239,68,68,0.1)`
- Disabled: Background #F9FAFB, text #9CA3AF

**Select/Dropdowns**:
- Similar styling to text input
- Dropdown icon on right
- Option background: White, hover → light gray

**Checkboxes & Radio**:
- Unchecked: 20x20px square border, #D1D5DB
- Checked: Background #1646C1, white checkmark
- Hover: Subtle border highlight

**Toggle/Switch**:
- Width: 48px, height: 28px
- Unchecked: Gray background, white circle on left
- Checked: Green background (#10A37F), white circle on right
- Smooth animation (0.2s)

### Icons & Imagery

**Icon Style**:
- Use Phosphor React (consistent with current)
- 24px default size (scale as needed)
- Stroke weight: 2 (medium)
- Colors: Match context (primary, secondary, success, error)

**Pharmacy Imagery**:
- Consistent brand photography or illustrations
- Real pharmacy/storefront photos preferred (high-quality)
- Illustrations: Clean, modern, healthcare-appropriate (not clipart)
- Color overlay for branding (subtle tint of primary color, 5-10% opacity)

**Icons for Key Concepts**:
- Nearby/Location: Location pin (Phosphor MapPin)
- Pharmacy: Medical cross or storefront
- Delivery: Truck or package icon
- Insurance: Shield or checkmark badge
- Rating: Star (filled/unfilled)
- Medication: Pills or capsule
- Consultation: Chat bubble or person with stethoscope
- Favorite/Like: Heart
- Hours: Clock
- Phone: Phone icon

### Shadows & Elevation

**Shadow System**:
- **Depth 1** (Cards, low elevation): `0 1px 3px rgba(0,0,0,0.1)`
- **Depth 2** (Hover cards, tooltips): `0 8px 16px rgba(0,0,0,0.12)`
- **Depth 3** (Modals, popovers): `0 20px 40px rgba(0,0,0,0.15)`
- **Depth 4** (Floating action buttons, dropdowns): `0 12px 24px rgba(0,0,0,0.12)`

### Borders & Dividers

**Border Colors**:
- Primary divider: #E5E7EB (light gray, 1px)
- Subtle divider: #F3F4F6 (lighter gray, 1px)
- Strong divider: #D1D5DB (medium gray, 1px)

**Border Radius**:
- Small elements (buttons, inputs): 8px
- Medium elements (cards, modals): 12px
- Large elements (hero sections): 16px or inherit

---

## MICRO-INTERACTIONS & ANIMATION

### Principles
1. **Functional Animations**: Indicate state changes, provide feedback
2. **Delightful Micro-Interactions**: Small surprises that feel good
3. **Performance First**: Framer Motion optimized, GPU-accelerated
4. **Accessibility**: Respect `prefers-reduced-motion`

### Key Interactions

**Page Transitions**:
- Fade in + subtle slide up (300ms, ease-out)
- Stagger child elements (50ms delay per item)

**Card Hover Effects**:
- Transform: translateY(-4px)
- Shadow: Elevated to Depth 2
- Duration: 200ms ease-out
- Background: Slight lighten (1-2% opacity increase)

**Button Interactions**:
- Hover: Scale 1.02, shadow increase
- Click: Scale 0.98 (press effect) then return
- Disable: Opacity 0.5, cursor not-allowed

**Like/Favorite Toggle**:
- Unfilled → Filled: Heart shape animates with scale-up + color change
- Duration: 300ms with spring physics for playful bounce

**Filter Application**:
- Results grid: Fade in + slide up (staggered)
- Applied filters: Bounce in (subtle spring animation)

**Search Results**:
- Skeleton cards pulse gently during loading
- Results fade in when ready (no jarring flash)

**Modals/Overlays**:
- Background: Fade in (200ms)
- Modal: Fade in + scale 0.95 → 1.0 (300ms)
- Dismiss: Reverse animation

**Success/Error States**:
- Success: Green flash + checkmark animation
- Error: Red shake animation, border highlight
- Info: Blue slide-in from top

**Scroll Animations**:
- Section headers: Reveal on scroll (fade + slide)
- Pharmacy cards: Staggered entrance on page load
- Lazy images: Fade in as load completes

---

## RESPONSIVE DESIGN BREAKPOINTS

| Device | Width | Grid Cols | Layout |
|--------|-------|-----------|--------|
| Mobile | 320px - 640px | 1 | Stack vertical, full-width |
| Tablet | 641px - 1024px | 2 | 2-column grid, sidebar top |
| Desktop | 1025px+ | 3-4 | Multi-column, sidebar left |

**Mobile-Specific**:
- Bottom navigation bar for key actions (Home, Search, Favorites, Account)
- Floating action buttons for primary CTAs
- Drawer sidebar (slide from left)
- Touch-friendly buttons: Min 44x44px

**Tablet-Specific**:
- 2-column layout for catalog
- Sidebar can be collapsible
- Mixed navigation (top + sidebar)

**Desktop-Specific**:
- 3-4 column grids
- Fixed sidebars
- Top navigation + breadcrumbs
- Wider content areas

---

## ACCESSIBILITY REQUIREMENTS

1. **Color Contrast**: 4.5:1 for text on backgrounds (WCAG AA minimum)
2. **Focus States**: Clear, visible focus indicators on all interactive elements
3. **Semantic HTML**: Proper heading hierarchy, nav, article tags
4. **Alt Text**: Descriptive alt text for all images
5. **ARIA Labels**: For icons, buttons, form fields
6. **Keyboard Navigation**: Full keyboard support, logical tab order
7. **Motion**: Respect `prefers-reduced-motion`, disable animations if requested
8. **Screen Reader**: Tested with NVDA/VoiceOver
9. **Mobile**: Touch targets 44x44px minimum

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
- [ ] Finalize color palette + CSS variables
- [ ] Create Figma design system (colors, typography, components)
- [ ] Build component library (buttons, cards, inputs, badges)
- [ ] Update Material-UI theme to new palette

### Phase 2: Core Pages (Weeks 3-4)
- [ ] Redesign Home page (hero, featured section, trust signals)
- [ ] Redesign Pharmacy Catalog (sidebar filters, cards)
- [ ] Redesign Pharmacy Detail (hero, information architecture)
- [ ] Refactor layout components (LayoutHome, LayoutBasic, LayoutAdmin)

### Phase 3: Secondary Pages & Community (Weeks 5-6)
- [ ] Redesign Community page + detail
- [ ] Redesign Member profile pages
- [ ] Redesign My Page (dashboard)
- [ ] Minor pages: About, CS, Account

### Phase 4: Admin & Polish (Weeks 7-8)
- [ ] Redesign Admin dashboard + modules
- [ ] Add micro-interactions across site
- [ ] Mobile-first refinement
- [ ] Accessibility audit + fixes

### Phase 5: Animations & Optimization (Weeks 9-10)
- [ ] Integrate Framer Motion animations
- [ ] Page transition effects
- [ ] Lazy loading + skeleton states
- [ ] Performance optimization (Lighthouse 90+)

---

## CODEX IMPLEMENTATION STRATEGY

### Using Codex for Build-Out:
1. **Component-First**: Build reusable design system components
   - Button variants (primary, secondary, icon, states)
   - Card types (pharmacy, community, admin)
   - Form components (inputs, selects, toggles)
   - Navigation components (navbar, sidebar)

2. **Page-by-Page**: Implement pages using component library
   - Start with Home for brand definition
   - Catalog page for discovery patterns
   - Detail pages for information architecture
   - Admin pages for system completeness

3. **Incremental Styling**: 
   - Update SCSS architecture (variables, mixins, utilities)
   - Material-UI theme customization
   - CSS modules for component scoping

4. **Animation Integration**:
   - Add Framer Motion hooks
   - Page transition wrapper
   - Component-level micro-interactions

5. **Responsive Refinement**:
   - Mobile-first CSS
   - Tablet breakpoints
   - Touch-friendly interactions

---

## SUCCESS METRICS

When design is complete, Codex should achieve:
- ✅ Unique visual identity (not Material-UI stock look)
- ✅ Healthcare/pharmacy personality (warm + professional)
- ✅ 90+ Lighthouse scores (performance, accessibility, best practices)
- ✅ Mobile responsiveness (all devices tested)
- ✅ Accessibility compliance (WCAG AA+)
- ✅ Animation polish (Framer Motion micro-interactions)
- ✅ Consistent component library (reusable across 20+ pages)
- ✅ TypeScript-first (proper types for all components)

---

## REFERENCE INSPIRATIONS

**Comparable Healthcare Platforms**:
- Goodrx: Clean pharmacy search, trust-focused
- Pharmacymart: E-pharmacy with filtering
- Amazon Pharmacy: Seamless discovery + delivery
- Teladoc: Professional healthcare + empathy

**Design Patterns to Borrow**:
- Card-based discovery (Netflix, Airbnb)
- Advanced filtering (Booking.com, Zillow)
- Trust badges (Trustpilot, ProductHunt)
- Micro-interactions (Stripe, Figma)
- Geographic emphasis (Google Maps, Uber)

---

## FINAL NOTES FOR CODEX

This prompt encompasses:
✅ Complete site structure (10 main pages, 12 admin modules)
✅ Navigation architecture & menu locations
✅ Design system specs (colors, typography, spacing, components)
✅ Micro-interactions & animation guidelines
✅ Responsive design breakpoints
✅ Accessibility requirements
✅ Implementation roadmap

**Your goal**: Create a unique, trustworthy, human-centered pharmacy marketplace design that differentiates from the generic origins and establishes QuickMeds as the premium healthcare platform choice.

**Key to Success**: 
1. Medical credibility + Warm empathy = Trust
2. Effortless navigation + Smart filtering = Conversion
3. Delightful details + Smooth animations = Premium feel
4. Location intelligence + Health-focused data = Differentiation

---

**Questions for Clarification Before Starting**:
1. Should admin pages use dark mode or light mode?
2. Preference for illustration style (realistic photography, modern flat, line art)?
3. Should we add a healthcare blog/magazine section?
4. Preferred approach to customer reviews: detailed or quick stars?
5. Should pharmacy operating hours be editable by owners, or admin-only?

