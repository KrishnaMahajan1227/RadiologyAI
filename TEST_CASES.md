# RadAI Copilot - Manual Test Cases

## Test 1: Superadmin Login & Profile Setup

**Purpose:** Verify superadmin can log in and profile loads with hospital details.

**Steps:**
1. Go to the login page
2. Enter email: `admin@radai.com`, password: `RadAI@2026`
3. Click Sign In
4. After login, navigate to Settings (gear icon in sidebar)
5. Verify the following fields are pre-filled:
   - Full Name: "Dr. Admin"
   - Hospital/Clinic Name: "RadAI General Hospital"
   - Address: "123 Medical Center Drive, Healthcare City, 110001"
   - Phone: "+91 1234 567 890"
   - Credentials/Degrees: "MD, DNB, FRCR"
   - Registration Number: "MCI-2026-00001"
   - Designation: "Head of Radiology"
   - Department: "Department of Radiology & Imaging"
6. Check the "Report Header Preview" section shows the hospital letterhead preview

**Expected:** Login succeeds without "Database error querying schema". Profile page shows all hospital/doctor fields pre-filled. Preview shows formatted hospital header.

**Fail if:** Login throws error, profile fields are empty, or preview doesn't render.

---

## Test 2: Create Case with Full Patient Details

**Purpose:** Verify new patient fields (gender, CR number, referring doctor) save correctly.

**Steps:**
1. Navigate to Cases page (sidebar)
2. Click "New Case" button
3. Fill in:
   - Patient Name: "Sharma, Rajesh"
   - Age: 55
   - Gender: Male
   - CR/IP Number: "CR-2026-00421"
   - Referring Doctor: "Dr. Priya Mehta"
   - Scan Type: "CT Chest"
   - Clinical Notes: "Cough for 3 weeks, rule out malignancy"
4. Click Create
5. Verify the new case card appears in the list
6. Click on the case to open Case Detail
7. Verify all fields are displayed correctly

**Expected:** Case is created with all fields saved. Case detail shows patient name, age, gender, CR number, referring doctor, and clinical notes.

**Fail if:** Any field is missing, empty, or shows default placeholder values after save.

---

## Test 3: Generate Report & Export PDF

**Purpose:** Verify report generation and PDF download with complete hospital format.

**Steps:**
1. Navigate to Report Workspace (sidebar)
2. Select the case created in Test 2 from the case dropdown
3. In the input area, type: "CT Chest without contrast. Clinical indication: cough for 3 weeks."
4. Click the "Generate Report" button (Wand icon)
5. Wait for the report to generate (Technique, Findings, Impression sections should fill)
6. Click the "Download PDF" button
7. A new tab/window should open with the formatted report
8. Verify the PDF preview shows:
   - Hospital header: "RADAI GENERAL HOSPITAL" with address and phone
   - Department: "Department of Radiology & Imaging"
   - Patient info table with: Name, Age/Sex (55 yrs / Male), Ref Doctor (Dr. Priya Mehta), CR Number (CR-2026-00421)
   - "RADIOLOGY REPORT" title
   - Technique, Findings, Impression sections with content
   - Doctor signature block with name, credentials, designation, registration number
   - Footer with date and hospital name
9. Click "Print / Save as PDF" button
10. In the print dialog, select "Save as PDF" as destination and save

**Expected:** PDF opens in new tab with complete hospital letterhead format. All patient details, report content, and doctor signature are present. Saving as PDF produces a proper A4-sized document.

**Fail if:** New tab doesn't open, report is blank, patient info is missing, hospital header is missing, or signature block is absent.

---

## Test 4: Create & Use Macro in Report

**Purpose:** Verify macros can be created and triggered in the report editor.

**Steps:**
1. Navigate to Macros page (sidebar)
2. Click "New Macro" button
3. Fill in:
   - Trigger: `/normal-chest`
   - Category: chest
   - Description: "Normal chest radiograph findings"
   - Expansion Text: "The lungs are clear bilaterally. No focal consolidation, pleural effusion, or pneumothorax. The heart and mediastinum are normal. The bony structures are intact."
4. Click "Save Macro"
5. Verify the macro appears in the list with trigger `/normal-chest`
6. Navigate to Report Workspace
7. In the input text area, type `/normal-chest` and press Space or continue typing
8. Verify the macro expansion appears or the text is inserted

**Expected:** Macro is saved to database and appears in the macros list. When the trigger is typed in the report editor, the expansion text is inserted.

**Fail if:** Macro doesn't save, doesn't appear in list, or trigger doesn't expand in report editor.

---

## Test 5: Create Template & Apply to Report

**Purpose:** Verify templates can be created and used to structure reports.

**Steps:**
1. Navigate to Templates page (sidebar)
2. Click "New Template" button
3. Fill in:
   - Template Name: "Standard CT Chest"
   - Scan Type: "CT Chest"
   - Description: "Standard template for CT Chest reports"
4. Verify default sections exist: Technique, Findings, Impression
5. Click "Add Section" and add a new section:
   - Label: "Comparison"
   - Placeholder: "Comparison with prior studies..."
6. Click "Save Template"
7. Verify the template appears in the templates list
8. Navigate to Report Workspace
9. Click the template selector dropdown and select "Standard CT Chest"
10. Verify the report sections update to include: Technique, Findings, Impression, and Comparison

**Expected:** Template saves with all sections. When selected in report workspace, the report structure updates to match the template sections.

**Fail if:** Template doesn't save, sections are missing, or template selection doesn't update the report structure.
