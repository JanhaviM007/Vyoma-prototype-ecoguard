# EcoGuard AI: Features & Tasks Overview

This document provides a comprehensive list of features and completed tasks for the EcoGuard AI project, organized by role.

---

## 👨‍💼 Citizen Role

### Features
- **Smart Dashboard**: Personalized view of local environmental risks (Temperature, AQI, Rain) and a risk analysis summary.
- **Smart Heatmap Visualization**: Interactive map showing environmental violations and reports. Verified reports appear more prominent, while low-confidence reports are filtered out.
- **AI-Powered Environmental Reporting**:
  - Submit reports for various issues (Flood, Pollution, Heat, etc.).
  - Automatic image analysis using Gemini AI.
  - Context-aware verification (e.g., matching weather data with report content).
- **Personalized Health Monitoring**:
  - **Health Setup Flow**: Configure health profile including age range, chronic conditions (e.g., Asthma, Sinusitis), and current symptoms.
  - **AI Health Insights**: Personalized recommendations based on environmental factors (AQI, PM2.5, UV) and health profile.
- **Real-Time Notifications**:
  - Verification alerts for submitted reports.
  - Alerts for high-risk environmental factors.
  - Notification Bell with "Mark all read" and persistent storage.

### Completed Tasks
- [x] Implementation of `CitizenDashboardPage` with live weather and AQI API integrations.
- [x] Development of `DashboardClient` with heatmap and risk factor components.
- [x] Creation of the Health Profile Setup flow (`/citizen/health/setup`).
- [x] Integration of the personalized health vulnerability logic in Prisma schema.
- [x] Development of the Report Submission form with AI image analysis logic.

---

## 🛡️ Authority/Admin Role

### Features
- **Authority Overview Dashboard**: KPI-driven dashboard showing Total Reports, Active Violations, Resolved Issues, and average environmental metrics.
- **Violation Management**: Tools to review, verify, and resolve reports submitted by citizens.
- **Live Monitoring Map**: Real-time visualization of all active incidents and environmental hazards.
- **Predictive Risk Feed**: AI-driven live prediction feed for potential environmental risks based on incoming data and historical trends.
- **Analytics Dashboard**: (In progress/Planned) Deeper insights into environmental trends and report distributions.

### Completed Tasks
- [x] Implementation of `AuthorityOverview` with dynamic Prisma stats fetching.
- [x] Development of the `KPICard` and `PredictItem` components for high-level monitoring.
- [x] Integration of the report status management system (PENDING, RESOLVED, CRITICAL).
- [x] Authority layout setup with side navigation and role-based access.

---

## ⚙️ System & Backend (Core)

### Features
- **AI Verification Engine**: Gemini-powered logic for analyzing report descriptions and images to calculate `confidenceScore` and `isVerified` status.
- **Environmental Risk Engine**: Logic to calculate local risk scores (Flood, Air Quality, Heat) by combining weather data and citizen reports.
- **Real-Time Notification System**:
  - Clerk-integrated notification model.
  - Server actions for fetching and managing notifications.
  - Real-time polling logic for the UI.
- **Automated Processing (Cron)**:
  - Background jobs for updating risk scores and health insights based on new environmental data.
- **Authentication**: Fully integrated Clerk authentication with role-based routing (Citizen vs. Authority).

### Completed Tasks
- [x] Prisma Schema design for `Profile`, `Notification`, `Report`, `RiskArea`, and `HealthInsight`.
- [x] Integration of Gemini AI for automated verification logic in `report-actions.js`.
- [x] Development of server-side cron job routes for scheduled data updates.
- [x] Implementation of `calculateRiskScore` logic in `lib/risk-engine.js`.
- [x] Real-time notification bell component with interactive dropdown.
- [x] Database seeding logic for violations and risk areas.

---

---

## � Roadmap: Remaining Tasks & Upcoming Features

### 👨‍💼 Citizen Enhancements
- [ ] **Community Discussion Hub**: Allow citizens to comment on reports and share local safety tips.
- [ ] **Offline Reporting Support**: Cache reports when offline and sync automatically when a connection is restored.
- [ ] **One-Tap SOS**: Emergency button to alert local authorities and nearby verified users during critical incidents (Flood/Fire).
- [ ] **Report History & Tracking**: Detailed view for citizens to track the resolution progress of their submitted reports.

### 🛡️ Authority & Admin Features
- [ ] **Advanced Analytics Dashboard**: High-resolution charts for monthly hazard trends, response times, and hotspot analysis.
- [ ] **Resolution Workflow UI**: Dedicated interface for authorities to update report statuses with site photos and resolution notes.
- [ ] **Manual Override for AI Scores**: Ability for admins to manually verify or flag reports if the AI confidence score is disputed.
- [ ] **Resource Allocation Engine**: Predictive tool to suggest where to deploy emergency services based on incoming report density.

### ⚙️ System & Infrastructure
- [ ] **Multi-Language Support**: Localize the platform into regional languages (e.g., Marathi, Hindi) for wider accessibility.
- [ ] **Push Notifications**: Integrate web-push or mobile push notifications for real-time critical alerts (beyond the current bell system).
- [ ] **Dynamic Thresholding**: Automatically adjust "isVerified" confidence thresholds based on the scale of a natural disaster.
- [ ] **Mobile Optimization**: Full PWA (Progressive Web App) support for better performance on low-end mobile devices.
- [ ] **Performance Audit**: Optimize heavy Prisma queries and implement Edge Caching for weather/AQI data.
