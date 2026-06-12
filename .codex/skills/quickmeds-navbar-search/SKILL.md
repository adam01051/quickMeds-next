# QuickMeds Navbar and Search Skill

Use this skill when improving the QuickMeds homepage navbar, search bar, medicine search UX, mobile navbar, search dropdown, and category navigation.

## Goal

The navbar/search should feel:
- premium
- medical
- trustworthy
- simple
- fast
- conversion-focused

The user should immediately understand:
- what QuickMeds does
- how to search medicine
- how to upload prescription
- how to access cart/account

## Navbar Layout

Desktop navbar structure:

- Left: QuickMeds logo
- Center: navigation links
- Right: search, prescription upload, cart, account/login

Recommended links:
- Medicines
- Wellness
- Prescription
- Consult Pharmacist
- Offers

Recommended actions:
- Search
- Upload Prescription
- Cart
- Login / Account

## Navbar Style

Use:

```tsx
<header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
  <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    ...
  </div>
</header>