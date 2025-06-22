# 🧾 Billr - Professional Invoice Management System

<div align="center">

![Billr Logo](https://img.shields.io/badge/Billr-Professional%20Invoicing-2E75B0?style=for-the-badge&logo=receipt&logoColor=white)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8.0-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-18.2.1-008CDD?style=flat&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Get Paid Without The Chase** ⚡

*A modern, full-stack invoicing solution built with React, Firebase, and Stripe*

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [📱 Usage](#-usage)
- [🏗 Architecture](#-architecture)
- [🌐 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 💼 Core Functionality
- **📄 Invoice Management** - Create, edit, and manage professional invoices
- **💳 Payment Processing** - Integrated Stripe payments with secure checkout
- **📧 Email System** - Automated email sending with professional templates
- **🔄 Recurring Invoices** - Set up automated recurring billing
- **👥 Customer Management** - Organize and track customer information
- **📊 Analytics Dashboard** - Revenue tracking and business insights

### 🎨 User Experience
- **📱 Responsive Design** - Perfect on desktop, tablet, and mobile
- **🌙 Modern UI** - Beautiful glassmorphism design with smooth animations
- **⚡ Real-time Updates** - Live data synchronization with Firebase
- **🔍 Smart Search** - Filter and find invoices quickly
- **📈 Visual Analytics** - Charts and graphs for business metrics

### 🔐 Security & Reliability
- **🔒 Firebase Authentication** - Secure user management with Google OAuth
- **🛡️ Firestore Security** - Row-level security with custom rules
- **💰 Stripe Integration** - PCI-compliant payment processing
- **☁️ Cloud Functions** - Server-side email processing
- **📱 PWA Ready** - Offline support and mobile app functionality

### 🎯 Business Features
- **📅 Due Date Tracking** - Automatic overdue detection and reminders
- **💌 Email Templates** - Professional, branded email communications
- **📊 Revenue Analytics** - Track earnings, trends, and conversion rates
- **📋 Line Items** - Detailed invoicing with quantities, taxes, and totals
- **🏷️ Business Branding** - Custom business information and styling

## 🛠 Tech Stack

### Frontend
```json
{
  "core": ["React 18", "TypeScript", "Vite"],
  "styling": ["Tailwind CSS", "Framer Motion", "GSAP"],
  "ui": ["Radix UI", "Lucide Icons", "React Calendar"],
  "charts": ["Recharts"],
  "utilities": ["Date-fns", "Class Variance Authority"]
}
```

### Backend & Services
```json
{
  "database": ["Firebase Firestore"],
  "auth": ["Firebase Authentication"],
  "functions": ["Firebase Cloud Functions"],
  "payments": ["Stripe"],
  "email": ["Resend", "EmailJS"],
  "hosting": ["Firebase Hosting"]
}
```

### Development
```json
{
  "bundler": "Vite",
  "language": "TypeScript",
  "linting": "ESLint",
  "package_manager": "npm",
  "css": "PostCSS + Tailwind"
}
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Firebase CLI** ([Install Guide](https://firebase.google.com/docs/cli))
- **Git** ([Download](https://git-scm.com/))

### 1-Minute Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/billr.git
cd billr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase and Stripe keys

# Start development server
npm run dev

# Open your browser
open http://localhost:3000
```

## ⚙️ Installation

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/billr.git
cd billr
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# EmailJS Configuration (Optional)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Company Information
VITE_COMPANY_NAME=Your Company Name
```

### 3. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### 4. Firebase Functions Setup
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Set Resend API key for email functions
firebase functions:config:set resend.api_key="your_resend_api_key"

# Start local emulator for development
firebase emulators:start --only functions
```

## 🔧 Configuration

### Firebase Configuration

#### Firestore Security Rules
The app uses these security rules for data protection:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /invoices/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Firestore Indexes
Required indexes are defined in `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "invoices",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

### Stripe Configuration

#### Test Mode Setup
```javascript
// Use test keys for development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

// Test card numbers
4242 4242 4242 4242  // Visa
4000 0000 0000 0002  // Declined card
```

#### Production Considerations
- Switch to live keys (`pk_live_...`)
- Set up webhooks for payment confirmation
- Implement backend payment intent creation

### Email Configuration

#### Resend Setup (Recommended)
1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Get API key and add to Firebase Functions config
4. Emails sent from: `invoices@billr.biz`

#### EmailJS Setup (Alternative)
1. Create account at [emailjs.com](https://emailjs.com)
2. Set up email service (Gmail, Outlook, etc.)
3. Create email template with variables
4. Add credentials to `.env` file

## 📱 Usage

### Creating Your First Invoice

1. **Sign Up/Login**
   - Use email/password or Google OAuth
   - Complete business profile setup

2. **Create Invoice**
   - Click "Create Invoice" button
   - Fill in customer details
   - Add line items with quantities and prices
   - Set due date and payment terms
   - Add notes or special instructions

3. **Send Invoice**
   - Click "Send Email" to deliver invoice
   - Invoice includes professional branding
   - Payment link automatically included

4. **Track Payments**
   - Monitor payment status in real-time
   - Automatic status updates when paid
   - Send payment reminders for overdue invoices

### Dashboard Features

#### 📊 Analytics Overview
- **Revenue Metrics**: Track monthly/yearly earnings
- **Invoice Status**: See pending, paid, and overdue counts
- **Growth Trends**: Visual charts showing business growth
- **Conversion Rates**: Monitor payment success rates

#### 👥 Customer Management
- **Customer Profiles**: Store contact information and history
- **Invoice History**: See all invoices per customer
- **Payment Tracking**: Monitor customer payment patterns
- **Quick Actions**: Create new invoices for existing customers

#### 🔄 Recurring Invoices
- **Template Setup**: Create recurring invoice templates
- **Automated Generation**: Automatic invoice creation
- **Flexible Scheduling**: Weekly, monthly, quarterly, yearly
- **Email Automation**: Automatic sending when generated

### Advanced Features

#### 📧 Email System
```typescript
// Send different types of emails
await sendInvoiceEmail(invoiceId, 'invoice')           // New invoice
await sendInvoiceEmail(invoiceId, 'payment_reminder')  // Overdue reminder
await sendInvoiceEmail(invoiceId, 'payment_confirmation') // Payment received
```

#### 💳 Payment Processing
```typescript
// Create payment session
const paymentData = {
  amount: invoice.amount,
  description: invoice.description,
  invoiceId: invoice.id,
  clientEmail: invoice.clientEmail
}
await stripeService.redirectToCheckout(paymentData)
```

## 🏗 Architecture

### Component Structure
```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── AuthForms.tsx    # Authentication
│   ├── CreateInvoiceModal.tsx
│   ├── CustomerManagement.tsx
│   └── PaymentPage.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
│   ├── useInvoices.ts   # Invoice management
│   ├── useCustomers.ts  # Customer data
│   └── useRecurringInvoices.ts
├── services/            # External integrations
│   ├── stripeService.ts # Payment processing
│   └── emailService.ts  # Email sending
└── firebase.ts          # Firebase configuration
```

### Data Model

#### Invoice Schema
```typescript
interface Invoice {
  id: string;
  number: string;
  description: string;
  amount: number;
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Timestamp;
  dueDate: Timestamp;
  paidAt?: Timestamp;
  userId: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}
```

#### Customer Schema
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalInvoicesSent: number;
  totalAmountPaid: number;
  userId: string;
}
```

### Firebase Functions
```
functions/
├── index.js             # Main functions file
├── package.json         # Dependencies
└── email-templates/     # Email HTML templates
    ├── invoice.html
    ├── reminder.html
    └── confirmation.html
```

## 🌐 Deployment

### Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Environment Variables for Production
```env
# Production Firebase Config
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_PROJECT_ID=prod_project_id

# Production Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production Email Domain
VITE_COMPANY_EMAIL=invoices@yourdomain.com
```

### Custom Domain Setup
1. Add custom domain in Firebase Hosting
2. Update DNS records as instructed
3. SSL certificate automatically provisioned
4. Update email sending domain in Resend

### Performance Optimization
- **Code Splitting**: Automatic with Vite
- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Components loaded on demand
- **CDN**: Firebase Hosting global CDN
- **Caching**: Service worker for offline functionality

## 🧪 Testing

### Development Testing
```bash
# Run development server
npm run dev

# Run Firebase emulators
firebase emulators:start

# Test with demo data
# Use test Stripe cards: 4242 4242 4242 4242
```

### Production Testing
```bash
# Build and preview
npm run build
npm run preview

# Test production Firebase
firebase use production
firebase emulators:start --import=./test-data
```

### Payment Testing
```javascript
// Test card numbers
const testCards = {
  visa: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
  authentication: '4000 0027 6000 3184'
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Testing**: Jest and React Testing Library

### Issues and Bugs
- 🐛 [Report bugs](../../issues/new?template=bug_report.md)
- ✨ [Request features](../../issues/new?template=feature_request.md)
- 💬 [Ask questions](../../discussions)

## 📚 Documentation

### Additional Resources
- [📧 Email Setup Guide](FIREBASE_EMAIL_SETUP.md)
- [💳 Stripe Integration Guide](STRIPE_EMAIL_SETUP.md)
- [🎨 Brand Guidelines](LOGO_SETUP.md)
- [🔧 API Documentation](docs/api.md)
- [🚀 Deployment Guide](docs/deployment.md)

### API Reference
```typescript
// Invoice Management
const { invoices, createInvoice, editInvoice, deleteInvoice } = useInvoices()

// Customer Management  
const { customers, createCustomer, updateCustomer } = useCustomers()

// Email Services
await emailService.sendInvoiceEmail(invoiceData)
await emailService.sendPaymentReminder(invoiceData)
```

## 🏆 Credits & Acknowledgments

### Open Source Libraries
- [React](https://reactjs.org/) - UI library
- [Firebase](https://firebase.google.com/) - Backend services
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://framer.com/motion/) - Animations
- [Radix UI](https://radix-ui.com/) - UI primitives

### Design Inspiration
- Modern invoice design patterns
- Glassmorphism UI trends
- Professional business applications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Billr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**Made with ❤️ by the Billr Team**

[⬆ Back to Top](#-billr---professional-invoice-management-system)

</div> 
