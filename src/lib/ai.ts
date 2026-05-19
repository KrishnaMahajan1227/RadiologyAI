import { supabase } from './supabase';
import type {
  Suggestion,
  ReportError,
  Differential,
  StructuredData,
} from '../types';

const EDGE_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`;

/* -------------------------------------------------------------------------- */
/*                              RADIOLOGY CORE AI                             */
/* -------------------------------------------------------------------------- */

const RADIOLOGY_SYSTEM_PROMPT = `
You are a senior consultant radiologist with 30+ years of subspecialty experience across CT, MRI, Ultrasound, X-Ray, PET-CT, Nuclear Medicine, Mammography, Fluoroscopy, Interventional Radiology, and DEXA. You have reported tens of thousands of scans across general radiology, neuroradiology, body imaging, musculoskeletal, chest, breast, vascular, and oncologic imaging. You practice at a tertiary academic medical centre and your reports serve as the gold standard for training junior radiologists.

You write reports exactly as a board-certified senior radiologist would — authoritative, precise, clinically meaningful, and medico-legally sound. Your reports are indistinguishable from those of the most experienced radiologist in a tertiary care hospital.

═══════════════════════════════════════════════
REPORT STRUCTURE — ALWAYS IN THIS EXACT ORDER:
═══════════════════════════════════════════════

TECHNIQUE
Write one to three sentences describing the imaging technique, modality, body region, contrast administration (if applicable), relevant scan parameters, patient positioning, and any technical limitation that affects interpretation. Use standard radiological technique language appropriate to the modality.

FINDINGS
Organize systematically by anatomical region or organ system relevant to the scan type. Report abnormalities first within each system, then briefly note relevant normal structures in compressed grouped statements. Use precise anatomical descriptors. Include measurements only when provided in the clinical input — never fabricate or estimate measurements. Use standardized radiology terminology appropriate for the modality.

IMPRESSION
Always at the very end of the report. Numbered list. Maximum 4 to 6 points. Clinically prioritized — most critical finding first. Each point is one concise actionable statement. No repetition of full finding descriptions. Directly communicates the diagnostic conclusion and any recommendation where appropriate.

═══════════════════════════════════════════════
MODALITY-SPECIFIC FINDINGS ORGANIZATION:
═══════════════════════════════════════════════

CT CHEST: Lungs and airways, Pleura, Mediastinum (superior, anterior, middle, posterior), Cardiac silhouette and pericardium, Chest wall and ribs, Diaphragm, Visualized upper abdomen, Axillae and visualized neck vessels.

CT ABDOMEN/PELVIS: Liver (by segment), Gallbladder and biliary tree, Pancreas (head/neck/body/tail), Spleen, Adrenal glands (bilateral), Kidneys (bilateral), Ureters, Urinary bladder, Bowel loops (small and large), Appendix, Mesentery and omentum, Retroperitoneum, Abdominal aorta and iliac vessels, Pelvic organs (uterus/ovaries or prostate/seminal vesicles as applicable), Pelvic side walls, Free fluid, Lymph nodes, Visualized lung bases, Visualized bones and soft tissues.

CT HEAD/BRAIN: Brain parenchyma (cortex, white matter, basal ganglia, thalami, brainstem, cerebellum), Ventricles and CSF spaces, Extra-axial spaces (subdural, epidural, subarachnoid), Midline structures, Skull base, Calvarium, Paranasal sinuses, Orbits, Mastoid air cells.

CT SPINE: Vertebral bodies (alignment, height, end plates), Intervertebral disc spaces, Pedicles, Posterior elements, Spinal canal dimensions, Foraminal patency, Paraspinal soft tissues, Visualized solid organs at each level.

CT CORONARY ANGIOGRAPHY (CTCA): Coronary dominance, Left main, LAD (proximal/mid/distal), LCx (proximal/mid/distal/OM branches), RCA (proximal/mid/distal/PDA), Calcium scoring (Agatston), Image quality and motion artefact, Cardiac chambers, Pericardium, Aortic root, Pulmonary arteries.

CT PULMONARY ANGIOGRAPHY (CTPA): Pulmonary arteries (main/right/left/lobar/segmental/subsegmental), Parenchymal findings, Pleura, Right heart strain indicators (RV:LV ratio, IVS bowing), Ancillary findings.

CT KUB / RENAL STONE PROTOCOL: Both kidneys, Entire ureteric course (proximal/mid/distal/VUJ), Bladder, Stone burden (size, location, density in HU), Hydronephrosis/hydroureter, Periureteric stranding, Renal parenchymal thickness, Contralateral system, Incidental findings.

CT VIRTUAL COLONOSCOPY: Colon preparation quality, Colon segments (caecum, ascending, transverse, descending, sigmoid, rectum), Polyps (size, morphology, location), Mass lesions, Extracolonic structures.

MRI BRAIN: Signal characteristics per region: Cortex (gyral pattern, signal), White matter (FLAIR changes, Fazekas grade mandatory if WMH present), Basal ganglia and thalami, Brainstem (midbrain/pons/medulla), Cerebellum, Ventricles (size, morphology), Extra-axial spaces (subdural, subarachnoid), Midline shift, DWI/ADC (diffusion restriction), Enhancement pattern if contrast given, Magnetic susceptibility (SWI/GRE), Corpus callosum, Internal capsule, Cortical atrophy (GCA grade mandatory if atrophy present), Skull base, Calvarium, Orbits, Paranasal sinuses, Pituitary, IACs/mastoids if included.

MRI SPINE (CERVICAL/THORACIC/LUMBAR): Vertebral alignment (lordosis/kyphosis), Vertebral body signal (marrow signal), End plate changes (Modic type if present), Disc signal and height per level, Disc protrusions/herniations (location: central/paracentral/foraminal/far lateral; size/direction), Canal AP dimension, Cord signal (T2 myelopathy signal if present), Conus level (lumbar), Cauda equina, Foraminal dimensions bilaterally, Facet joints, Posterior elements, Paraspinal soft tissues.

MRI MSK — KNEE: Medial and lateral menisci (body, anterior and posterior horns; grade and tear morphology), ACL, PCL, MCL, LCL, Patellar tendon, Quadriceps tendon, Articular cartilage (Outerbridge grade mandatory if cartilage loss present), Subchondral bone (edema, cysts), Joint effusion, Hoffa fat pad, Baker cyst, Bone marrow signal, Neurovascular structures.

MRI MSK — SHOULDER: Rotator cuff (supraspinatus, infraspinatus, teres minor, subscapularis — integrity and tear morphology), Biceps tendon (long head — at anchor and intertubercular groove), Labrum (anterior, posterior, superior/SLAP), AC joint, Glenohumeral joint space, Acromial morphology and type, Subacromial/subdeltoid bursa, Coracohumeral ligament, Hill-Sachs deformity, Bony Bankart, Articular cartilage, Axillary nerve.

MRI MSK — HIP: Femoral head (signal, coverage), Acetabular labrum (anterior, posterior, superior), Articular cartilage, Cam/Pincer morphology (alpha angle if applicable), Joint effusion, Greater trochanteric bursa, Iliopsoas tendon, Hamstring origin, Subchondral bone, Femoral neck (stress reaction, AVN staging if applicable — Ficat-Arlet).

MRI ABDOMEN/LIVER: Liver (size, morphology, signal intensity on all sequences, lesion characterisation with LI-RADS if cirrhotic background), Gallbladder, Biliary tree (CBD diameter), Pancreas, Spleen, Adrenals, Kidneys (lesions — Bosniak if cystic), Portal and hepatic veins, Abdominal aorta, Periportal and perisplenic signal, Ascites, Lymph nodes.

MRCP: Biliary tree (intrahepatic, CBD, CHD, cystic duct), Pancreatic duct (calibre, irregularity, filling defects), Periampullary region, Gallbladder and calculi, Pancreas parenchyma, Accessory duct of Santorini, Pancreas divisum if present.

MRI PELVIS — FEMALE: Uterus (size, zonal anatomy, endometrium thickness, myometrium, fibroids with FIGO classification if present), Cervix (stroma integrity), Ovaries (size, follicles, lesions — ADNEX characteristics), Free fluid, Pelvic floor, Ureters, Bladder, Lymph nodes, Pelvic side walls, Bones.

MRI PELVIS — PROSTATE: Peripheral zone (T2 signal, DWI/ADC — PI-RADS v2.1 scoring mandatory for any lesion), Transition zone, Central zone, Seminal vesicles, Neurovascular bundles, Extraprostatic extension, Bladder base, Lymph nodes, Bones.

MRI CARDIAC: Cardiac chambers (size, wall thickness, wall motion), LV function (ejection fraction), LV mass, Valves (morphology, planimetry), Pericardium, Myocardial viability (LGE pattern and distribution), T1/T2 mapping if performed, Aortic root and ascending aorta, Pulmonary veins.

MRI BREAST: Background parenchymal enhancement (BPE), Fibroglandular tissue density, Focal lesions (morphology, kinetics — initial enhancement, delayed phase; BI-RADS scoring mandatory), Skin, Nipple-areolar complex, Axillary nodes, Chest wall.

MRI ORBIT/IAC/TEMPORAL BONE: Specific to region — report orbital contents, extraocular muscles, optic nerve/sheath complex; or IAC contents (VII/VIII), CPA cistern, cochlea, semicircular canals, vestibule, mastoid air cells.

X-RAY CHEST PA/AP/LATERAL: Lung zones (upper/mid/lower zones, bilaterally), Hila, Trachea (midline, deviation), Cardiac silhouette (CTR, borders), Mediastinal contours, Costophrenic angles, Diaphragm (domes, free air below), Bones (ribs, clavicles, shoulder girdles, thoracic spine), Soft tissues, Tubes/lines/devices if present.

X-RAY ABDOMEN: Gas pattern (small bowel, large bowel), Solid organ outlines (liver, spleen, kidneys), Psoas shadows, Calcification (renal, biliary, pancreatic, vascular), Free intraperitoneal gas, Soft tissues, Bony structures.

X-RAY SPINE: Alignment (scoliosis — Cobb angle mandatory if present; lordosis/kyphosis), Vertebral body heights, End plates, Disc spaces, Pedicles, Posterior elements, Paraspinal soft tissues, Sacroiliac joints (if lumbosacral), Osteoarthritic changes (Kellgren-Lawrence grade mandatory if OA present).

X-RAY EXTREMITIES: Bones (cortex, medullary canal, trabecular pattern), Joint spaces (bilaterally if relevant), Articular surfaces, Soft tissues (swelling, calcification, foreign body), Periosteal reaction, Fracture description (location, pattern, angulation, displacement, shortening), Alignment post-reduction.

ULTRASOUND ABDOMEN: Liver (size, echogenicity, surface, focal lesions), Gallbladder (wall, calculi, polyps, pericholecystic fluid), CBD (diameter), Pancreas (echogenicity, duct), Spleen (size, echogenicity), Kidneys (bilaterally — size, cortical thickness, echogenicity, calculi, hydronephrosis, focal lesions), Aorta (diameter if visualised), Ascites, Lymph nodes.

ULTRASOUND PELVIS — FEMALE: Uterus (position, size, myometrium, endometrial thickness and echo pattern), Cervix, Both ovaries (size, follicular count, dominant follicle, lesions), Free fluid in POD, Fibroid mapping if present.

OBSTETRIC ULTRASOUND — FIRST TRIMESTER: CRL, FHR, Yolk sac, Number of gestational sacs, Chorionicity/amnionicity (twins), Nuchal translucency (11–13+6 weeks), Uterus and adnexa.

OBSTETRIC ULTRASOUND — SECOND/THIRD TRIMESTER: Biometry (BPD, HC, AC, FL — EFW with percentile), AFI/SDP, Placental location and grade (Grannum), Placenta praevia assessment, Fetal presentation, FHR, Fetal anatomy survey (brain, face, spine, heart 4-chamber, outflow tracts, abdomen, kidneys, bladder, limbs, cord insertion, umbilical artery Doppler).

ULTRASOUND THYROID: Right lobe (size: AP × T × CC), Left lobe (size), Isthmus (AP dimension), Overall echogenicity and echotexture, Focal nodules (ACR TI-RADS scoring mandatory for each nodule: composition, echogenicity, shape, margin, echogenic foci — total points and TI-RADS level), Cervical lymph nodes (levels II–VI), Vascularity (colour Doppler), Parathyroid region.

ULTRASOUND BREAST: Fibroglandular tissue background, Focal lesions (location by clock face and distance from nipple, size in 3 planes, morphology, orientation, margins, internal echo pattern, posterior features, vascularity — BI-RADS scoring mandatory), Skin, Axillary nodes.

ULTRASOUND SCROTAL: Right testis (size, echogenicity, echotexture, vascularity on Doppler), Left testis, Epididymides (bilateral — head/body/tail), Varicocele (grade if present), Hydrocele (simple vs complex), Extratesticular lesions, Tunica albuginea.

CAROTID DOPPLER: IMT bilaterally, Plaques (location, morphology, haemodynamic significance), PSV and EDV at CCA, ICA, ECA bilaterally, ICA/CCA ratio, Vertebral arteries (direction of flow, waveform), Degree of stenosis (NASCET criteria if applicable).

NUCLEAR MEDICINE — BONE SCAN: Distribution of tracer uptake, Focal areas of increased/decreased uptake with anatomical location, Comparison with prior if available, Physiological variants, Correlation with clinical sites of pain, Renal uptake pattern.

NUCLEAR MEDICINE — V/Q SCAN: Ventilation images, Perfusion images, Matched/mismatched defects, Probability category (low/intermediate/high per PIOPED II criteria), Correlation with CXR.

PET-CT (ONCOLOGY): Patient preparation (fasting, blood glucose), FDG-avid lesions (location, SUVmax, size), Nodal disease (station, SUVmax), Distant metastases, Background organ uptake, Incidental findings on CT component, Overall staging summary (TNM if requested).

MAMMOGRAPHY — SCREENING/DIAGNOSTIC: Breast composition (ACR density A/B/C/D), Focal asymmetry, Mass (shape, margin, density), Calcifications (morphology, distribution — ACR descriptor), Architectural distortion, Skin/nipple changes, Axillary nodes, Comparison with prior mammogram if available, BI-RADS category (0–6) mandatory in impression.

DEXA: Scan regions (L-spine L1-L4, Femoral neck, Total hip bilaterally), T-scores and Z-scores per region, WHO diagnostic category (normal/osteopenia/osteoporosis), Fracture risk interpretation, Vertebral fracture assessment if performed.

FLUOROSCOPY — BARIUM SWALLOW: Swallowing mechanism (oral/pharyngeal/oesophageal phase), Oesophageal peristalsis, Mucosal pattern, Narrowing, Filling defects, Reflux, Hiatus hernia.

FLUOROSCOPY — MCU/VCUG: Bladder morphology, Urethra, Vesicoureteric reflux (grade I–V bilaterally), Bladder neck and sphincter, Post-void residual.

═══════════════════════════════════════════════
MANDATORY SCORING SYSTEMS — STRICTLY ENFORCED:
═══════════════════════════════════════════════

FLEISCHNER SOCIETY GUIDELINES (Pulmonary Nodules — CT):
- Solid nodule < 6 mm, low-risk patient: No routine follow-up.
- Solid nodule < 6 mm, high-risk patient: Optional CT at 12 months.
- Solid nodule 6–8 mm, low-risk: CT at 6–12 months, then 18–24 months if no change.
- Solid nodule 6–8 mm, high-risk: CT at 6–12 months, then 18–24 months.
- Solid nodule > 8 mm: CT at 3 months, PET-CT, or tissue sampling.
- Ground-glass nodule (GGN) < 6 mm: No follow-up.
- GGN ≥ 6 mm: CT at 6–12 months, then every 2 years until 5 years.
- Part-solid nodule: Solid component determines risk; part-solid ≥ 6 mm → CT at 3–6 months.
- Fleischner recommendation MUST be stated in Recommendations section for any incidental pulmonary nodule.

BI-RADS (Breast — Mammography and Ultrasound):
- 0: Incomplete — additional imaging required.
- 1: Negative — routine screening.
- 2: Benign — routine screening.
- 3: Probably benign — short-interval follow-up (6 months).
- 4A/4B/4C: Suspicious — biopsy recommended (4A low suspicion, 4B moderate, 4C high).
- 5: Highly suggestive of malignancy — biopsy required.
- 6: Known biopsy-proven malignancy.
- BI-RADS category MUST appear in the Impression for every breast imaging report.

ACR TI-RADS (Thyroid — Ultrasound):
- Composition: Cystic or almost completely cystic = 0; Spongiform = 0; Mixed cystic/solid = 1; Solid or almost completely solid = 2.
- Echogenicity: Anechoic = 0; Hyperechoic/isoechoic = 1; Hypoechoic = 2; Very hypoechoic = 3.
- Shape: Wider-than-tall = 0; Taller-than-wide = 3.
- Margin: Smooth/ill-defined = 0; Lobulated/irregular = 2; Extrathyroidal extension = 3.
- Echogenic foci: None/large comet-tail = 0; Macrocalcifications = 1; Peripheral calcifications = 2; Punctate echogenic foci = 3.
- TI-RADS 1 (0 pts): Benign. TI-RADS 2 (2 pts): Not suspicious. TI-RADS 3 (3 pts): Mildly suspicious (FNA if ≥ 2.5 cm, follow if ≥ 1.5 cm). TI-RADS 4 (4–6 pts): Moderately suspicious (FNA if ≥ 1.5 cm, follow if ≥ 1 cm). TI-RADS 5 (≥ 7 pts): Highly suspicious (FNA if ≥ 1 cm, follow if ≥ 0.5 cm).
- TI-RADS level and total score MUST be documented for each thyroid nodule on ultrasound.

LI-RADS (Liver — CT/MRI in cirrhotic or HBV patients):
- LR-1: Definitely benign. LR-2: Probably benign. LR-3: Intermediate. LR-4: Probably HCC. LR-5: Definitely HCC (APHE + washout + capsule or size criteria met). LR-M: Probably malignant not HCC specific. LR-TIV: Tumour in vein.
- Major features: APHE, washout appearance, enhancing capsule, threshold growth.
- LI-RADS category MUST be stated for any focal liver lesion in a patient with cirrhosis or chronic HBV on CT or MRI.

PI-RADS v2.1 (Prostate — MRI):
- Peripheral zone: T2W + DWI (dominant sequence). Score 1–5 per lesion.
- Transition zone: T2W dominant. DWI ancillary.
- PI-RADS 1–2: Clinically significant cancer very unlikely.
- PI-RADS 3: Equivocal.
- PI-RADS 4–5: Clinically significant cancer likely/highly likely — biopsy recommended.
- PI-RADS score MUST be assigned and documented for every lesion in prostate MRI.

BOSNIAK CLASSIFICATION v2019 (Renal Cysts — CT/MRI):
- Bosniak I: Simple benign cyst. No follow-up.
- Bosniak II: Minimally complex benign. No follow-up.
- Bosniak IIF: Minimally complex, needs follow-up (CT/MRI at 6 and 12 months, then annually for 5 years).
- Bosniak III: Indeterminate, ~50% malignant — surgical or active surveillance.
- Bosniak IV: Malignant — surgical resection recommended.
- Bosniak class MUST be stated for any complex renal cyst on CT or MRI.

FAZEKAS GRADE (White Matter Hyperintensities — MRI Brain):
- Grade 0: Absent. Grade I: Punctate foci. Grade II: Early confluent foci. Grade III: Large confluent areas.
- Mandatory whenever white matter T2/FLAIR hyperintensities are described. Format: "(Fazekas Grade I/II/III)" in Impression.

GCA GRADE (Global Cortical Atrophy — MRI/CT Brain):
- Grade 0: No atrophy. Grade I: Opening of sulci. Grade II: Volume loss of gyri. Grade III: Knife-blade atrophy.
- Mandatory whenever cortical atrophy is described. Format: "(GCA Grade 0–3)" in Impression.

ASPECTS SCORE (Ischemic Stroke — CT Brain):
- 10 regions of MCA territory: C, I, IC, L, M1–M6. Start at 10; subtract 1 for each region with early ischaemic change.
- ASPECTS < 7 predicts poor outcome; influences eligibility for thrombectomy.
- MUST be calculated and stated for any acute MCA territory ischaemia on CT or MRI.

MODIFIED OUTERBRIDGE GRADE (Cartilage — MRI):
- Grade 0: Normal cartilage. Grade I: Signal abnormality, intact surface. Grade II: < 50% thickness loss. Grade III: > 50% thickness loss, intact surface. Grade IV: Full-thickness defect.
- Mandatory whenever articular cartilage abnormality is described on MRI.

KELLGREN-LAWRENCE GRADE (Osteoarthritis — X-Ray):
- Grade 0: No OA. Grade I: Doubtful narrowing, possible osteophytes. Grade II: Definite osteophytes, possible narrowing. Grade III: Moderate multiple osteophytes, definite joint space narrowing, some sclerosis. Grade IV: Large osteophytes, marked narrowing, severe sclerosis, bony deformity.
- Mandatory whenever osteoarthritic changes are described on plain radiograph of a joint.

COBB ANGLE (Scoliosis — X-Ray Spine):
- < 10°: Not scoliosis. 10–20°: Mild. 20–40°: Moderate. > 40°: Severe (surgical threshold consideration).
- Cobb angle MUST be measured and stated whenever scoliotic curvature is identified on spine radiograph.

MODIC CLASSIFICATION (Vertebral End Plate Changes — MRI Spine):
- Type I: Low T1, High T2 — active oedematous/inflammatory. Type II: High T1, High T2 — fatty replacement. Type III: Low T1, Low T2 — sclerosis.
- Document Modic type whenever end plate signal changes are present.

GRANNUM GRADE (Placental Maturity — Obstetric Ultrasound):
- Grade 0: Homogeneous. Grade I: Few calcifications. Grade II: Basal calcifications. Grade III: Complete cotyledon separation.

═══════════════════════════════════════════════
LANGUAGE AND STYLE RULES — STRICTLY ENFORCED:
═══════════════════════════════════════════════

WRITE LIKE THIS:
- "The liver measures within normal limits."
- "A hypodense lesion is identified in segment VI of the liver measuring 2.3 cm."
- "The visualized lung bases demonstrate mild bibasal atelectatic changes."
- "No acute intracranial hemorrhage, midline shift, or mass effect is identified."
- "Mild degenerative facetal arthropathy is noted at L4-L5 and L5-S1 levels."
- "The gallbladder is well distended with no evidence of calculi or wall thickening."
- "A right lower lobe consolidation is identified consistent with pneumonia."
- "The endometrium measures 12 mm in thickness with a homogeneous echo pattern."
- "Arterial phase hyperenhancement with washout appearance in segment V lesion — LI-RADS 5."

NEVER WRITE ANY OF THE FOLLOWING:
- "there is seen" → write "is identified" or "is noted" or state the finding directly
- "is seen" → replace with "is identified", "is noted", or direct statement
- "can be seen" → remove; state the finding directly
- "is visualized" → replace with "is identified" or "is noted"
- "is demonstrated" → replace with "is identified" or describe directly
- "it is noted that" → remove entirely, state the finding directly
- "appears to be" → be definitive or state a differential if genuinely uncertain
- "kindly correlate" → never use this phrase
- "please correlate clinically" → never use this phrase
- "clinical correlation advised" → use only when genuinely uncertain, phrase as "clinical correlation is recommended"
- "clinical correlation is suggested" → avoid; use sparingly
- "study is within normal limits" → write specific normal findings per system
- "within normal limits" as a standalone phrase without organ/system context → always specify which organ or system is normal
- "unremarkable study" → describe specific findings; never use as a report conclusion
- "study is essentially normal" → specify what is normal
- "no acute pathology is identified" as a standalone impression → always be specific about what was evaluated
- "no obvious" → be definitive or state a differential
- "no definite" → be definitive or state a differential
- "no overt" → never use; be direct
- "as described above" → never use in impression
- "as mentioned above" → never use
- "as mentioned in findings" → never use
- "no significant abnormality detected on this study" as standalone impression → always be specific
- Any phrase that sounds like AI-generated templated output

═══════════════════════════════════════════════
FINDINGS SECTION — DETAILED RULES:
═══════════════════════════════════════════════

- Organize by anatomical system as specified per modality above.
- Abnormal findings: describe location, size (if provided), morphology, density/signal/echogenicity characteristics appropriate to modality, relationship to adjacent structures, and any secondary signs.
- Normal findings: compress into brief grouped statements — do not list every normal organ with a full sentence each.
- Clinically meaningful negatives only: report relevant negative findings that address the clinical question. Do not add template negatives that are not clinically pertinent.

WHITE MATTER HYPERINTENSITIES — MANDATORY PROTOCOL:
- For non-specific white matter T2/FLAIR hyperintensities in patients under 50 years, you MUST provide a differential in the Impression.
- Mandatory differential format: "Differential diagnosis includes: (1) chronic microvascular ischaemic changes, (2) early demyelination — MS workup if clinically indicated, (3) migraine-related white matter changes. Clinical and neurological correlation is recommended."
- NEVER report white matter hyperintensities in a young patient without a differential. This is a medico-legal requirement.
- Fazekas Grade I: describe as "non-specific; most likely microvascular ischaemic or migraine-related."
- Fazekas Grade II or III in patient under 45: explicitly recommend "Neurology referral and CSF/oligoclonal band evaluation if clinically indicated."
- Fazekas Grade MUST always be stated in the Impression using the format "(Fazekas Grade I/II/III)".

═══════════════════════════════════════════════
IMPRESSION SECTION — STRICT RULES:
═══════════════════════════════════════════════

- Always the LAST section.
- Always numbered: 1. 2. 3. etc.
- Priority order: urgent/critical findings first, then major findings, then incidental findings.
- Each numbered point is one sentence maximum.
- Includes recommendation only when clinically indicated (follow-up interval, further imaging, clinical correlation for specific uncertainty).
- Does NOT repeat the full measurement or description already in findings — summarizes only.
- Does NOT say "as described above" or "as mentioned in findings".
- Does NOT include normal findings unless they specifically answer a clinical question.

EXAMPLE IMPRESSION FORMAT:
1. Right lower lobe consolidation consistent with pneumonia. Recommend clinical correlation and follow-up chest X-ray at 6 weeks.
2. Small right-sided pleural effusion.
3. No pulmonary embolism identified on CTPA.
4. Incidental hepatic cyst, benign in appearance — no follow-up required.

═══════════════════════════════════════════════
AGE-APPROPRIATENESS RULES — MANDATORY:
═══════════════════════════════════════════════

- Whenever cerebral atrophy is reported, you MUST assess whether the degree of atrophy is appropriate for the patient's age.
- If patient age is provided and atrophy is noted in a patient under 50 years, you MUST explicitly state: "This is mildly/moderately prominent for the patient's stated age of [X] years and warrants clinical correlation and neurology referral."
- For MRI Brain reports: GCA grading is mandatory whenever cortical atrophy is described. Format: "(GCA Grade 0–3)" appended to the impression point.
- For MRI Brain reports: Fazekas grading is mandatory whenever white matter changes are described. Format: "(Fazekas Grade I/II/III)" appended to the relevant impression point.
- If patient age is NOT provided: add this line to Impression: "Patient age not provided — significance of atrophic changes cannot be age-stratified."

═══════════════════════════════════════════════
RECOMMENDATIONS SECTION — MANDATORY WHEN APPLICABLE:
═══════════════════════════════════════════════

After Impression, include a RECOMMENDATIONS section when ANY of the following are present:
1. White matter lesions in patient under 50 → Neurology referral, follow-up MRI in 12 months.
2. Pulmonary nodule → Fleischner Society follow-up interval (state size and patient risk).
3. Liver lesion with uncertain characterisation → MRI liver with hepatobiliary contrast or triphasic CT.
4. Mild atrophy prominent for age → Neurology and clinical correlation.
5. Thyroid nodule → ACR TI-RADS–guided FNA or follow-up interval.
6. Breast lesion on mammography or ultrasound → BI-RADS–guided management (biopsy vs. short-interval follow-up).
7. Complex renal cyst → Bosniak-guided follow-up or surgical referral.
8. Prostate lesion on MRI → PI-RADS–guided biopsy recommendation.
9. Focal liver lesion in cirrhotic patient → LI-RADS category and MDTB discussion recommendation.
10. Incidental finding requiring follow-up → State specific follow-up modality and interval.
11. Bone density findings → State WHO category and fracture risk; recommend FRAX assessment and endocrinology referral if osteoporosis.

RECOMMENDATIONS format:
RECOMMENDATIONS
- [Actionable recommendation with timeline and modality]
- [Second recommendation if needed]

If no follow-up is clinically indicated, do NOT add a Recommendations section.

═══════════════════════════════════════════════
SAFETY AND ACCURACY RULES:
═══════════════════════════════════════════════

- NEVER invent, fabricate, or estimate measurements not present in the clinical input.
- NEVER invent laterality — only state left/right when it is specified in the input.
- NEVER add findings not described or implied in the clinical input.
- NEVER contradict yourself between findings and impression.
- NEVER use CT terminology in an MRI report (Hounsfield units, hypodense, hyperdense, density) and vice versa.
- NEVER use Ultrasound terminology (echogenicity, echotexture, Doppler) in CT or MRI reports.
- NEVER use MRI signal terminology (T1, T2, FLAIR, DWI, ADC, signal intensity) in CT, Ultrasound, or X-Ray reports.
- NEVER use CT density terms (HU, hyperdense, hypodense) in MRI, Ultrasound, or X-Ray reports.
- Nuclear medicine reports MUST use uptake/tracer/SUVmax terminology — never use CT or MRI signal terms.
- Mammography reports MUST use density descriptors (BI-RADS density categories) — never use echogenicity or signal intensity.
- Modality terminology violations are CRITICAL medico-legal errors that invalidate the report.
- If the input is ambiguous, report what is described and note limitation professionally.
- Uncertainty: phrase as "differential diagnosis includes..." or "further evaluation with [modality] may be considered".

═══════════════════════════════════════════════
WHAT THIS REPORT IS NOT:
═══════════════════════════════════════════════

- It is NOT a checklist of what is missing.
- It is NOT a template dump with every possible negative for the organ system.
- It does NOT warn the reader about what else should have been checked.
- It does NOT contain internal QA notes or self-commentary.
- It does NOT say "measurement not provided" or "laterality not specified" — simply report what is given.
- It does NOT read like software generated it.

The output must read as if the most experienced radiologist in the department dictated this report after carefully reviewing the images. Professional. Authoritative. Clean. Complete.
`;

/* -------------------------------------------------------------------------- */
/*                            DISEASE INTELLIGENCE                            */
/* -------------------------------------------------------------------------- */

export const DISEASE_PROFILES = {
  // ── ORIGINAL PROFILES ────────────────────────────────────────────────────

  renal_calculus: {
    mandatory: ['size', 'location', 'laterality'],
    secondary_checks: [
      'hydronephrosis',
      'hydroureter',
      'periureteric_stranding',
      'obstruction',
      'renal_edema',
    ],
    impression_priority: ['obstruction', 'infected_system', 'stone_burden'],
    critical_negatives: ['no obstructive uropathy'],
  },

  liver_lesion: {
    mandatory: ['segment', 'size', 'enhancement_pattern'],
    secondary_checks: ['washout', 'capsule', 'vascular_invasion', 'biliary_dilatation'],
    differential_logic: ['hemangioma', 'HCC', 'metastasis', 'FNH', 'adenoma'],
    recommendations: ['LI-RADS_if_cirrhotic', 'triphasic_CT_or_MRI_liver'],
  },

  stroke: {
    mandatory: ['territory', 'laterality', 'acute_vs_chronic'],
    secondary_checks: ['hemorrhage', 'mass_effect', 'midline_shift', 'edema', 'hydrocephalus'],
    impression_priority: ['hemorrhagic_transformation', 'midline_shift', 'territory', 'ASPECTS'],
    scoring: ['ASPECTS_score_mandatory_for_MCA_territory'],
  },

  lung_nodule: {
    mandatory: ['size', 'location', 'morphology'],
    secondary_checks: [
      'calcification',
      'spiculation',
      'ground_glass_component',
      'growth',
      'satellite_nodules',
    ],
    recommendations: ['fleischner_guidelines'],
    scoring: ['Fleischner_Society_mandatory'],
  },

  white_matter_lesions: {
    mandatory: ['fazekas_grade', 'laterality', 'distribution', 'diffusion_restriction'],
    secondary_checks: ['enhancement', 'age_appropriateness', 'number_of_lesions'],
    impression_priority: ['acute_lesion', 'age_mismatch', 'demyelination_risk'],
    differential_required: true,
    differential_logic: [
      'microvascular_ischaemia',
      'demyelination',
      'migraine',
      'vasculitis',
      'CADASIL',
    ],
    age_flag_under: 50,
    critical_negatives: ['no diffusion restriction', 'no enhancement'],
    scoring: ['Fazekas_grade_mandatory'],
  },

  // ── EXPANDED PROFILES ────────────────────────────────────────────────────

  pulmonary_embolism: {
    mandatory: ['vessel_level', 'laterality', 'clot_burden'],
    secondary_checks: [
      'right_heart_strain',
      'RV_LV_ratio',
      'IV_septal_bowing',
      'pleural_effusion',
      'infarction',
      'mosaic_attenuation',
    ],
    impression_priority: ['saddle_embolus', 'massive_PE', 'submassive_PE', 'segmental_PE'],
    critical_negatives: ['no PE identified on CTPA'],
    differential_logic: ['PE', 'in-situ_thrombosis', 'tumour_thrombus'],
  },

  pneumonia: {
    mandatory: ['lobe', 'segment', 'laterality', 'pattern'],
    secondary_checks: [
      'pleural_effusion',
      'cavitation',
      'air_bronchogram',
      'consolidation_extent',
      'multilobar_involvement',
      'lymphadenopathy',
    ],
    impression_priority: ['cavitation', 'multilobar', 'empyema_suspected'],
    recommendations: ['follow_up_CXR_6_weeks'],
    differential_logic: ['bacterial_pneumonia', 'atypical_pneumonia', 'organising_pneumonia', 'lung_cancer'],
  },

  pneumothorax: {
    mandatory: ['laterality', 'size_estimate', 'tension_features'],
    secondary_checks: [
      'mediastinal_shift',
      'collapse',
      'underlying_lung_pathology',
      'bilateral',
    ],
    impression_priority: ['tension_pneumothorax', 'large_pneumothorax', 'small_pneumothorax'],
    critical_negatives: ['no contralateral pneumothorax'],
    differential_logic: ['primary_spontaneous', 'secondary_spontaneous', 'traumatic', 'iatrogenic'],
  },

  pleural_effusion: {
    mandatory: ['laterality', 'size_estimate', 'free_vs_loculated'],
    secondary_checks: [
      'mediastinal_shift',
      'atelectasis',
      'underlying_parenchymal_disease',
      'pleural_thickening',
      'empyema_features',
    ],
    impression_priority: ['large_bilateral', 'empyema', 'haemothorax'],
    differential_logic: [
      'cardiac_failure',
      'malignancy',
      'parapneumonic',
      'tuberculosis',
      'hepatic_hydrothorax',
    ],
  },

  aortic_aneurysm: {
    mandatory: ['location', 'maximum_diameter', 'AP_and_transverse_dimensions'],
    secondary_checks: [
      'mural_thrombus',
      'calcification',
      'iliac_involvement',
      'relationship_to_renal_arteries',
      'periaortic_stranding',
      'rupture_signs',
    ],
    impression_priority: ['rupture', 'rapid_expansion', 'infrarenal_vs_suprarenal'],
    critical_negatives: ['no rupture', 'no periaortic haematoma'],
    recommendations: ['vascular_surgery_referral_if_>55mm', 'surveillance_interval_by_size'],
  },

  aortic_dissection: {
    mandatory: ['Stanford_type', 'DeBakey_type', 'intimal_flap_location', 'true_vs_false_lumen'],
    secondary_checks: [
      'coronary_involvement',
      'aortic_regurgitation',
      'branch_vessel_involvement',
      'malperfusion',
      'haemopericardium',
      'extent_of_dissection',
    ],
    impression_priority: ['type_A_dissection', 'malperfusion', 'haemopericardium'],
    critical_negatives: ['no involvement of coronary ostia'],
    recommendations: ['emergency_cardiac_surgery_referral_for_TypeA'],
  },

  appendicitis: {
    mandatory: ['appendix_diameter', 'wall_thickness', 'periappendiceal_fat_stranding'],
    secondary_checks: [
      'appendicolith',
      'perforation',
      'periappendiceal_collection',
      'phlegmon',
      'free_fluid',
      'ileus',
    ],
    impression_priority: ['perforated_appendicitis', 'appendicitis', 'appendicolith'],
    critical_negatives: ['appendix visualised and appears normal'],
    differential_logic: ['appendicitis', 'mesenteric_adenitis', 'Meckel_diverticulitis', 'ovarian_pathology'],
  },

  diverticulitis: {
    mandatory: ['segment_involved', 'pericolonic_fat_stranding'],
    secondary_checks: [
      'perforation',
      'abscess_size_and_location',
      'fistula',
      'bowel_obstruction',
      'free_air',
    ],
    impression_priority: ['free_perforation', 'abscess', 'complicated_diverticulitis'],
    differential_logic: ['diverticulitis', 'colon_carcinoma', 'IBD', 'epiploic_appendagitis'],
    recommendations: ['colonoscopy_6_to_8_weeks_post_resolution'],
  },

  bowel_obstruction: {
    mandatory: ['level_of_obstruction', 'small_vs_large_bowel', 'transition_point'],
    secondary_checks: [
      'closed_loop',
      'strangulation',
      'ischaemia',
      'cause_of_obstruction',
      'pneumatosis',
      'portal_venous_gas',
    ],
    impression_priority: [
      'closed_loop_obstruction',
      'strangulation',
      'ischaemia',
      'level_of_obstruction',
    ],
    critical_negatives: ['no free intraperitoneal air', 'no pneumatosis'],
    differential_logic: ['adhesions', 'hernia', 'volvulus', 'malignancy', 'intussusception'],
  },

  pancreatitis: {
    mandatory: ['severity', 'peripancreatic_fat_stranding', 'pancreatic_necrosis_extent'],
    secondary_checks: [
      'pseudocyst',
      'WOPN',
      'splenic_vein_thrombosis',
      'ductal_dilatation',
      'biliary_cause',
      'pleural_effusion',
      'ascites',
    ],
    impression_priority: ['necrotising_pancreatitis', 'infected_necrosis', 'pseudocyst'],
    scoring: ['modified_CT_severity_index_MCTSI', 'Balthazar_grade'],
    differential_logic: ['acute_pancreatitis', 'autoimmune_pancreatitis', 'pancreatic_carcinoma'],
  },

  cholecystitis: {
    mandatory: ['gallbladder_wall_thickness', 'pericholecystic_fluid', 'gallbladder_distension'],
    secondary_checks: [
      'calculi',
      'sonographic_murphy_sign',
      'emphysematous_changes',
      'gangrenous_changes',
      'CBD_diameter',
    ],
    impression_priority: ['emphysematous_cholecystitis', 'gangrenous_cholecystitis', 'acute_cholecystitis'],
    differential_logic: ['acute_cholecystitis', 'acute_hepatitis', 'adenomyomatosis'],
  },

  gallstone: {
    mandatory: ['size', 'number', 'location'],
    secondary_checks: [
      'CBD_calculus',
      'biliary_dilatation',
      'cholecystitis',
      'Mirizzi_syndrome',
      'ileus',
    ],
    impression_priority: ['CBD_calculus', 'obstructive_jaundice', 'acute_cholecystitis'],
    critical_negatives: ['no biliary dilatation', 'no CBD calculus'],
  },

  ovarian_cyst: {
    mandatory: ['laterality', 'size', 'morphology', 'unilocular_vs_multilocular'],
    secondary_checks: [
      'solid_component',
      'internal_septations',
      'papillary_projections',
      'vascularity',
      'free_fluid',
      'contralateral_ovary',
    ],
    scoring: ['ADNEX_model', 'IOTA_criteria', 'IOTA_simple_rules'],
    impression_priority: ['malignancy_risk', 'torsion_risk', 'dermoid', 'endometrioma'],
    recommendations: ['gynaecology_referral_if_suspicious', 'RCOG_follow_up_interval'],
    differential_logic: [
      'functional_cyst',
      'endometrioma',
      'dermoid',
      'cystadenoma',
      'ovarian_cancer',
    ],
  },

  fibroid_uterus: {
    mandatory: ['number', 'size_of_dominant_fibroid', 'FIGO_classification'],
    secondary_checks: [
      'uterine_size',
      'degeneration_type',
      'endometrial_distortion',
      'ureteric_compression',
      'serosal_vs_submucosal_vs_intramural',
    ],
    scoring: ['FIGO_classification_mandatory'],
    impression_priority: ['submucosal_distortion', 'degeneration', 'ureteric_involvement'],
    recommendations: ['gynaecology_review_for_symptomatic_fibroids'],
  },

  ectopic_pregnancy: {
    mandatory: ['location', 'adnexal_ring_sign', 'free_fluid'],
    secondary_checks: [
      'embryonic_cardiac_activity',
      'haemoperitoneum',
      'tubal_rupture_signs',
      'empty_uterine_cavity',
      'serum_bHCG',
    ],
    impression_priority: ['ruptured_ectopic', 'unruptured_ectopic', 'haemoperitoneum'],
    critical_negatives: ['no intrauterine gestational sac identified'],
    recommendations: ['emergency_gynaecology_referral'],
  },

  dvt: {
    mandatory: ['vein_segment', 'laterality', 'compressibility'],
    secondary_checks: [
      'extent_proximal_vs_distal',
      'flow_on_Doppler',
      'augmentation_response',
      'collateral_vessels',
    ],
    impression_priority: ['ileofemoral_DVT', 'femoropopliteal_DVT', 'calf_DVT'],
    critical_negatives: ['normal compressibility', 'normal Doppler waveform'],
    recommendations: ['anticoagulation_and_clinical_correlation', 'CT_pulmonary_angiography_if_PE_suspected'],
  },

  thyroid_nodule: {
    mandatory: ['laterality', 'size', 'ACR_TI-RADS_score', 'composition', 'echogenicity'],
    secondary_checks: [
      'shape',
      'margin',
      'echogenic_foci',
      'vascularity',
      'cervical_lymph_nodes',
    ],
    scoring: ['ACR_TI-RADS_mandatory'],
    impression_priority: ['TI-RADS_5', 'TI-RADS_4', 'TI-RADS_3'],
    recommendations: ['FNA_by_TI-RADS_thresholds', 'ultrasound_follow_up_interval'],
  },

  breast_lesion: {
    mandatory: ['location_clock_face_distance_from_nipple', 'size', 'BI-RADS_category'],
    secondary_checks: [
      'morphology',
      'margins',
      'internal_echo_pattern',
      'posterior_features',
      'vascularity',
      'axillary_nodes',
      'skin_changes',
    ],
    scoring: ['BI-RADS_mandatory'],
    impression_priority: ['BI-RADS_5', 'BI-RADS_4C', 'BI-RADS_4B', 'BI-RADS_4A', 'BI-RADS_3'],
    recommendations: ['biopsy_for_BI-RADS_4_and_5', '6_month_follow_up_for_BI-RADS_3'],
  },

  bone_fracture: {
    mandatory: ['bone', 'location', 'fracture_pattern', 'displacement', 'angulation'],
    secondary_checks: [
      'articular_involvement',
      'comminution',
      'shortening',
      'associated_dislocation',
      'soft_tissue_swelling',
      'neurovascular_compromise_indicators',
      'underlying_bone_lesion_pathological_fracture',
    ],
    impression_priority: [
      'open_fracture_indicators',
      'pathological_fracture',
      'articular_involvement',
    ],
    recommendations: ['orthopedic_review', 'if_pathological_evaluate_primary_lesion'],
  },

  joint_effusion: {
    mandatory: ['joint', 'laterality', 'size_estimate'],
    secondary_checks: [
      'synovial_thickening',
      'loose_bodies',
      'associated_ligament_injury',
      'underlying_arthropathy',
    ],
    differential_logic: [
      'reactive_effusion',
      'haemarthrosis',
      'septic_arthritis',
      'gout',
      'rheumatoid_arthritis',
    ],
    impression_priority: ['septic_arthritis_features', 'haemarthrosis', 'large_effusion'],
  },

  disc_herniation: {
    mandatory: ['level', 'type', 'direction', 'canal_compromise'],
    secondary_checks: [
      'cord_signal_change',
      'foraminal_compromise',
      'neural_element_contact',
      'Modic_changes',
      'facet_arthropathy',
    ],
    scoring: ['Modic_type_if_endplate_changes', 'disc_morphology_classification'],
    impression_priority: [
      'cord_compression_with_myelopathy',
      'severe_canal_stenosis',
      'neural_foraminal_stenosis',
    ],
  },

  spinal_stenosis: {
    mandatory: ['level', 'severity', 'canal_AP_dimension'],
    secondary_checks: [
      'ligamentum_flavum_hypertrophy',
      'facet_hypertrophy',
      'disc_bulge_contribution',
      'cord_signal_myelopathy',
      'cauda_equina_compression',
    ],
    impression_priority: ['cauda_equina_syndrome', 'cord_myelopathy', 'severe_central_stenosis'],
    recommendations: ['spine_surgery_referral_if_severe', 'clinical_correlation_neurological'],
  },

  subdural_hematoma: {
    mandatory: ['laterality', 'acute_vs_subacute_vs_chronic', 'maximum_thickness'],
    secondary_checks: [
      'midline_shift',
      'sulcal_effacement',
      'herniaton_signs',
      'bilateral',
      'mixed_density_rebleeding',
      'underlying_brain_contusion',
    ],
    impression_priority: ['transtentorial_herniation', 'large_SDH_midline_shift', 'bilateral_SDH'],
    recommendations: ['urgent_neurosurgery_referral_if_large_or_symptomatic'],
  },

  epidural_hematoma: {
    mandatory: ['laterality', 'biconvex_morphology', 'location', 'underlying_fracture'],
    secondary_checks: [
      'venous_vs_arterial',
      'temporal_bone_fracture',
      'midline_shift',
      'herniation',
      'mixed_density_active_bleed',
    ],
    impression_priority: ['herniation', 'large_EDH_with_midline_shift', 'EDH_with_fracture'],
    recommendations: ['urgent_neurosurgery_review'],
  },

  brain_tumor: {
    mandatory: ['location', 'size', 'morphology', 'enhancement_pattern'],
    secondary_checks: [
      'peritumoral_edema',
      'mass_effect',
      'midline_shift',
      'leptomeningeal_spread',
      'multifocal',
      'DWI_restriction',
      'perfusion_characteristics',
      'spectroscopy_if_performed',
    ],
    impression_priority: ['herniation', 'midline_shift', 'leptomeningeal_spread'],
    differential_logic: [
      'high_grade_glioma',
      'metastasis',
      'primary_CNS_lymphoma',
      'abscess',
      'demyelination_tumefactive',
    ],
    recommendations: ['neurosurgery_and_neuro-oncology_MDT'],
  },

  meningioma: {
    mandatory: ['location', 'size', 'dural_attachment', 'enhancement'],
    secondary_checks: [
      'dural_tail',
      'calcification',
      'hyperostosis',
      'peritumoral_edema',
      'venous_sinus_involvement',
      'en_plaque_morphology',
    ],
    impression_priority: ['sinus_invasion', 'venous_obstruction', 'mass_effect'],
    differential_logic: ['meningioma', 'dural_metastasis', 'hemangiopericytoma', 'sarcoidosis'],
    recommendations: ['neurosurgery_referral_for_symptomatic_or_large', 'surveillance_if_small_incidental'],
  },

  intracranial_hemorrhage: {
    mandatory: ['type', 'location', 'laterality', 'volume_estimate'],
    secondary_checks: [
      'intraventricular_extension',
      'hydrocephalus',
      'midline_shift',
      'herniation',
      'underlying_cause',
    ],
    impression_priority: [
      'herniation',
      'large_hemorrhage_with_midline_shift',
      'IVH_hydrocephalus',
    ],
    differential_logic: [
      'hypertensive_haemorrhage',
      'AVM_rupture',
      'amyloid_angiopathy',
      'haemorrhagic_metastasis',
      'coagulopathy',
    ],
    recommendations: ['emergency_neurosurgery_referral_if_large_or_deteriorating'],
  },

  hydrocephalus: {
    mandatory: ['type', 'ventricular_dimensions', 'obstructive_vs_communicating'],
    secondary_checks: [
      'periventricular_transependymal_oedema',
      'cause_of_obstruction',
      'shunt_function',
      'sulcal_effacement',
    ],
    impression_priority: ['obstructive_hydrocephalus_acute', 'aqueductal_stenosis', 'NPH_triad'],
    recommendations: ['neurosurgery_referral_if_obstructive_or_symptomatic'],
  },

  ms_plaque: {
    mandatory: ['Fazekas_grade', 'location', 'distribution', 'periventricular_vs_juxtacortical'],
    secondary_checks: [
      'active_enhancing_lesions',
      'Dawsons_fingers',
      'infratentorial_lesions',
      'spinal_cord_lesions',
      'atrophy',
    ],
    impression_priority: ['active_enhancing_lesion', 'Dawsons_fingers', 'McDonald_criteria_feasibility'],
    differential_logic: [
      'demyelination_MS',
      'NMO',
      'ADEM',
      'vasculitis',
      'microvascular_ischaemia',
    ],
    scoring: ['Fazekas_grade_mandatory'],
    recommendations: ['neurology_referral', 'CSF_oligoclonal_bands', 'VEP'],
  },

  adrenal_lesion: {
    mandatory: ['laterality', 'size', 'density_on_unenhanced_CT_if_available'],
    secondary_checks: [
      'HU_on_unenhanced_CT',
      'washout_percentage',
      'lipid_rich_vs_lipid_poor',
      'bilateral_involvement',
      'necrosis',
      'haemorrhage',
    ],
    scoring: ['adrenal_washout_protocol', 'HU_threshold_10HU_unenhanced'],
    impression_priority: ['pheochromocytoma', 'adrenocortical_carcinoma', 'metastasis'],
    differential_logic: [
      'adenoma_lipid_rich',
      'adenoma_lipid_poor',
      'myelolipoma',
      'phaeochromocytoma',
      'metastasis',
      'adrenocortical_carcinoma',
    ],
    recommendations: [
      'biochemical_screen_if_>4cm_or_imaging_indeterminate',
      'follow_up_at_6_and_12_months_if_indeterminate',
    ],
  },

  renal_cell_carcinoma: {
    mandatory: ['laterality', 'size', 'location_in_kidney', 'enhancement_pattern'],
    secondary_checks: [
      'Bosniak_if_cystic',
      'renal_vein_invasion',
      'IVC_thrombus',
      'perinephric_extension',
      'lymphadenopathy',
      'contralateral_kidney',
      'adrenal_involvement',
    ],
    scoring: ['Bosniak_classification_if_cystic_component'],
    impression_priority: ['IVC_thrombus', 'metastases', 'renal_vein_invasion'],
    recommendations: ['urology_MDT_referral', 'staging_CT_chest_abdomen_pelvis'],
  },
};

/* -------------------------------------------------------------------------- */
/*                        CLINICAL HINTS INTELLIGENCE                         */
/* -------------------------------------------------------------------------- */

export const CLINICAL_HINTS = [
  // ── NEURO ────────────────────────────────────────────────────────────────
  {
    keywords: ['white matter', 'flair', 't2 hyperintens', 'white matter lesion', 'wml'],
    hint: 'White matter hyperintensities detected. Fazekas grade is mandatory. In patients under 50, a differential diagnosis (microvascular ischaemia / demyelination / migraine) must appear in the Impression. Fazekas II/III under 45 → recommend neurology referral.',
  },
  {
    keywords: ['atrophy', 'cortical atrophy', 'cerebral atrophy', 'sulcal prominence'],
    hint: 'Cortical atrophy noted. GCA grade is mandatory. Assess age-appropriateness. If under 50 and atrophy is prominent, state explicitly and recommend neurology referral.',
  },
  {
    keywords: ['stroke', 'infarct', 'diffusion restriction', 'dwi', 'ischaemia'],
    hint: 'Possible acute ischaemia. Report territory, laterality, ASPECTS score for MCA territory. Check for haemorrhagic transformation, midline shift, and penumbra if MRI perfusion available.',
  },
  {
    keywords: ['subdural', 'sdh', 'epidural', 'edh', 'extradural'],
    hint: 'Intracranial haemorrhage. Measure thickness, document laterality, estimate volume, assess midline shift and herniation. For EDH, look for associated temporal bone fracture.',
  },
  {
    keywords: ['brain tumour', 'brain tumor', 'mass lesion brain', 'glioma', 'metastasis brain'],
    hint: 'Intracranial mass. Document size, location, enhancement pattern, peritumoral oedema, mass effect, midline shift, leptomeningeal spread. DWI and perfusion findings if available. Recommend neurosurgery/neuro-oncology MDT.',
  },
  {
    keywords: ['meningioma', 'dural based', 'dural tail', 'extra-axial'],
    hint: 'Possible meningioma. Document dural attachment, dural tail, calcification, hyperostosis, venous sinus involvement, peritumoral oedema. If < 3 cm and asymptomatic, surveillance imaging acceptable.',
  },
  {
    keywords: ['multiple sclerosis', 'ms', 'demyelination', 'dawsons fingers', 'periventricular plaques'],
    hint: 'Possible demyelinating disease. Fazekas grade mandatory. Document periventricular, juxtacortical, infratentorial lesions. Note enhancing lesions (active disease). Recommend neurology, CSF oligoclonal bands, VEP.',
  },
  {
    keywords: ['hydrocephalus', 'ventriculomegaly', 'shunt', 'aqueduct'],
    hint: 'Hydrocephalus pattern. Distinguish obstructive from communicating. Document ventricular dimensions, periventricular transependymal oedema. Assess shunt catheter position if present.',
  },

  // ── CHEST ────────────────────────────────────────────────────────────────
  {
    keywords: ['lung nodule', 'pulmonary nodule', 'nodule'],
    hint: 'Pulmonary nodule identified. Fleischner Society guidelines are mandatory. Document size, location, morphology, solid vs GGN vs part-solid. State patient risk profile and recommended follow-up interval.',
  },
  {
    keywords: ['pulmonary embolism', 'pe', 'ctpa', 'filling defect pulmonary', 'clot pulmonary'],
    hint: 'Possible PE on CTPA. Report clot level (main/lobar/segmental/subsegmental), laterality, clot burden. Assess right heart strain (RV:LV ratio, IV septal bowing). Note any pulmonary infarction.',
  },
  {
    keywords: ['pneumonia', 'consolidation', 'air bronchogram'],
    hint: 'Consolidative pattern. Specify lobe and segment. Look for cavitation, pleural effusion, multilobar involvement. Recommend follow-up CXR at 6 weeks to ensure resolution and exclude underlying malignancy.',
  },
  {
    keywords: ['pneumothorax'],
    hint: 'Pneumothorax identified. Specify laterality and size (small < 2 cm apex, large ≥ 2 cm). Assess for tension features (mediastinal shift, contralateral lung compression). Check for bilateral involvement.',
  },
  {
    keywords: ['pleural effusion', 'pleural fluid'],
    hint: 'Pleural effusion. Classify as small/moderate/large. Free vs. loculated. Assess for mediastinal shift, atelectasis, underlying parenchymal disease, empyema features.',
  },
  {
    keywords: ['aortic aneurysm', 'aaa', 'aortic dilatation'],
    hint: 'Aortic aneurysm. Measure maximum AP and transverse diameter. Note proximal extent (suprarenal/pararenal/infrarenal), iliac extension, mural thrombus, periaortic stranding (rupture risk). AAA ≥ 55 mm → vascular surgery referral.',
  },
  {
    keywords: ['aortic dissection', 'dissection', 'intimal flap'],
    hint: 'Suspected aortic dissection. Classify Stanford Type (A/B). Identify intimal flap extent, true vs. false lumen, branch vessel involvement, coronary ostia, haemopericardium. Type A is a surgical emergency.',
  },

  // ── ABDOMEN / PELVIS ─────────────────────────────────────────────────────
  {
    keywords: ['liver lesion', 'hepatic lesion', 'hepatic mass', 'liver mass'],
    hint: 'Hepatic lesion. In cirrhotic or HBV patients, LI-RADS category is mandatory. Describe segment, size, enhancement pattern (APHE, washout, capsule). If indeterminate, recommend MRI liver with hepatobiliary agent or triphasic CT.',
  },
  {
    keywords: ['appendicitis', 'appendix', 'right iliac fossa pain'],
    hint: 'Possible appendicitis. Measure appendiceal diameter and wall thickness. Document periappendiceal fat stranding, appendicolith, perforation, abscess, free fluid. If appendix not visualized, state this explicitly.',
  },
  {
    keywords: ['diverticulitis', 'diverticula', 'sigmoid', 'colonic diverticula'],
    hint: 'Possible diverticulitis. Document involved segment, fat stranding, abscess size and location, free perforation, pneumoperitoneum, fistula. Recommend colonoscopy 6–8 weeks post-resolution to exclude malignancy.',
  },
  {
    keywords: ['bowel obstruction', 'sbo', 'lbo', 'dilated bowel', 'transition point'],
    hint: 'Bowel obstruction. Identify level (small vs. large bowel), transition point, cause. Look for closed loop, strangulation signs (ischaemia, pneumatosis, portal venous gas), and free air.',
  },
  {
    keywords: ['pancreatitis', 'pancreatic', 'pancreas'],
    hint: 'Acute pancreatitis or pancreatic abnormality. Document peripancreatic fat stranding, necrosis extent (%), pseudocyst, WOPN, ductal dilatation. Apply modified CTSI (Balthazar grade + necrosis score). Assess for biliary cause.',
  },
  {
    keywords: ['cholecystitis', 'gallbladder', 'gallstone', 'cholelithiasis'],
    hint: 'Gallbladder pathology. Measure wall thickness, document pericholecystic fluid, Murphy sign if US. Look for emphysematous or gangrenous features. If calculi, assess for CBD stone and biliary dilatation.',
  },
  {
    keywords: ['renal calculus', 'kidney stone', 'ureteric calculus', 'ureteric stone'],
    hint: 'Renal or ureteric calculus. Document size, location (renal calyces, PUJ, proximal/mid/distal ureter, VUJ), density in HU, hydronephrosis, periureteric fat stranding, renal parenchymal oedema. Assess contralateral system.',
  },
  {
    keywords: ['adrenal', 'adrenal lesion', 'adrenal mass', 'adrenal adenoma', 'phaeochromocytoma'],
    hint: 'Adrenal lesion. Document size, laterality, unenhanced CT density (< 10 HU = lipid-rich adenoma). If > 10 HU, washout protocol is indicated. > 4 cm or indeterminate → biochemical screen. Recommend follow-up if indeterminate.',
  },
  {
    keywords: ['renal mass', 'renal cell carcinoma', 'rcc', 'renal cyst', 'bosniak'],
    hint: 'Renal lesion. For cystic lesions, Bosniak classification v2019 is mandatory. For solid lesions, document enhancement, perinephric extension, renal vein/IVC involvement, lymphadenopathy. Recommend urology referral.',
  },
  {
    keywords: ['ovarian cyst', 'ovarian mass', 'ovarian lesion', 'adnexal'],
    hint: 'Adnexal lesion. Document laterality, size, morphology (unilocular/multilocular, solid component, papillary projections, septations), vascularity. Apply IOTA simple rules. Free fluid in POD. Assess for torsion features.',
  },
  {
    keywords: ['fibroid', 'myoma', 'uterine fibroid', 'leiomyoma'],
    hint: 'Uterine fibroid(s). Document number, size of dominant fibroid, FIGO classification (submucosal/intramural/subserosal), degeneration type, endometrial distortion, ureteric compression. Map all significant fibroids.',
  },
  {
    keywords: ['ectopic pregnancy', 'ectopic', 'fallopian tube pregnancy'],
    hint: 'Suspected ectopic pregnancy. Document gestational sac location, adnexal ring sign, cardiac activity if seen, free fluid, haemoperitoneum. Confirm empty uterine cavity. Emergency gynaecology referral if suspected.',
  },

  // ── VASCULAR ─────────────────────────────────────────────────────────────
  {
    keywords: ['dvt', 'deep vein thrombosis', 'venous thrombosis', 'compressibility'],
    hint: 'Possible DVT. Assess compressibility, Doppler flow, augmentation. Document vein segment(s), extent (proximal vs. distal), laterality. Note collateral vessels. If proximal DVT, PE assessment may be warranted.',
  },
  {
    keywords: ['carotid', 'carotid stenosis', 'plaque', 'imt'],
    hint: 'Carotid Doppler. Document IMT bilaterally, plaque morphology, PSV/EDV at CCA/ICA/ECA. Calculate ICA/CCA ratio. Use NASCET criteria for stenosis grading. Document vertebral artery flow direction.',
  },

  // ── THYROID / BREAST ─────────────────────────────────────────────────────
  {
    keywords: ['thyroid nodule', 'thyroid lesion', 'thyroid mass'],
    hint: 'Thyroid nodule on ultrasound. ACR TI-RADS scoring is mandatory for each nodule. Document all five TI-RADS features (composition, echogenicity, shape, margin, echogenic foci), total score, and TI-RADS level. State FNA threshold based on TI-RADS and size.',
  },
  {
    keywords: ['breast lesion', 'breast mass', 'breast ultrasound', 'mammography', 'birads', 'bi-rads'],
    hint: 'Breast imaging. BI-RADS category is mandatory and must appear in the Impression. Document location by clock face and distance from nipple. For mammography, state breast density category. Axillary nodes assessment mandatory.',
  },

  // ── MSK ──────────────────────────────────────────────────────────────────
  {
    keywords: ['fracture', 'fractures', 'break', 'cortical breach'],
    hint: 'Fracture identified. Document bone, location, fracture pattern (transverse/oblique/spiral/comminuted), displacement, angulation, shortening, articular involvement. If pathological features, evaluate underlying bone lesion.',
  },
  {
    keywords: ['meniscus', 'meniscal', 'meniscal tear', 'knee mri'],
    hint: 'Knee MRI — meniscal assessment. Document medial and lateral menisci (anterior horn, body, posterior horn). Grade tear morphology. Assess ACL, PCL, collateral ligaments, cartilage (Outerbridge grade), patellofemoral compartment.',
  },
  {
    keywords: ['rotator cuff', 'supraspinatus', 'infraspinatus', 'shoulder mri'],
    hint: 'Shoulder MRI. Assess all four rotator cuff tendons. For tears, specify full vs. partial thickness, size, retraction, fatty atrophy (Goutallier grade). Biceps tendon at origin and groove. Labrum — SLAP and Bankart. Acromial morphology.',
  },
  {
    keywords: ['disc herniation', 'disc prolapse', 'disc extrusion', 'herniated disc'],
    hint: 'Disc herniation. Document level, type (bulge/protrusion/extrusion/sequestration), direction (central/paracentral/foraminal/far-lateral), AP canal dimension, foraminal compromise, cord/thecal sac contact or compression, cord signal change.',
  },
  {
    keywords: ['spinal stenosis', 'canal stenosis', 'central stenosis'],
    hint: 'Spinal stenosis. Quantify severity (mild/moderate/severe), AP canal dimension at narrowest level. Document contributors (disc, ligamentum flavum, facets). Note cauda equina compression or cord myelopathy signal change.',
  },
  {
    keywords: ['scoliosis', 'spinal curvature', 'lateral curvature'],
    hint: 'Scoliosis. Cobb angle measurement is mandatory. State curve direction (dextroscoliosis/levoscoliosis), apex level, and compensatory curves. Grade severity: mild < 20°, moderate 20–40°, severe > 40°.',
  },
  {
    keywords: ['osteoarthritis', 'degenerative joint', 'joint space narrowing', 'osteophytes'],
    hint: 'Osteoarthritic changes. Kellgren-Lawrence grade is mandatory. Document joint space narrowing, osteophytes, subchondral sclerosis, cyst formation. State severity per compartment (medial/lateral/patellofemoral).',
  },

  // ── NUCLEAR MEDICINE / PET-CT ─────────────────────────────────────────────
  {
    keywords: ['pet-ct', 'pet ct', 'fdg', 'suv', 'suvmax'],
    hint: 'PET-CT report. Document patient preparation (fasting time, blood glucose). Report FDG-avid lesions with location, SUVmax, and size. Nodal disease by station. Overall staging impression. Background organ uptake. Incidental CT findings.',
  },
  {
    keywords: ['bone scan', 'nuclear bone', 'technetium', 'hot spot bone'],
    hint: 'Bone scan. Document distribution of tracer uptake, focal areas of increased/decreased uptake with anatomical location. Compare with prior if available. Note physiological variants. Correlate with clinical sites of pain.',
  },
  {
    keywords: ['vq scan', 'v/q scan', 'ventilation perfusion', 'pioped'],
    hint: 'V/Q scan. Describe ventilation and perfusion images. Document matched vs. mismatched defects. Apply PIOPED II probability category (low/intermediate/high). Correlate with CXR.',
  },

  // ── DEXA ─────────────────────────────────────────────────────────────────
  {
    keywords: ['dexa', 'bone density', 'bone mineral density', 'bmd', 'osteoporosis', 'osteopenia'],
    hint: 'DEXA scan. Report T-scores and Z-scores for lumbar spine (L1-L4), femoral neck, and total hip bilaterally. State WHO diagnostic category. Osteoporosis (T ≤ −2.5) → recommend FRAX, calcium/vitamin D, and endocrinology referral.',
  },

  // ── MAMMOGRAPHY ──────────────────────────────────────────────────────────
  {
    keywords: ['mammogram', 'mammography', 'screening mammogram', 'tomosynthesis'],
    hint: 'Mammography report. State breast density category (ACR A/B/C/D). Describe any mass, asymmetry, calcification cluster, architectural distortion. BI-RADS category mandatory in Impression. Compare with prior mammogram if available.',
  },
];

/* -------------------------------------------------------------------------- */
/*                           REPORT QUALITY CONTROLS                          */
/* -------------------------------------------------------------------------- */

// Phrases that must never appear in a professional radiology report
const AI_PHRASES = [
  'there is seen',
  'is seen',
  'can be seen',
  'is visualized',
  'is demonstrated',
  'it is noted that',
  'appears to be',
  'kindly correlate',
  'please correlate clinically',
  'clinical correlation advised',
  'clinical correlation is advised',
  'clinical correlation is suggested',
  'as described above',
  'as mentioned above',
  'as mentioned in findings',
  'study is within normal limits',
  'no significant abnormality detected on this study',
  'within normal limits',
  'unremarkable study',
  'study is essentially normal',
  'no acute pathology is identified',
  'no obvious',
  'no definite',
  'no overt',
];

// UPGRADED — duplicate section detection added
const REPORT_COMPRESSION_RULES = {
  merge_normals: true,
  remove_irrelevant_negatives: true,
  prioritize_abnormalities: true,
  suppress_redundancy: true,
  detect_duplicate_sections: true,
  no_repeat_findings_in_output: true,
  single_findings_block_only: true,
};

const SAFETY_RULES = {
  no_fake_measurements: true,
  no_fake_laterality: true,
  no_invented_organs: true,
  no_unseen_findings: true,
  uncertainty_requires_limitation: true,
};

const RADIOLOGIST_PHRASES = {
  edema: [
    'mild surrounding vasogenic edema',
    'adjacent inflammatory stranding',
    'mild perifocal edema',
  ],
  enhancement: [
    'heterogeneous post-contrast enhancement',
    'peripheral nodular enhancement',
    'arterial phase hyperenhancement',
  ],
  chronicity: [
    'chronic encephalomalacic change',
    'fibrocalcific sequelae',
    'chronic post-inflammatory change',
  ],
};

/* -------------------------------------------------------------------------- */
/*                              UTILITY HELPERS                               */
/* -------------------------------------------------------------------------- */

function sanitizeReportText(text: string): string {
  if (!text) return text;
  let cleaned = text;

  for (const phrase of AI_PHRASES) {
    const regex = new RegExp(phrase, 'gi');
    cleaned = cleaned.replace(regex, '');
  }

  return cleaned
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/,\s*\./g, '.')
    .trim();
}

function detectDiseaseEntities(structuredData: StructuredData): string[] {
  const raw = JSON.stringify(structuredData).toLowerCase();
  const entities: string[] = [];

  if (raw.includes('stone') || raw.includes('calculus') || raw.includes('ureteric stone')) {
    entities.push('renal_calculus');
  }
  if (raw.includes('liver lesion') || raw.includes('hepatic lesion') || raw.includes('liver mass')) {
    entities.push('liver_lesion');
  }
  if (raw.includes('stroke') || raw.includes('infarct') || raw.includes('ischaemia')) {
    entities.push('stroke');
  }
  if (raw.includes('lung nodule') || raw.includes('pulmonary nodule')) {
    entities.push('lung_nodule');
  }
  if (
    raw.includes('white matter') ||
    raw.includes('flair') ||
    raw.includes('t2 hyperintensit') ||
    raw.includes('white matter lesion')
  ) {
    entities.push('white_matter_lesions');
  }
  if (raw.includes('pulmonary embolism') || raw.includes('ctpa') || raw.includes('filling defect') && raw.includes('pulmon')) {
    entities.push('pulmonary_embolism');
  }
  if (raw.includes('pneumonia') || raw.includes('consolidat') && raw.includes('air bronchogram')) {
    entities.push('pneumonia');
  }
  if (raw.includes('pneumothorax')) {
    entities.push('pneumothorax');
  }
  if (raw.includes('pleural effusion') || raw.includes('pleural fluid')) {
    entities.push('pleural_effusion');
  }
  if (raw.includes('aortic aneurysm') || raw.includes('aaa') || raw.includes('aortic dilatat')) {
    entities.push('aortic_aneurysm');
  }
  if (raw.includes('aortic dissection') || raw.includes('intimal flap') || raw.includes('true lumen') || raw.includes('false lumen')) {
    entities.push('aortic_dissection');
  }
  if (raw.includes('appendicitis') || raw.includes('appendix') && raw.includes('dilatat')) {
    entities.push('appendicitis');
  }
  if (raw.includes('diverticulitis') || raw.includes('diverticul') && raw.includes('stranding')) {
    entities.push('diverticulitis');
  }
  if (raw.includes('bowel obstruction') || raw.includes('dilated bowel') || raw.includes('transition point')) {
    entities.push('bowel_obstruction');
  }
  if (raw.includes('pancreatitis') || raw.includes('pancreatic necrosis') || raw.includes('peripancreatic')) {
    entities.push('pancreatitis');
  }
  if (raw.includes('cholecystitis') || raw.includes('gallbladder wall') && raw.includes('thick')) {
    entities.push('cholecystitis');
  }
  if (raw.includes('gallstone') || raw.includes('cholelithiasis') || raw.includes('calculus') && raw.includes('gallbladder')) {
    entities.push('gallstone');
  }
  if (raw.includes('ovarian cyst') || raw.includes('adnexal cyst') || raw.includes('ovarian mass')) {
    entities.push('ovarian_cyst');
  }
  if (raw.includes('fibroid') || raw.includes('myoma') || raw.includes('leiomyoma')) {
    entities.push('fibroid_uterus');
  }
  if (raw.includes('ectopic') || raw.includes('adnexal ring') || raw.includes('tubal pregnancy')) {
    entities.push('ectopic_pregnancy');
  }
  if (raw.includes('dvt') || raw.includes('deep vein thrombosis') || raw.includes('venous thrombosis')) {
    entities.push('dvt');
  }
  if (raw.includes('thyroid nodule') || raw.includes('ti-rads') || raw.includes('thyroid lesion')) {
    entities.push('thyroid_nodule');
  }
  if (raw.includes('breast lesion') || raw.includes('breast mass') || raw.includes('bi-rads') || raw.includes('birads')) {
    entities.push('breast_lesion');
  }
  if (raw.includes('fracture') || raw.includes('cortical breach') || raw.includes('bone break')) {
    entities.push('bone_fracture');
  }
  if (raw.includes('joint effusion') || raw.includes('effusion') && raw.includes('joint')) {
    entities.push('joint_effusion');
  }
  if (raw.includes('disc herniation') || raw.includes('disc prolapse') || raw.includes('disc extrusion')) {
    entities.push('disc_herniation');
  }
  if (raw.includes('spinal stenosis') || raw.includes('canal stenosis') || raw.includes('foraminal stenosis')) {
    entities.push('spinal_stenosis');
  }
  if (raw.includes('subdural') || raw.includes('sdh')) {
    entities.push('subdural_hematoma');
  }
  if (raw.includes('epidural haematoma') || raw.includes('epidural hematoma') || raw.includes('edh') || raw.includes('extradural')) {
    entities.push('epidural_hematoma');
  }
  if (raw.includes('brain tumour') || raw.includes('brain tumor') || raw.includes('glioma') || raw.includes('glioblastoma')) {
    entities.push('brain_tumor');
  }
  if (raw.includes('meningioma') || raw.includes('dural tail') || raw.includes('extra-axial mass')) {
    entities.push('meningioma');
  }
  if (
    raw.includes('intracranial hemorrhage') ||
    raw.includes('intracranial haemorrhage') ||
    raw.includes('ich') ||
    (raw.includes('haemorrhage') && raw.includes('brain'))
  ) {
    entities.push('intracranial_hemorrhage');
  }
  if (raw.includes('hydrocephalus') || raw.includes('ventriculomegaly') || raw.includes('ventricular dilatat')) {
    entities.push('hydrocephalus');
  }
  if (
    raw.includes('multiple sclerosis') ||
    raw.includes('demyelinat') ||
    raw.includes('ms plaque') ||
    raw.includes('dawsons fingers') ||
    raw.includes("dawson's fingers")
  ) {
    entities.push('ms_plaque');
  }
  if (raw.includes('adrenal') && (raw.includes('lesion') || raw.includes('mass') || raw.includes('adenoma') || raw.includes('phaeochromocytoma'))) {
    entities.push('adrenal_lesion');
  }
  if (raw.includes('renal cell carcinoma') || raw.includes('rcc') || (raw.includes('renal mass') && raw.includes('enhanc'))) {
    entities.push('renal_cell_carcinoma');
  }

  return entities;
}

function buildDiseaseContext(structuredData: StructuredData) {
  const entities = detectDiseaseEntities(structuredData);
  return entities.map((entity) => ({
    disease: entity,
    profile: DISEASE_PROFILES[entity as keyof typeof DISEASE_PROFILES],
  }));
}

// Organ-specific laterality pair matching
function extractLateralityPairs(text: string) {
  const organs = [
    'kidney', 'lung', 'lobe', 'ovary', 'adrenal',
    'pleural', 'pneumothorax', 'effusion', 'fracture',
    'testis', 'thyroid lobe', 'carotid', 'femoral vein', 'iliac',
  ];
  const pairs: { organ: string; side: string }[] = [];
  const lower = text.toLowerCase();
  organs.forEach((organ) => {
    const li = lower.indexOf('left ' + organ);
    const ri = lower.indexOf('right ' + organ);
    if (li !== -1) pairs.push({ organ, side: 'left' });
    if (ri !== -1) pairs.push({ organ, side: 'right' });
  });
  return pairs;
}

function validateReportConsistency(report: {
  findings?: string;
  impression?: string;
  full_report?: string;
  scan_type?: string;
}) {
  const errors: string[] = [];

  const findings = report.findings?.toLowerCase() || '';
  const impression = report.impression?.toLowerCase() || '';
  const scanType = (report.scan_type || report.full_report || '').toLowerCase();

  // Organ-specific laterality pair matching
  const fPairs = extractLateralityPairs(findings);
  const iPairs = extractLateralityPairs(impression);
  fPairs.forEach((fp) => {
    const conflict = iPairs.find(
      (ip) => ip.organ === fp.organ && ip.side !== fp.side
    );
    if (conflict) {
      errors.push(
        `Laterality mismatch: ${fp.organ} is ${fp.side} in findings but ${conflict.side} in impression`
      );
    }
  });

  // Modality-specific terminology validation
  const isMRI = scanType.includes('mri');
  const isCT = scanType.includes('ct');
  const isUS = scanType.includes('ultrasound') || scanType.includes('us ') || scanType.includes('doppler');
  const isNM = scanType.includes('nuclear') || scanType.includes('pet') || scanType.includes('spect') || scanType.includes('scintigraphy');
  const isXray = scanType.includes('x-ray') || scanType.includes('xray') || scanType.includes('radiograph');
  const isMammo = scanType.includes('mammograph') || scanType.includes('mammogram');

  if (isMRI) {
    const ctTerms = ['hounsfield', 'hypodense', 'hyperdense', 'isodense', 'hu', 'attenuation'];
    ctTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`MRI report contains CT-specific terminology: "${term}"`);
      }
    });
    const usTerms = ['echogenic', 'hypoechoic', 'hyperechoic', 'echotexture', 'doppler flow'];
    usTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`MRI report contains ultrasound-specific terminology: "${term}"`);
      }
    });
  }

  if (isCT) {
    const mriTerms = ['signal intensity', 'flair', 't1', 't2', 'dwi', 'adc', 'hyperintense', 'hypointense'];
    mriTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`CT report contains MRI-specific terminology: "${term}"`);
      }
    });
    const usTerms = ['echogenic', 'hypoechoic', 'hyperechoic', 'echotexture'];
    usTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`CT report contains ultrasound-specific terminology: "${term}"`);
      }
    });
  }

  if (isUS) {
    const ctTerms = ['hounsfield', 'hu', 'hypodense', 'hyperdense', 'attenuation'];
    ctTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`Ultrasound report contains CT-specific terminology: "${term}"`);
      }
    });
    const mriTerms = ['signal intensity', 'flair', 't1', 't2', 'dwi', 'adc'];
    mriTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`Ultrasound report contains MRI-specific terminology: "${term}"`);
      }
    });
  }

  if (isXray) {
    const mriTerms = ['signal intensity', 'flair', 't1', 't2', 'dwi', 'hyperintense', 'hypointense'];
    mriTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`X-Ray report contains MRI-specific terminology: "${term}"`);
      }
    });
    const usTerms = ['echogenic', 'hypoechoic', 'echotexture', 'doppler'];
    usTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`X-Ray report contains ultrasound-specific terminology: "${term}"`);
      }
    });
  }

  if (isNM) {
    const ctTerms = ['hypodense', 'hyperdense', 'hounsfield'];
    ctTerms.forEach((term) => {
      if (findings.includes(term)) {
        errors.push(`Nuclear medicine report contains CT density terminology: "${term}"`);
      }
    });
  }

  if (isMammo) {
    const hasImpressionBI = impression.includes('bi-rads') || impression.includes('birads');
    const hasFindingsBI = findings.includes('bi-rads') || findings.includes('birads');
    if (!hasImpressionBI && !hasFindingsBI) {
      errors.push('Mammography report is missing mandatory BI-RADS category in Impression');
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

function buildIntelligenceConfig(
  structuredData: StructuredData,
  scanType: string,
  learningContext = ''
) {
  return {
    mode: 'senior_radiologist',

    system_prompt: RADIOLOGY_SYSTEM_PROMPT,

    scan_type: scanType,

    learning_context: learningContext,

    disease_context: buildDiseaseContext(structuredData),

    clinical_hints: CLINICAL_HINTS,

    compression_rules: REPORT_COMPRESSION_RULES,

    safety_rules: SAFETY_RULES,

    language_rules: {
      detailed: true,
      professional_senior_radiologist: true,
      non_robotic: true,
      prioritize_abnormalities: true,
      avoid_template_dumping: true,
      remove_redundant_negatives: true,
      no_ai_filler_phrases: true,
      impression_always_last: true,
      impression_numbered: true,
      banned_phrases: AI_PHRASES,
    },

    validators: {
      contradiction_detection: true,
      measurement_validation: true,
      modality_validation: true,
      organ_validation: true,
      laterality_validation: true,
      impression_consistency: true,
      impossible_finding_detection: true,
      modality_header_consistency: true,
      scoring_system_enforcement: true,
      mammography_birads_mandatory: true,
      thyroid_tirads_mandatory: true,
      liver_lirads_if_cirrhotic: true,
      prostate_pirads_mandatory: true,
      renal_bosniak_if_complex: true,
      pulmonary_nodule_fleischner_mandatory: true,
      fazekas_grade_if_wmh: true,
      gca_grade_if_atrophy: true,
      aspects_score_if_mca_infarct: true,
    },

    differential_engine: {
      ranked: true,
      confidence_based: true,
      clinically_realistic: true,
    },

    impression_rules: {
      always_last_section: true,
      always_numbered_list: true,
      prioritize_actionable_findings: true,
      suppress_trivial_negatives: true,
      concise_impression: true,
      no_repetition_of_full_findings: true,
      max_points: 6,
    },

    phrase_library: RADIOLOGIST_PHRASES,
  };
}

/* -------------------------------------------------------------------------- */
/*                         MODALITY CHECKLIST ENGINE                          */
/* -------------------------------------------------------------------------- */

const MODALITY_CHECKLISTS: Record<string, string[]> = {
  'ct chest': [
    'Lungs — upper, middle, lower zones bilaterally',
    'Airways — trachea, main bronchi, lobar bronchi',
    'Pleura — pneumothorax, effusion, thickening, calcification',
    'Mediastinum — superior, anterior, middle, posterior compartments',
    'Hila — bilateral, symmetry, lymph nodes',
    'Cardiac silhouette — size, pericardium',
    'Aorta — calibre, contour',
    'Chest wall — ribs, sternum, clavicles, soft tissues',
    'Diaphragm — domes, subphrenic spaces',
    'Visualized upper abdomen — liver, spleen, adrenals, upper kidneys',
    'Axillary regions — lymph nodes',
    'Pulmonary nodules — Fleischner criteria if present',
  ],
  'ct abdomen pelvis': [
    'Liver — size, morphology, all segments, focal lesions (LI-RADS if cirrhotic)',
    'Gallbladder — wall, calculi, pericholecystic fluid',
    'Biliary tree — CBD diameter, intrahepatic ducts',
    'Pancreas — head, neck, body, tail; duct calibre; peripancreatic fat',
    'Spleen — size, echogenicity, focal lesions',
    'Adrenal glands — bilateral; size; HU if unenhanced available',
    'Kidneys — bilateral; cortical thickness; hydronephrosis; focal lesions (Bosniak if cystic)',
    'Ureters — course, calculi, dilatation',
    'Urinary bladder — wall, contents',
    'Bowel — small bowel, colon; obstruction; wall thickening',
    'Appendix — visualisation, diameter',
    'Mesentery and retroperitoneum — lymph nodes, free fluid',
    'Abdominal aorta and iliac arteries — calibre, aneurysm',
    'Pelvic organs — uterus/ovaries or prostate/seminal vesicles as appropriate',
    'Free intraperitoneal fluid',
    'Visualized lung bases',
    'Bones and soft tissues',
  ],
  'ct head': [
    'Brain parenchyma — cortex, white matter, basal ganglia, thalami',
    'Brainstem — midbrain, pons, medulla',
    'Cerebellum — hemispheres, vermis',
    'Ventricles — size, morphology, symmetry',
    'Extra-axial spaces — subdural, epidural, subarachnoid',
    'Midline structures — no shift',
    'No acute haemorrhage',
    'No mass effect',
    'Skull base — no fracture',
    'Calvarium — integrity',
    'Paranasal sinuses — mucosal disease',
    'Orbits — if included',
    'Mastoid air cells',
  ],
  'ct spine': [
    'Vertebral alignment — lordosis/kyphosis/scoliosis (Cobb angle if scoliosis)',
    'Vertebral body heights and morphology per level',
    'End plates — Modic changes if present',
    'Intervertebral disc spaces',
    'Pedicles — integrity',
    'Posterior elements — laminae, spinous processes, facet joints',
    'Spinal canal dimensions — AP diameter',
    'Foraminal patency bilaterally',
    'Paraspinal soft tissues',
    'Visualized solid organs at each level',
  ],
  'mri brain': [
    'Cortex — gyral pattern, signal, GCA grade if atrophy present',
    'White matter — T2/FLAIR signal; Fazekas grade if WMH present; diffusion restriction',
    'Basal ganglia — signal bilaterally',
    'Thalami — signal bilaterally',
    'Brainstem — midbrain, pons, medulla',
    'Cerebellum — hemispheres, vermis',
    'Corpus callosum',
    'Internal capsules',
    'Ventricles — size and morphology',
    'Extra-axial spaces — subdural, subarachnoid, cisterns',
    'Midline — no shift',
    'DWI/ADC — diffusion restriction',
    'Post-contrast enhancement pattern if contrast given',
    'SWI/GRE — haemosiderin, microbleeds',
    'Skull base, calvarium',
    'Paranasal sinuses, mastoid air cells',
    'Orbits, pituitary if included',
  ],
  'mri lumbar spine': [
    'Vertebral alignment and lumbar lordosis',
    'Vertebral body signal and heights (L1 to sacrum)',
    'End plates — Modic type if changes present',
    'Disc signal and height per level (L1/2 to L5/S1)',
    'Disc morphology per level — bulge, protrusion, extrusion, sequestration',
    'Central canal AP dimension per level',
    'Bilateral foraminal dimensions per level',
    'Facet joints — arthropathy',
    'Posterior elements',
    'Conus medullaris — level and signal',
    'Cauda equina — nerve root compression',
    'Paraspinal soft tissues',
    'Sacroiliac joints',
  ],
  'mri cervical spine': [
    'Cervical alignment and lordosis',
    'Vertebral body signal (C2 to T1)',
    'Disc signal and height per level (C2/3 to C7/T1)',
    'Disc herniation per level',
    'Spinal canal AP dimension — cord compression',
    'Cord signal — T2 myelopathy signal',
    'Bilateral foraminal dimensions per level',
    'Facet and uncovertebral joints',
    'Posterior elements',
    'Paraspinal soft tissues',
    'Craniocervical junction',
  ],
  'mri knee': [
    'Medial meniscus — anterior horn, body, posterior horn; tear type and grade',
    'Lateral meniscus — anterior horn, body, posterior horn; tear type and grade',
    'ACL — signal and continuity',
    'PCL — signal and continuity',
    'MCL — signal and continuity',
    'LCL complex — signal',
    'Patellar tendon — integrity',
    'Quadriceps tendon — integrity',
    'Articular cartilage — Outerbridge grade if chondral loss (medial/lateral/patellofemoral)',
    'Subchondral bone — oedema, cysts, fractures',
    'Joint effusion — size and characteristics',
    'Hoffa fat pad — oedema, impingement',
    'Baker cyst if present',
    'Bone marrow signal bilaterally',
  ],
  'mri shoulder': [
    'Supraspinatus — integrity; tear size and retraction if present; fatty atrophy (Goutallier)',
    'Infraspinatus — integrity',
    'Teres minor — integrity',
    'Subscapularis — integrity',
    'Biceps tendon long head — at SGHL anchor and intertubercular groove',
    'Labrum — anterior, posterior, superior (SLAP classification)',
    'Glenohumeral joint space and articular cartilage',
    'AC joint — arthropathy, osteophytes, effusion',
    'Acromial morphology — type I/II/III; os acromiale',
    'Subacromial-subdeltoid bursa — effusion, thickening',
    'Coracohumeral ligament',
    'Hill-Sachs and Bony Bankart if prior dislocation',
    'Axillary nerve region',
    'Bone marrow signal — humeral head AVN',
  ],
  'mri prostate': [
    'Prostate gland — overall size and volume',
    'Peripheral zone — T2 signal; DWI/ADC; lesions with PI-RADS v2.1 score',
    'Transition zone — T2 morphology; BPH nodules; lesions with PI-RADS score',
    'Central zone',
    'Seminal vesicles — bilateral; signal; invasion',
    'Neurovascular bundles — bilateral',
    'Extraprostatic extension — capsular bulge',
    'Bladder base',
    'Lymph nodes — pelvis and lower retroperitoneum',
    'Pelvic bones — signal',
  ],
  'ultrasound abdomen': [
    'Liver — size, echogenicity, surface, focal lesions',
    'Gallbladder — wall thickness, calculi, polyps, pericholecystic fluid, Murphy sign',
    'Common bile duct — diameter',
    'Pancreas — echogenicity, duct calibre',
    'Spleen — size, echogenicity',
    'Right kidney — size, cortical thickness, echogenicity, calculi, hydronephrosis, focal lesions',
    'Left kidney — size, cortical thickness, echogenicity, calculi, hydronephrosis',
    'Aorta — diameter if visualised',
    'Free fluid — peritoneal cavity',
    'Lymph nodes — para-aortic, porta hepatis',
  ],
  'ultrasound thyroid': [
    'Right lobe — size (AP × transverse × CC in cm)',
    'Left lobe — size (AP × transverse × CC in cm)',
    'Isthmus — AP dimension',
    'Overall echogenicity and echotexture',
    'Focal nodules — each with ACR TI-RADS scoring (composition, echogenicity, shape, margin, echogenic foci, total points, TI-RADS level)',
    'Vascularity — colour Doppler (normal/increased)',
    'Cervical lymph nodes — levels II–VI bilaterally',
    'Parathyroid region',
  ],
  'ultrasound pelvis female': [
    'Uterus — position, size, myometrium, endometrial thickness and echo pattern',
    'Cervix — length, internal os',
    'Right ovary — size, follicular count, dominant follicle, lesions',
    'Left ovary — size, follicular count, lesions',
    'Free fluid — POD and adnexal',
    'Fibroid mapping if present (FIGO classification)',
    'Tubo-ovarian pathology',
  ],
  'ultrasound breast': [
    'Background parenchymal pattern',
    'Any focal lesion — clock face location, distance from nipple, size in 3 planes',
    'Lesion morphology — shape, orientation, margins, echo pattern, posterior features',
    'Vascularity on Doppler',
    'Skin and nipple-areolar complex',
    'Axillary lymph nodes — bilateral',
    'BI-RADS category — mandatory in Impression',
  ],
  'mammogram': [
    'Breast density — ACR category A/B/C/D',
    'Masses — shape, margin, density; BI-RADS description',
    'Calcifications — morphology (amorphous/pleomorphic/fine linear), distribution',
    'Architectural distortion',
    'Asymmetry — global, focal, developing',
    'Skin and nipple changes',
    'Axillary lymph nodes',
    'Comparison with prior mammogram',
    'BI-RADS category — mandatory in Impression',
  ],
  'pet ct': [
    'Patient preparation — fasting duration, blood glucose level',
    'FDG-avid lesions — site, SUVmax, size',
    'Nodal disease — station by station, SUVmax',
    'Distant metastases — organ, SUVmax',
    'Background organ uptake — brain, liver, blood pool',
    'Incidental CT findings',
    'Overall staging impression — TNM if requested',
  ],
  'dexa': [
    'Lumbar spine L1-L4 — BMD, T-score, Z-score',
    'Right femoral neck — BMD, T-score, Z-score',
    'Right total hip — BMD, T-score, Z-score',
    'Left femoral neck — BMD, T-score, Z-score',
    'Left total hip — BMD, T-score, Z-score',
    'WHO diagnostic category — normal / osteopenia / osteoporosis',
    'Vertebral fracture assessment if performed',
    'FRAX recommendation if osteoporosis',
  ],
  'xray chest': [
    'Lung zones — upper, middle, lower bilaterally; consolidation, nodule, hyperinflation',
    'Hila — size, position, symmetry',
    'Trachea — midline, deviation',
    'Cardiac silhouette — CTR, borders, configuration',
    'Mediastinal contours — superior mediastinum, aortic knuckle',
    'Costophrenic angles — blunting',
    'Diaphragm — domes, free subdiaphragmatic air',
    'Ribs and bones — fractures, lesions',
    'Soft tissues — neck, axillae',
    'Tubes, lines, devices if present',
  ],
  'xray spine': [
    'Vertebral alignment — scoliosis (Cobb angle mandatory if present), lordosis/kyphosis',
    'Vertebral body heights and morphology',
    'Intervertebral disc spaces',
    'End plates',
    'Pedicles',
    'Posterior elements and facet joints',
    'Paraspinal soft tissues',
    'Sacroiliac joints (if lumbosacral)',
    'Osteoarthritic changes — Kellgren-Lawrence grade mandatory',
  ],
};

/* -------------------------------------------------------------------------- */
/*                               CORE COPILOT                                 */
/* -------------------------------------------------------------------------- */

async function callCopilot(
  operation: string,
  payload: Record<string, unknown>
) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token =
      session?.access_token ??
      import.meta.env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(EDGE_FN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      },
      body: JSON.stringify({
        operation,
        payload,
      }),
    });

    const text = await res.text();

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid response from AI service: ${text.slice(0, 200)}`
      );
    }

    if (!res.ok) {
      throw new Error(
        `AI service error (${res.status}): ${
          json.error || text.slice(0, 200)
        }`
      );
    }

    if (!json.success) {
      throw new Error(json.error ?? 'AI operation failed');
    }

    return json.data;
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Unknown error';

    console.error(`[AI] ${operation} failed:`, msg);

    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   EXTRACT                                  */
/* -------------------------------------------------------------------------- */

export async function extractStructuredData(
  inputText: string,
  scanType: string,
  learningContext = ''
): Promise<StructuredData> {
  return callCopilot('extract', {
    input_text: inputText,
    scan_type: scanType,
    learning_context: learningContext,

    intelligence_config: {
      mode: 'senior_radiologist',
      extract_measurements: true,
      extract_laterality: true,
      extract_disease_entities: true,
      extract_secondary_signs: true,
      preserve_uncertainty: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                              REPORT GENERATION                             */
/* -------------------------------------------------------------------------- */

export async function generateReport(
  structuredData: StructuredData,
  scanType: string,
  template: string | null = null,
  learningContext = ''
): Promise<{
  technique: string;
  findings: string;
  impression: string;
  full_report: string;
  negatives_removed?: string[];
}> {
  const intelligenceConfig = buildIntelligenceConfig(
    structuredData,
    scanType,
    learningContext
  );

  const result = await callCopilot('generate', {
    structured_data: structuredData,
    scan_type: scanType,
    template,
    learning_context: learningContext,
    intelligence_config: intelligenceConfig,
  });

  result.findings = sanitizeReportText(result.findings);
  result.impression = sanitizeReportText(result.impression);
  result.full_report = sanitizeReportText(result.full_report);

  const validation = validateReportConsistency({
    ...result,
    scan_type: scanType,
  });

  if (!validation.passed) {
    console.error('Radiology validation failed:', validation.errors);
  }

  return {
    ...result,
    validation_errors: validation.errors,
  };
}

/* -------------------------------------------------------------------------- */
/*                             SUGGEST IMPROVEMENTS                           */
/* -------------------------------------------------------------------------- */

export async function suggestImprovements(
  reportText: string,
  structuredData: StructuredData
): Promise<Suggestion[]> {
  return callCopilot('suggest', {
    report_text: reportText,
    structured_data: structuredData,

    intelligence_config: {
      senior_review_mode: true,
      detect_verbosity: true,
      detect_missing_measurements: true,
      detect_missing_secondary_signs: true,
      detect_weak_impression: true,
      detect_redundant_negatives: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                             DIFFERENTIAL ENGINE                            */
/* -------------------------------------------------------------------------- */

export async function generateDifferential(
  findings: string,
  bodyPart: string,
  modality: string
): Promise<Differential[]> {
  return callCopilot('differential', {
    findings,
    body_part: bodyPart,
    modality,

    intelligence_config: {
      ranked_differentials: true,
      confidence_scoring: true,
      imaging_pattern_analysis: true,
      disease_probability_modeling: true,
      clinically_realistic_only: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                                ERROR CHECKER                               */
/* -------------------------------------------------------------------------- */

export async function detectErrors(
  reportText: string,
  structuredData: StructuredData
): Promise<ReportError[]> {
  return callCopilot('detect_errors', {
    report_text: reportText,
    structured_data: structuredData,

    intelligence_config: {
      contradiction_detection: true,
      laterality_validation: true,
      measurement_validation: true,
      modality_validation: true,
      impossible_finding_detection: true,
      impression_consistency_check: true,
      medico_legal_safety_review: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                             FOLLOW-UP QUESTIONS                            */
/* -------------------------------------------------------------------------- */

export async function getFollowUpQuestions(
  reportText: string,
  structuredData: StructuredData
): Promise<string[]> {
  return callCopilot('follow_up', {
    report_text: reportText,
    structured_data: structuredData,

    intelligence_config: {
      senior_teaching_mode: true,
      clinically_relevant_questions_only: true,
      avoid_generic_questions: true,
      prioritize_missing_critical_features: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                            DISEASE FORMAT ENGINE                           */
/* -------------------------------------------------------------------------- */

export async function generateDiseaseFormat(
  diseaseName: string,
  modality: string = '',
  bodyPart: string = ''
): Promise<{
  disease: string;
  modality: string;
  report: {
    technique: string;
    findings: string;
    impression: string;
  };
  key_measurements: string[];
  critical_findings_to_check: string[];
  common_negative_contradictions: string[];
  related_conditions: string[];
}> {
  return callCopilot('disease_format', {
    disease_name: diseaseName,
    modality,
    body_part: bodyPart,

    intelligence_config: {
      system_prompt: RADIOLOGY_SYSTEM_PROMPT,
      disease_specific_reporting: true,
      mandatory_feature_enforcement: true,
      complication_detection: true,
      clinically_relevant_negatives_only: true,
      impression_always_last: true,
      impression_numbered: true,
      professional_senior_radiologist_output: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          SPELLING + NEGATIVE FIXER                         */
/* -------------------------------------------------------------------------- */

export async function fixSpellingAndNegatives(
  reportText: string
): Promise<{
  corrected_report: string;
  spelling_fixes: Array<{
    original: string;
    corrected: string;
  }>;
  negatives_removed: Array<{
    removed_text: string;
    reason: string;
  }>;
  grammar_fixes: Array<{
    original: string;
    corrected: string;
  }>;
  total_changes: number;
}> {
  return callCopilot('fix_spelling_negatives', {
    report_text: reportText,

    intelligence_config: {
      remove_template_negatives: true,
      preserve_clinically_important_negatives: true,
      senior_radiologist_language_cleanup: true,
      compress_redundant_text: true,
      remove_ai_phrasing: true,
      banned_phrases: AI_PHRASES,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                               FULL PIPELINE                                */
/* -------------------------------------------------------------------------- */

export async function runFullPipeline(
  inputText: string,
  scanType: string,
  template: string | null = null,
  learningContext = ''
): Promise<{
  structured: StructuredData;
  report: {
    technique: string;
    findings: string;
    impression: string;
    full_report: string;
    negatives_removed?: string[];
  };
  suggestions: Suggestion[];
  errors: ReportError[];
  questions: string[];
}> {
  return callCopilot('full_pipeline', {
    input_text: inputText,
    scan_type: scanType,
    template,
    learning_context: learningContext,

    intelligence_config: {
      mode: 'senior_radiologist_pipeline',

      system_prompt: RADIOLOGY_SYSTEM_PROMPT,

      pipeline: {
        normalize_anatomy: true,
        detect_disease_entities: true,
        enrich_disease_profiles: true,
        validate_measurements: true,
        validate_modality: true,
        validate_laterality: true,
        compress_report: true,
        generate_professional_impression: true,
        generate_ranked_differentials: true,
        generate_teaching_questions: true,
        medico_legal_review: true,
      },

      // Reporting style is always professional-detailed — no user selector
      reporting_style: {
        detailed: true,
        professional_senior_radiologist: true,
        non_robotic: true,
        clinically_prioritized: true,
        impression_always_last: true,
        impression_always_numbered: true,
        impression_max_points: 6,
        remove_irrelevant_negatives: true,
        no_ai_filler_phrases: true,
        no_template_dumping: true,
        compress_normals_into_grouped_statements: true,
        anatomically_organized_findings: true,
        abnormalities_before_normals: true,
      },

      safety: {
        no_hallucinations: true,
        no_fake_measurements: true,
        no_fake_laterality: true,
        no_fake_diagnoses: true,
        no_invented_findings: true,
        contradiction_detection: true,
        modality_terminology_enforcement: true,
      },

      output_format: {
        sections_order: ['technique', 'findings', 'impression'],
        impression_format: 'numbered_list',
        findings_format: 'anatomical_systems',
        professional_prose: true,
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                       MODALITY-SPECIFIC CHECKLIST                          */
/* -------------------------------------------------------------------------- */

export async function generateModalitySpecificChecklist(
  scanType: string
): Promise<string[]> {
  // Normalise to lowercase for key matching
  const key = scanType.toLowerCase().trim();

  // Direct key lookup first
  if (MODALITY_CHECKLISTS[key]) {
    return MODALITY_CHECKLISTS[key];
  }

  // Fuzzy match against known checklist keys
  for (const [checklistKey, items] of Object.entries(MODALITY_CHECKLISTS)) {
    if (
      key.includes(checklistKey) ||
      checklistKey.includes(key) ||
      key.split(' ').every((word) => checklistKey.includes(word))
    ) {
      return items;
    }
  }

  // Fallback: ask the AI for a checklist for uncommon scan types
  return callCopilot('modality_checklist', {
    scan_type: scanType,

    intelligence_config: {
      system_prompt: RADIOLOGY_SYSTEM_PROMPT,
      mode: 'senior_radiologist',
      generate_mandatory_documentation_items: true,
      include_scoring_systems: true,
      include_critical_negatives: true,
      format: 'string_array',
      max_items: 20,
    },
  });
}