# Rafeeq Care MVP - System Architecture & Thought Behind Project

---

## 💭 The Thought Behind Rafeeq Care

Family caregiving is often managed under high stress, tight budgets, and fragmented communication between family members. Most existing eldercare software is either:
1. **Overly Complex Medical Systems**: Requiring clinical EHR records, compliance overhead, and paid SaaS subscriptions.
2. **Generic Chat Groups**: Leaving expense receipts, attendant contacts, and shift coverage scattered across messaging threads.

### Core Design Philosophy
- **Pragmatic & Accessible**: Built specifically for families with large tap targets, warm high-contrast colors (`canvas`, `companion`, `warmth`), and mobile-first responsive design.
- **Zero Medical Data Liability**: Intentionally excludes diagnoses, symptoms, and medical records to remain simple, safe, and privacy-first.
- **Zero Hosting Costs**: A 100% static single-page application hosted free on GitHub Pages, backed by Supabase Free Tier (Auth, Postgres RLS, and Edge Functions).
- **Graceful Zero-Config Fallbacks**: If Supabase is offline or uninitialized, local in-memory fallback signals ensure the app continues working smoothly.

---

## 🏗️ System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer (Browser & Mobile PWA)"]
        UI["Angular 18+ Standalone Components"]
        Signals["Angular Signals State Management"]
        SW["Static Service Worker (public/sw.js)"]
        Router["Hash Router (withHashLocation)"]
    end

    subgraph Hosting ["Static Hosting"]
        GHPages["GitHub Pages (gh-pages)"]
    end

    subgraph Backend ["Supabase Cloud Backend"]
        Auth["Supabase Auth (Magic Link OTP)"]
        DB[("PostgreSQL Database + RLS")]
        EdgeFunc["Edge Function (send-reminder)"]
    end

    subgraph Push ["Push Delivery"]
        FCM["FCM / Browser Push Service"]
    end

    GHPages --> UI
    UI --> Signals
    Signals --> Router
    UI --> SW
    UI -->|@supabase/supabase-js| Auth
    UI -->|@supabase/supabase-js| DB
    UI -->|HTTP POST| EdgeFunc
    EdgeFunc -->|web-push| FCM
    FCM -->|Push Event| SW
```

---

## 🔄 User & Data Flow Diagrams

### 1. Family Caregiver Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caregiver as Family Member
    participant App as Rafeeq Care Web App
    participant Supabase as Supabase Auth
    participant Email as Email Inbox

    Caregiver->>App: Enter Email Address & Click "Sign In"
    App->>Supabase: client.auth.signInWithOtp({ email, emailRedirectTo })
    Supabase-->>Email: Send Magic Link OTP
    Caregiver->>Email: Click Magic Link
    Email->>App: Redirect with Access Token Hash
    App->>Supabase: Establish Auth Session & Update Signal
    Supabase-->>App: Return User Profile
    App-->>Caregiver: Display Authenticated State & Add/Edit Actions
```

---

### 2. Shared Expense & Net Balance Calculation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caregiver as Family Member
    participant Service as ExpenseService (Angular Signal)
    participant DB as Supabase PostgreSQL (expenses)

    Caregiver->>Service: Log Expense (Amount, Paid By, Split Between)
    Service->>DB: INSERT into expenses table
    DB-->>Service: Return Saved Expense Record
    Service->>Service: Recompute netBalances Signal (Arithmetic Split)
    Service-->>Caregiver: Update "Who Owes Whom" Summary Cards
```

---

### 3. Respite Care Coverage & Claim Flow

```mermaid
sequenceDiagram
    autonumber
    actor CaregiverA as Requesting Caregiver
    actor CaregiverB as Claiming Caregiver
    participant Service as RespiteService (Angular Signal)
    participant DB as Supabase PostgreSQL (respite_requests)

    CaregiverA->>Service: Post Coverage Request (Date, Time Range, Note)
    Service->>DB: INSERT into respite_requests (status='open')
    DB-->>Service: Return Open Request Record
    Service-->>CaregiverB: Display Request in Open Requests List
    CaregiverB->>Service: Click "Claim This Shift"
    Service->>DB: UPDATE status='claimed', claimed_by=CaregiverB
    DB-->>Service: Confirm Update
    Service-->>CaregiverA: Shift moves to Claimed List with Claimant Name
```

---

### 4. Web Push Notification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caregiver as Family Member
    participant App as Settings UI
    participant SW as Service Worker (sw.js)
    participant DB as Supabase (push_subscriptions)
    participant Edge as Edge Function (send-reminder)

    Caregiver->>App: Click "Enable Reminders"
    App->>SW: Register sw.js & Request Push Permission
    SW-->>App: Return PushSubscription (Endpoint & Keys)
    App->>DB: INSERT push_subscriptions record
    
    note over App,Edge: Triggering Reminders (Daily Cron or Manual Broadcast)
    Caregiver->>App: Click "Broadcast Reminder to Family"
    App->>Edge: HTTP POST /functions/v1/send-reminder
    Edge->>DB: SELECT * FROM push_subscriptions
    DB-->>Edge: Return Active Subscriptions
    Edge->>SW: Dispatch Web Push Payload (web-push)
    SW-->>Caregiver: Display System Notification Banner
```

---

## 🖼️ Application Screenshots Gallery

All feature screenshots are captured and saved in [docs/screenshots/](file:///Users/parvezkhan/Projects/AntigravityProjects/Rafeeq%20Elder%20Care/docs/screenshots/).

### 1. Shared Wisdom Carousel (`/#/wisdom`)
*Home page greeting caregivers with timeless quotes across 5 traditions.*
![Shared Wisdom Carousel](screenshots/wisdom_carousel.png)

---

### 2. Attendant Directory (`/#/attendants`)
*Directory cards for nurses, attendants, and caregivers filterable by service type and area.*
![Attendant Directory](screenshots/attendant_directory.png)

---

### 3. Shared Expense Tracker (`/#/expenses`)
*Log family care expenses with automated net balance arithmetic computing who owes whom.*
![Shared Expense Tracker](screenshots/shared_expenses.png)

---

### 4. Respite Care Request Board (`/#/respite`)
*Coverage board displaying open shifts first and claimed shifts below.*
![Respite Board](screenshots/respite_board.png)

---

### 5. Low-Cost Diagnostic Directory (`/#/diagnostics`)
*Government, subsidized, and low-cost diagnostic center listings filterable by category.*
![Diagnostic Directory](screenshots/diagnostic_directory.png)

---

### 6. Helpline Directory (`/#/helplines`)
*Emergency contacts and eldercare hotlines filterable by scope (`national` | `international` | `local`).*
![Helpline Directory](screenshots/helpline_directory.png)

---

### 7. Private Gratitude Reflection (`/#/gratitude`)
*Private family journal cycling 6 rotating daily prompts with date-based history.*
![Gratitude Reflection](screenshots/gratitude_journal.png)

---

### 8. Notification & Web Push Settings (`/#/settings`)
*Enable Web Push reminders, test local device notifications, or broadcast cloud reminders to family devices.*
![Notification Settings](screenshots/notification_settings.png)
