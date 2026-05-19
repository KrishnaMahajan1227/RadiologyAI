# RadAI Copilot - Testing Checklist for Doctors

Complete this checklist to thoroughly test the platform before full deployment.

---

## Landing Page & Authentication

- [ ] Landing page loads with smooth animations
- [ ] "Get Started" button navigates to auth page
- [ ] Navigation bar appears and is sticky
- [ ] All feature cards have hover effects
- [ ] Footer is visible and clickable links work
- [ ] Mobile responsive (test on mobile browser)
- [ ] Dark mode appearance is professional
- [ ] Stats section displays correctly (92%, 10000+, 99.9%)

**Authentication**
- [ ] Register with email and password
- [ ] Login with existing credentials
- [ ] Logout works properly
- [ ] Session persists on page reload
- [ ] Redirects to dashboard after login

---

## Report Generation Workflow

### 1. Template Selection
- [ ] Scan type dropdown shows all options
- [ ] Template dropdown filters by scan type
- [ ] Selecting template shows blue info bar
- [ ] Template sections preview displays
- [ ] Placeholder text shows in section previews
- [ ] Removing template works ("Remove" link)

### 2. Voice Dictation
- [ ] Mic button is visible and clickable
- [ ] Clicking mic starts listening (turns red)
- [ ] Real-time text appears in textarea as you speak
- [ ] "Hearing: [words]" indicator shows live feedback
- [ ] Stop button appears when listening
- [ ] Stop button stops recording properly
- [ ] Reset button clears transcript
- [ ] Text combines with template sections for final report

### 3. Manual Typing
- [ ] Can type directly into textarea
- [ ] Text appears while typing
- [ ] Typing count updates (9 words, 45 words, etc.)
- [ ] Macros work (type `/` to see dropdown)
- [ ] Can apply macro and continue typing

### 4. Report Generation
- [ ] "Fill Template & Generate" button is enabled with text
- [ ] Button shows loading spinner while generating
- [ ] Generation takes 3-5 seconds
- [ ] Report sections appear filled with content
- [ ] Technique section has appropriate content
- [ ] Findings section has detailed information
- [ ] Impression section has numbered points
- [ ] Template extra sections are filled (e.g., Clinical Indication)

### 5. Report Editing
- [ ] Can edit Technique section
- [ ] Can edit Findings section
- [ ] Can edit Impression section
- [ ] Can edit template extra sections
- [ ] Changes persist (not lost on focus change)

### 6. Report Export
- [ ] "Copy" button copies full report to clipboard
- [ ] "Copied!" confirmation appears for 2 seconds
- [ ] "PDF" button generates PDF download
- [ ] PDF includes patient info, all sections, date/time
- [ ] PDF has professional formatting
- [ ] "Save" button saves report to database
- [ ] "Saved!" confirmation appears

### 7. Report Management
- [ ] "Saved (X)" button shows count
- [ ] Clicking shows drawer with list of saved reports
- [ ] Each report shows title, patient name, date, word count
- [ ] "View" button opens full report in modal
- [ ] "Edit" button loads report back into editor
- [ ] Report modal has scrollable content
- [ ] Report modal can be closed

---

## Quick Report by Disease

- [ ] "Quick Report by Disease" button is visible
- [ ] Clicking shows disease picker with search
- [ ] Can type disease name (e.g., "Kidney Stone")
- [ ] Suggestions appear as you type
- [ ] Can select suggestion from list
- [ ] Custom disease name works if not in list
- [ ] Auto-selects matching template (if available)
- [ ] Generates complete report for disease
- [ ] Report sections filled appropriately for condition

---

## Case Management

- [ ] Can navigate to Cases page
- [ ] Add new case with patient info
- [ ] Patient name, age, gender, CR number, scan type all save
- [ ] Can search/filter cases
- [ ] Selecting case shows details
- [ ] Can view case detail modal
- [ ] Case can be linked to report

---

## Templates & Macros

- [ ] Templates page shows all templates
- [ ] Can see template structure (sections listed)
- [ ] Macros page shows all macros
- [ ] Macro trigger and expansion visible
- [ ] Can create new macros
- [ ] Macros work in report editor (type `/trigger`)

---

## Settings & Profile

- [ ] Settings page accessible
- [ ] Doctor profile shows name and specialty
- [ ] Dark/Light mode toggle works
- [ ] Logout button works
- [ ] Profile updates save properly

---

## Dashboard

- [ ] Dashboard shows stats
- [ ] Reports generated counter shows
- [ ] Time saved counter shows
- [ ] Recent reports listed
- [ ] Quick action buttons visible

---

## Error Handling

- [ ] Try generating without text → shows error
- [ ] Try invalid template → handled gracefully
- [ ] Slow network → loading spinners appear
- [ ] Network error → clear error message shown
- [ ] All error messages are understandable

---

## Performance & Responsiveness

- [ ] Page loads quickly (< 3 seconds)
- [ ] Buttons respond instantly to clicks
- [ ] Text input is smooth and responsive
- [ ] Voice dictation doesn't lag
- [ ] Report generation shows progress
- [ ] PDF download completes quickly
- [ ] Mobile layout is responsive
- [ ] No console errors (open DevTools to check)

---

## Accessibility & Usability

- [ ] Text is readable on all backgrounds
- [ ] Buttons are easily clickable (size and contrast)
- [ ] Hover states are visible
- [ ] Focus states are clear
- [ ] Error messages are visible and understandable
- [ ] Loading states are clear
- [ ] Instructions are helpful

---

## Data & Security

- [ ] Login requires valid credentials
- [ ] Cannot access other users' reports
- [ ] Report data is encrypted in transit (HTTPS)
- [ ] Session timeout works
- [ ] Can delete own reports (if enabled)

---

## Cross-Browser Testing

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge
- [ ] Mobile Safari (if on iPhone)
- [ ] Chrome Mobile (if on Android)

---

## Clinical Workflow Testing

Real-world scenario testing:

**Scenario 1: Abdominal Ultrasound - Normal Study**
- [ ] Select "Ultrasound Abdomen" template
- [ ] Dictate: "Liver normal size no focal lesions. Gallbladder without stones. No free fluid. Pancreas unremarkable. Both kidneys unremarkable."
- [ ] Generate and verify sections make sense
- [ ] Download PDF and review formatting

**Scenario 2: Chest CT - Abnormal Finding**
- [ ] Select "CT Chest" template
- [ ] Dictate: "Bilateral ground glass opacities in lower lobes with consolidation right lung base. Small bilateral pleural effusions. No significant lymphadenopathy."
- [ ] Generate and check impression highlights findings
- [ ] Verify differential diagnoses appear
- [ ] Save report with proper title

**Scenario 3: MRI Brain - Quick Report by Disease**
- [ ] Click "Quick Report by Disease"
- [ ] Search for "Stroke"
- [ ] Auto-generates report structure
- [ ] Review appropriateness of sections
- [ ] Edit and customize as needed

---

## Final Sign-Off

Once testing is complete, please confirm:

- [ ] **All critical features work** (generation, save, export)
- [ ] **No major bugs encountered**
- [ ] **User experience is smooth**
- [ ] **Medical accuracy is acceptable**
- [ ] **Ready for doctor deployment**

---

## Issues Found

Please list any issues discovered:

1. **Issue**: [Describe problem]  
   **Steps to Reproduce**: [How to replicate]  
   **Expected**: [What should happen]  
   **Actual**: [What happens instead]  
   **Severity**: [Critical/High/Medium/Low]  

2. [Continue for each issue...]

---

**Thank you for testing RadAI Copilot! Your feedback makes us better.**

