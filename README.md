# TenaCare - Digital Medical Prescription & Fulfillment Portal

<div align="center">
  <img src="photo_2026-05-23_12-34-55.jpg" alt="TENA CARE LOGO" width="200">
</div>
<b>Supporting Mental Well-Being in Healthcare</b>
As people reach older age health related problems become a major challenge and our app is gonna help them manage their prescriptions.

TenaCare is a web platform that eliminates the dangers of unreadable medical handwriting, lost/mishandeled prescriptions, and the exhausting struggle of "medication hunting" across cities. By digitizing the end-to-end pharmaceutical lifecycle, FlipCare bridges the gap between clinical prescription issuance and home-delivery fulfillment.

## Programming Features Used 

* Frontend: TypeScript
* Backend: Nodejs
* Database: FireBase

---

## 🚀 Key Advantages & Core Features

<div align="center">
  <img src="photo_2026-05-23_11-55-03.jpg" alt="FAYDA ID Verification" width="300">
</div>

* National Fayda ID Sync: Patients use their unique Fayda ID card numbers to instantly pull, verify, and fill their active electronic prescriptions at any participating hospital node or pharmacy hub in Ethiopia.
* Cognitive & Behavioral Health Safeguards: Built directly for vulnerable or disabled users (such as individuals managing Alzheimer's, Dementia, or advanced cognitive issues) who cannot interact with technology effectively. The portal allows credentialed doctors to act on their behalf, securely routing orders straight to fulfillment channels.
* Smart Caregiver Alarm & Reminder System: When a critical behavioral or maintenance medication is ready for pickup or due for home delivery, the system triggers real-time data syncs and automated, high-visibility visual alert indicators to keep primary family caregivers synchronized.
* Instant Real-Time Sync Loop: When a doctor clicks the "Send Prescription" button, the order bypasses slow traditional channels, broadcasting to the dispensary dashboard pipeline in under a second without a page refresh.

---

## 📱 The 4-Interface System Architecture

FlipCare separates its professional boundaries into four dedicated, secure dashboard routes, all communicating dynamically via a shared browser data memory engine:

1. The Doctor Portal : A streamlined clinical dashboard featuring an intake matrix and a Clinical Drug Catalog. Doctors can securely input patient data, match it with a Fayda ID, and issue prescriptions for disabled users who cannot handle technology.
2. The Pharmacist Terminal : A high-velocity dispensary queue interface where pharmacists track incoming Prescriptions, check real-time stock parameters, and actively provide the confirmed prescribed medicine to users : Pending Verification ➔ Preparing ➔ Confirmed/Delivered.
3. The Central Administrative Panel : An independent system audit core reserved for government official and medical network supervisors to track the proper usage of the Fayda Id Verification, calculate average preparation velocity, review regional demand, and handle data compliance.
4. The Patient Prescription Tracking Portal: A customer-facing module designed for tracking active prescribed medication, checking baseline pricing catalogs, and tracking the scheduling arrangements for their medicines as well as alarm systems that notify them to take their medicines on time.

---

## 💻 How the Code Works

* The Array Contract Layer (`types.ts`): Written strictly in TypeScript to define structural object layouts for Patient Demographics, Specialty Category tracking, and Prescription Workflow States to eliminate application runtime bugs.
* LocalStorage System Memory (`app.ts`): Emulates a persistent, stateful backend database entirely client-side. This ensures absolute offline presentation resilience during live judging with zero risk of server timeouts or data loss on a page refresh.
* Dynamic DOM UI Painting (`app.js`): The script dynamically samples the local browser storage memory volumes and automatically handles real-time element injection, painting clear data rows and warning indicators directly onto the active screen view.