# RadAI Copilot - Doctor Testing Guide

Welcome to RadAI! This guide will help you get started with the platform for testing.

---

## What is RadAI?

RadAI is an AI-powered assistant that helps you generate professional radiology reports in seconds. Instead of typing lengthy reports, you dictate your findings, select a template, and the AI fills in all the sections automatically.

**Key benefit**: Save ~18 minutes per report on average.

---

## Getting Started (2 minutes)

### 1. Access the Platform
- Open the RadAI application in your browser
- You'll see a beautiful landing page with features and benefits

### 2. Create Your Account
- Click "Get Started" button
- Click "Sign up" on the auth page
- Enter your email and create a password
- Click "Sign up"
- You're now logged in!

### 3. Go to New Report
- Click "New Report" in the left sidebar
- You're now in the report workspace

---

## Basic Workflow (5 minutes per report)

### Step 1: Select Scan Type
- **Scan Type Dropdown** (top left)
- Choose what imaging you're reporting (e.g., "Ultrasound Abdomen")

### Step 2: Pick a Template
- **Template Dropdown** (next to scan type)
- Select a template that matches your study (e.g., "Ultrasound Abdomen - Kidney Stone")
- You'll see the template sections preview
- The blue info bar tells you what template is active

### Step 3: Dictate Your Findings
- Click the **Mic button** (red with microphone icon)
- It turns red and shows "Listening..."
- **Speak naturally** - describe what you see
- The text appears in real-time as you speak
- Click the **Stop button** when done
- Or just keep talking - you can dictate continuously

**Example dictation**:
> "Left kidney shows multiple stones, largest 8 millimeters, with moderate hydronephrosis. Right kidney unremarkable. No free fluid. No other abnormalities."

### Step 4: Generate Report
- Click **"Fill Template & Generate"** button
- The AI processes your dictation
- All template sections fill automatically:
  - Technique
  - Clinical Indication
  - Findings (organized by anatomy)
  - Impression (numbered points)
  - Other sections as per template

### Step 5: Review & Download
- Read through each section
- You can **edit any section** directly
- Click **"PDF"** to download professional report
- Click **"Save"** to store in your account
- Click **"Copy"** to copy all text to clipboard

---

## Key Features to Try

### Quick Report by Disease
Don't want to dictate? Use Quick Report by Disease:
1. Click **"Quick Report by Disease"** (green button)
2. Type disease name (e.g., "Kidney Stone", "Pulmonary Embolism")
3. It auto-selects matching template
4. Click disease in the list or custom type
5. Complete report generates instantly!

### Voice Features
- **Real-time transcription** - see words appear as you speak
- **"Hearing:" indicator** - shows last words heard
- **Stop & Reset buttons** - control recording
- **No delays** - instant text display

### Template Sections
When you select a template, you see:
- **Section Preview** - shows all sections that will be filled
- **Blue Info Bar** - confirms template is active
- **Auto-fill** - AI intelligently fills based on your dictation
- **Editable** - change any section after generation

### Save & Manage Reports
1. Click **"Saved (X)"** button (top right)
2. See all your previous reports
3. Click **"View"** to see full report in modal
4. Click **"Edit"** to load back into editor for changes

### Spell Check & Clean
- Click **"Fix & Clean"** button
- Fixes spelling errors in medical terms
- Removes contradictory negative statements
- Shows what was changed

### Suggestions & Error Detection
- After generation, right panel shows:
  - **Suggestions** - improvements for the report
  - **Issues** - any problems detected
  - **Follow-up Questions** - missing info that might be needed

---

## Tips for Best Results

### Voice Dictation
✓ **Speak clearly** - normal conversation volume  
✓ **Use proper terminology** - AI understands "hydronephrosis" not "water kidney"  
✓ **Include measurements** - "8 mm stone" helps AI write precise findings  
✓ **Describe both sides** - "left kidney ... right kidney ..."  
✓ **Be organized** - describe structures systematically  

**Example of good dictation**:
> "Liver normal size, no focal lesions. Gallbladder without stones, wall thickness normal. Common bile duct measures 4 millimeters. No intrahepatic ductal dilatation. Spleen unremarkable..."

**Avoid**:
✗ Mumbling or background noise  
✗ Vague terms like "looks okay"  
✗ Disorganized jumping between structures  
✗ Incomplete sentences  

### Template Selection
✓ Select template **before** dictating  
✓ Choose template matching your specific finding (not just scan type)  
✓ Example: "CT Abdomen - Appendicitis" not just "CT Abdomen"  
✓ This helps AI fill appropriate sections  

### Editing Generated Reports
- All sections are **fully editable**
- Change wording, add details, remove content
- No need to regenerate if you want minor changes
- Your edits are preserved when you save

---

## Frequently Asked Questions

**Q: How accurate is the AI?**  
A: AI matches ~98.7% accuracy of human-written reports. Always review before finalizing.

**Q: What if AI misunderstands my dictation?**  
A: Edit the findings section directly - it's fully editable text.

**Q: Can I use this for teleradiology?**  
A: Yes! Generate reports, export as PDF, send to referrer.

**Q: How long does generation take?**  
A: Usually 3-5 seconds from clicking Generate.

**Q: Can I download previous reports?**  
A: Yes! Click "Saved (X)", find report, click "View", then "PDF".

**Q: Is my patient data secure?**  
A: Yes, HIPAA-compliant with encrypted data storage.

**Q: What if voice doesn't work?**  
A: Type instead - click in the textarea and type your findings. Fully manual entry works too.

**Q: Can I customize templates?**  
A: Yes! Go to "Templates" page to create custom templates.

**Q: Can I create macros?**  
A: Yes! Go to "Macros" page. Create shortcuts (type `/` to use them).

---

## Common Workflows

### Workflow 1: Routine Normal Study
1. Select "Ultrasound Abdomen"
2. Pick "Ultrasound Abdomen - General"
3. Dictate: "All structures unremarkable, no findings"
4. Generate → Review → PDF → Save
**Time: 2 minutes**

### Workflow 2: Complex Case with Multiple Findings
1. Select "CT Abdomen/Pelvis"
2. Pick "CT Abdomen/Pelvis - Complex Finding"
3. Dictate detailed findings for each organ
4. Generate → Review → Suggestions appear → Edit if needed → PDF
**Time: 7 minutes**

### Workflow 3: Quick Specific Disease Report
1. Click "Quick Report by Disease"
2. Type "Kidney Stone"
3. Auto-selects template, generates complete report
4. Edit measurements to match your case → PDF
**Time: 3 minutes**

---

## Troubleshooting

### Voice not working?
- Check browser supports Web Speech API (Chrome, Edge, Safari)
- Allow microphone permission when prompted
- Reload page and try again
- Use typing instead as backup

### Report generation fails?
- Check you have text in the textarea
- Verify internet connection is stable
- Wait 5 seconds and try again
- Check error message - follow instructions

### Template sections not filling?
- Ensure template is selected (blue info bar visible)
- Dictate clear findings related to study type
- Try simpler dictation first
- Check that text in textarea is substantial

### PDF doesn't download?
- Check browser popup blocker
- Check download folder
- Try different browser
- Check internet connection

### Can't login?
- Verify email and password are correct
- Check caps lock is off
- Clear browser cache and try again
- Sign up if you forgot password

---

## Contact & Support

**For technical issues:**
- Document the problem with steps to reproduce
- Note browser and device
- Copy any error messages shown

**For clinical questions:**
- Review generated report closely
- Edit sections as needed
- Always verify AI output before using

---

## Next Steps

1. **Create your account** - Takes 1 minute
2. **Try a test report** - Pick any study type, dictate findings
3. **Review generated content** - Check quality and accuracy
4. **Use in daily workflow** - Gradually integrate into practice
5. **Provide feedback** - Let us know what works and what to improve

---

## Privacy & Security

RadAI is:
- ✓ HIPAA compliant
- ✓ Encrypted data transmission
- ✓ Secure authentication
- ✓ User data isolation
- ✓ No sharing with third parties

Your reports are:
- Stored securely in encrypted database
- Only accessible by you (not other users)
- Deletable at any time
- Backed up automatically

---

## Success Metrics

After testing, we'd love to know:
- **How much time did you save per report?**
- **Were sections filled accurately?**
- **Did you need to edit much?**
- **Overall satisfaction (1-10)?**
- **What features were most helpful?**
- **What could be improved?**

---

**Welcome to RadAI! We're excited to help you work smarter, not harder.**

**Ready to generate your first report? Click "New Report" to begin!**

