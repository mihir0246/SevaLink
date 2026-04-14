Design a modern, clean, and production-ready web application UI for a platform called "SevaLink" — a multilingual social impact platform that collects community survey data and connects NGOs with volunteers.

Style:

* Minimal, modern UI (inspired by Notion / Stripe / Linear)
* Soft shadows, rounded corners (12–16px)
* Clean grid layout with proper spacing
* Icons: Heroicons / Lucide
* Smooth micro-interactions and hover states

Color Palette:

* Primary: Deep Blue (#1E3A8A)
* Secondary: Teal (#14B8A6)
* Accent: Orange (#F97316)
* Background: Light Gray (#F9FAFB)

Typography:

* Headings: Bold, large (Inter / Poppins)
* Body: Clean and readable

---

## 🌐 1. LANDING PAGE (NEW - IMPORTANT)

Design a clean, impactful landing page:

Sections:

* Hero Section:

  * Headline: "Connecting Community Needs with the Right Help"
  * Subtext: Explain NGO + volunteer connection
  * CTA buttons: "Get Started" / "Join as Volunteer"
  * Illustration of social work/community

* Features Section:

  * Data Collection
  * Smart Insights
  * Volunteer Coordination
  * Real-time Dashboard

* How It Works:

  * Step 1: Collect Data
  * Step 2: Analyze Needs
  * Step 3: Volunteers Take Action

* Impact Section:

  * Stats (People helped, tasks completed, etc.)

* Footer:

  * Links, contact, social

---

## 🔐 2. ROLE-BASED SIGNUP (VERY IMPORTANT CHANGE)

Design a multi-step signup flow:

Step 1: Role Selection Screen

* Two large cards:

  * "Join as NGO / Admin"
  * "Join as Volunteer"

Step 2A: Admin Signup Form

* NGO Name
* Organization Type
* Location
* Email & Password
* Contact Number

Step 2B: Volunteer Signup Form

* Name
* Skills (multi-select)
* Location
* Availability
* Language preference
* Email & Password

Include:

* Google Sign-in option
* Clean form validation UI

---

## 📋 3. SURVEY DATA COLLECTION (🔥 MAIN FEATURE - BASED ON ATTACHED IMAGE)

Design a **form + OCR + review interface inspired by paper survey sheets**:

Screen 1: Upload Survey

* Upload image / PDF
* Drag & drop UI
* Show preview of uploaded file

Screen 2: OCR Extraction View

* Split screen layout:
  LEFT: Uploaded survey image (like scanned sheet)
  RIGHT: Auto-filled form fields

Fields:

* Name / Household ID
* Location (City, Area, Coordinates)
* Needs type (Food, Medical, Shelter)
* Quantity / urgency
* Notes

Screen 3: Manual Correction UI

* Editable fields with highlight where OCR confidence is low
* "Confirm & Save" button

Also include:

* CSV/Excel upload option (table preview before upload)

---

## 🏢 4. ADMIN DASHBOARD (UPDATED LOGIC)

IMPORTANT:
Admin DOES NOT assign volunteers.

Admin can:

* View all needs (from survey data)
* View volunteers
* Monitor activity

Dashboard layout:

Top:

* Stats Cards:

  * Total Needs
  * Active Volunteers
  * Tasks in Progress
  * Urgent Cases

Main Sections:

* Needs Overview (table + filters)
* Charts:

  * Bar: Needs by area
  * Pie: Needs by category

Volunteer Monitoring:

* List of volunteers
* Each shows:

  * Name
  * Skills
  * Tasks currently working on
  * Status

Activity Feed:

* "Volunteer X started task Y"
* "Task completed in Area Z"

Map View:

* Needs pins (admin view only)
* NO assignment button

---

## 🙋‍♂️ 5. VOLUNTEER DASHBOARD (SEPARATE UI)

Volunteer-centric design:

Top:

* Welcome + impact stats

  * Tasks completed
  * People helped

Main Sections:

* Available Tasks List:

  * Task cards with:

    * Title
    * Location
    * Urgency badge
    * Required skills
  * CTA: "Accept Task"

* My Tasks:

  * Accepted tasks
  * Status: Pending / In Progress / Completed

* Map View:

  * Nearby needs based on location

* Profile Section:

  * Skills
  * Availability
  * Language

---

## 🔄 6. TASK FLOW (UPDATED LOGIC)

* System shows tasks → volunteers ACCEPT
* Admin only monitors

UI:

* Task card → Accept button
* After accept:

  * Moves to "My Tasks"
  * Status tracking

---

## 🌍 7. MULTILINGUAL SUPPORT (IMPORTANT)

Include language switcher in navbar:

* English / Hindi / Marathi

Design:

* Toggle or dropdown
* UI adapts to selected language
* Consider longer text spacing for translations

---

## 🧭 8. NAVIGATION STRUCTURE

Top Navbar:

* Logo (SevaLink)
* Language switcher
* Profile menu

Sidebar (role-based):

Admin:

* Dashboard
* Surveys
* Needs
* Volunteers
* Map
* Reports

Volunteer:

* Dashboard
* Available Tasks
* My Tasks
* Map
* Profile

---

## 📱 9. MOBILE RESPONSIVE DESIGN

* Bottom navigation for mobile
* Simplified task cards
* Map view optimized for small screens

---

## ✨ INTERACTIONS

* Hover effects on cards
* Smooth transitions
* Loading skeletons
* Toast notifications:

  * "Task accepted"
  * "Survey uploaded"

---

## 🎯 GOAL

Design a complete, real-world SaaS platform that:

* Clearly shows role-based experience (Admin vs Volunteer)
* Highlights survey data collection as the core feature
* Feels production-ready and suitable for hackathons, demos, and real deployment
