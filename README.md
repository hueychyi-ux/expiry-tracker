# Expiry Tracker

A mobile-first PWA to track product expiry dates and reduce waste.

## Features

### Phase 1 (MVP) - Implemented ✅

- **Smart Product Entry**
  - Manual product entry with all key fields
  - Photo upload/capture support
  - Custom categories and subcategories
  - Smart expiry date auto-fill based on product type
  - Persistent dismissible helper text explaining suggestions

- **Product Management**
  - View all active products sorted by expiry urgency
  - Color-coded urgency indicators (red/orange/yellow/green)
  - Filter: "Expiring Soon" view
  - Product detail view with edit capability
  - Mark products as "Finished" or "Wasted"
  - Archive for completed products

- **Built-in Shelf Life Rules**
  - Skincare products (6-12 months based on type)
  - Makeup products (3-24 months based on type)
  - Supplements (12-24 months based on type)
  - Intelligent calculation from purchase or opened date

- **Data Storage**
  - LocalStorage-based (works offline)
  - No backend required for MVP
  - Easy to upgrade to Firebase/Supabase later

## Tech Stack

- **Frontend:** React 18
- **Build Tool:** Vite
- **Storage:** LocalStorage (MVP), Firebase/Supabase ready
- **Styling:** Custom CSS (Notion-inspired)
- **PWA:** Manifest ready for "Add to Home Screen"

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

Follow the prompts. Your app will be live in minutes!

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/expiry-tracker"
}
```

3. Deploy:
```bash
npm run deploy
```

## Using as a PWA

### On Mobile (iOS/Android)

1. Open the app in your mobile browser
2. Tap the Share button (iOS) or Menu (Android)
3. Select "Add to Home Screen"
4. The app will appear like a native app!

### On Desktop

1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install as a desktop app

## Future Enhancements (Phase 2+)

- [ ] Firebase/Supabase backend for multi-device sync
- [ ] Push notifications (using Firebase Cloud Messaging)
- [ ] Usage analytics dashboard
- [ ] Custom shelf life rules (user-editable)
- [ ] AI photo capture → auto-fill
- [ ] Barcode scanning
- [ ] Product sharing with family
- [ ] Recurring products

## Data Structure

### Product Schema
```javascript
{
  id: "unique-id",
  name: "Product name",
  category: "Category",
  subcategory: "Subcategory",
  purchaseDate: "YYYY-MM-DD",
  openedDate: "YYYY-MM-DD",
  expiryDate: "YYYY-MM-DD",
  notes: "Notes",
  photo: "base64-image-data",
  status: "active" | "finished" | "wasted",
  remindersEnabled: true/false,
  createdAt: "ISO-timestamp",
  finishedAt: "ISO-timestamp" | null,
  expiryWasAutoFilled: true/false
}
```

## Project Structure

```
expiry-tracker/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── AddProductModal.jsx
│   │   ├── ProductDetailModal.jsx
│   │   └── ProductList.jsx
│   ├── data/
│   │   └── shelfLifeRules.js  # Shelf life configurations
│   ├── utils/
│   │   ├── storage.js         # LocalStorage utilities
│   │   └── dateUtils.js       # Date calculations
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Design Principles

- **Notion-inspired:** Clean, minimal, functional
- **Mobile-first:** Optimized for thumb-friendly interactions
- **Accessible:** High contrast, readable text, screen reader support
- **Fast:** Instant load times, smooth interactions

## Budget

**Current: $0/month**
- Hosting: Free (Vercel/Netlify)
- Storage: LocalStorage (free, browser-based)

**Future (with backend):**
- Firebase free tier: Sufficient for personal use
- Optional custom domain: ~$12/year

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT

---

Built with ❤️ to reduce waste and save money
