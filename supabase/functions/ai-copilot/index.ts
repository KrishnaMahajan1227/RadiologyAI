import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── Gemini model config ──────────────────────────────────────────────────────
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─── callGemini — properly uses systemInstruction ────────────────────────────
// BUG FIX 1: Old version merged system+user into one text block.
//            Now we use Gemini's native systemInstruction field.
// BUG FIX 2: Old callGemini had wrong parameter order (model slipped in as jsonMode).
// BUG FIX 3: temperature raised to 0.45 — less robotic output.
// BUG FIX 4: maxOutputTokens raised to 16384 for report generation (was 8192).

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false,
  maxTokens = 8192
): Promise<string> {
  const response = await fetch(
    `${GEMINI_API_URL}?key=${Deno.env.get("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: maxTokens,
          responseMimeType: jsonMode ? "application/json" : "text/plain",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── extractStructuredData ────────────────────────────────────────────────────
async function extractStructuredData(
  inputText: string,
  scanType: string,
  learningContext: string
): Promise<object> {
  const systemPrompt = `You are a radiology AI assistant. Extract structured clinical data from radiology dictation/notes.
Return a JSON object with these fields:
{
  "modality": "CT|MRI|X-Ray|Ultrasound|PET|Nuclear Medicine|Fluoroscopy|Mammography",
  "body_part": "anatomical region",
  "clinical_indication": "reason for study",
  "technique": "imaging technique details",
  "key_findings": ["array of key finding strings"],
  "measurements": [{"structure": "name", "value": "measurement", "unit": "mm|cm"}],
  "comparison": "prior study if mentioned",
  "incidental_findings": ["array of incidental findings"],
  "critical_findings": ["any urgent/critical findings"],
  "laterality": "left|right|bilateral|midline|N/A",
  "contrast": "with contrast|without contrast|with and without contrast|N/A",
  "scan_quality": "diagnostic|limited|non-diagnostic",
  "diseases_detected": ["list of specific diseases/conditions mentioned or implied"]
}
${learningContext ? `User preference context: ${learningContext}` : ""}
Return only valid JSON.`;

  const userPrompt = `Scan type: ${scanType || "Unknown"}\n\nDictation/Notes:\n${inputText}`;

  const raw = await callGemini(systemPrompt, userPrompt, true);
  try {
    return JSON.parse(raw);
  } catch {
    return { raw_input: inputText };
  }
}

// ─── generateReport ───────────────────────────────────────────────────────────
// BUG FIX 5: maxTokens now 16384 for report generation — prevents truncated reports.
// BUG FIX 6: System prompt restructured — Gemini now gets proper role context.
// BUG FIX 7: full_report always built from sections with proper markdown.

async function generateReport(
  structuredData: object,
  scanType: string,
  template: string | null,
  inputText: string,
  learningContext: string
): Promise<object> {
  let templateInstructions =
    "Use standard radiology report format with Technique, Clinical Information, Findings, and Impression sections.";
  let sectionList = ["Technique", "Clinical Information", "Findings", "Impression"];

  if (template) {
    try {
      const sections = JSON.parse(template);
      sectionList = sections.map((s: { label: string }) => s.label);
      const sectionDetails = sections
        .map(
          (s: {
            label: string;
            placeholder: string;
            required: boolean;
            type: string;
            options?: string[];
          }) => {
            let desc = `- ${s.label}${s.required ? " (REQUIRED)" : " (optional)"}: ${
              s.placeholder || "Fill in appropriate content"
            }`;
            if (s.options?.length) desc += `. Options: ${s.options.join(", ")}`;
            return desc;
          }
        )
        .join("\n");

      templateInstructions = `A TEMPLATE has been selected by the radiologist. You MUST generate content for EACH section in this template.

Template sections (in order): ${sectionList.join(", ")}

Section details:
${sectionDetails}

CRITICAL TEMPLATE RULES:
1. Return a JSON object with a key for EVERY template section label (exact match, case-sensitive)
2. Fill EACH section with clinically appropriate content based on the dictation
3. If the dictation mentions specific findings, put them in the CORRECT template section
4. If a section has no relevant findings, write a brief normal statement
5. Do NOT leave any required section empty
6. The dictation is the PRIMARY source of clinical information — the template is the STRUCTURE
7. Write like a real consultant radiologist — concise, precise, professional
8. When dictation says something is normal, write it as a normal statement
9. When dictation describes a finding, write it clearly with measurements if provided
10. Do NOT include contradictory statements`;
    } catch {
      // Template parse failed — use default
    }
  }

  const isTemplateMode = template !== null;
  const responseFormat = isTemplateMode
    ? `Return JSON with a key for EACH template section (exact labels: ${sectionList.join(", ")}), plus:
{
  ${sectionList.map((s) => `"${s}": "content for this section",`).join("\n  ")}
  "full_report": "complete formatted report with all sections in plain text with markdown bold (**text**) for abnormalities",
  "negatives_removed": ["list of contradictory negative statements that were automatically removed"]
}`
    : `Return JSON with:
{
  "technique": "complete technique section — 2-4 professional sentences",
  "clinical_information": "1-2 sentences restating the clinical indication professionally",
  "findings": "complete findings section — organ-wise structured paragraphs, abnormalities described first then grouped normals, **bold** for all abnormalities and key measurements",
  "impression": "numbered impression list, most significant first, maximum 5-8 numbered points, **bold** for primary diagnosis, each point one concise sentence",
  "full_report": "complete formatted report with section headings and all content",
  "negatives_removed": ["list of contradictory negative statements that were automatically removed"]
}`;

  const systemPrompt = `You are a highly experienced senior consultant radiologist with 35+ years of subspecialty reporting experience at premier institutions (AIIMS, Apollo, Fortis, Manipal, Tata Memorial).

Your reports are the gold standard used for medicolegal defence, academic publication, peer review, and resident training. Every report you produce must be indistinguishable from the best output of the most experienced radiologist in the department.

════════════════════════════════════════════════
CORE INTELLIGENCE DIRECTIVE — NON-NEGOTIABLE:
════════════════════════════════════════════════

Even if the doctor dictates only 3–5 words, you produce a COMPLETE professional report. A brief dictation does NOT mean a brief report.

• "Lt kidney 8mm stone" → you write a full USG/CT abdomen report covering both kidneys, ureters, bladder, liver, gallbladder, pancreas, spleen, adrenals, prostate/uterus, aorta, and all adjacent structures.
• ALL structures within the field of view are documented — either with their abnormality characterised, or compressed into a brief grouped normal statement.
• NEVER omit adjacent structures — this is a medicolegal requirement.
• Normal findings are compressed efficiently: "Gallbladder, pancreas, and spleen are unremarkable." is correct. Silence is not.
• Do NOT fabricate specific measurements not provided — use qualitative normal descriptors tied to reference ranges.

════════════════════════════════════════════════
REPORT STRUCTURE — ALWAYS IN THIS EXACT ORDER:
════════════════════════════════════════════════

TECHNIQUE
2–4 sentences: imaging modality, body region, coverage, patient position, contrast (agent/route/dose/phases or "No intravenous contrast was administered"), relevant protocol parameters, technical limitations if any.

CLINICAL INFORMATION
1–2 sentences: professionally restate the clinical indication as inferred from the dictation. Do not copy verbatim.

FINDINGS
Organised systematically by anatomical region per modality:
1. Abnormal findings described first within each organ/system — full characterisation (morphology, size if given, location, signal/density characteristics, secondary signs, associated findings).
2. Normal structures compressed into grouped statements — never omitted.
3. Every structure within the field of view accounted for.
4. Bilateral comparison always stated for paired structures.
5. Precise anatomical descriptors and standardised radiology terminology.
6. **Bold markdown** applied to: all abnormalities, key measurements of pathology, primary diagnoses, critical negative findings (e.g., "**No hydronephrosis**" when a stone is present).
7. Do NOT bold: routine normal anatomy, standard negative statements in isolation.

IMPRESSION
Numbered list. 5–8 points maximum unless complexity demands more.
• Most urgent/critical finding always numbered 1.
• Each point is a single concise diagnostic statement — maximum two sentences.
• **Bold** for the primary diagnosis on point 1.
• Scoring system grades in parentheses within the relevant point (e.g., Fazekas Grade II, BI-RADS 4A, LI-RADS LR-4).
• Clinically indicated recommendations within impression points or as RECOMMENDATIONS section.
• NEVER say "as described above" or "as mentioned in findings."

RECOMMENDATIONS (only when clinically indicated)
Specific actionable items with modality, urgency, and timeframe. Omit if none required.

════════════════════════════════════════════════
MANDATORY ADJACENT STRUCTURE COVERAGE:
════════════════════════════════════════════════

USG ABDOMEN: liver (size, echotexture, focal lesions), gallbladder (wall, calculi), CBD (calibre), pancreas (visible parts), spleen (size, echotexture), both kidneys (size, echotexture, CMD, pelvis, calculi, hydronephrosis), bladder (wall, contents, residual), aorta calibre, para-aortic nodes, ascites.

CT ABDOMEN/PELVIS: liver (all 8 segments if lesion; morphology; surface; focal lesion with LI-RADS if indicated), gallbladder, biliary tree (IHBD, CBD diameter), pancreas (duct, parenchyma), spleen, adrenal glands bilaterally, both kidneys (Bosniak if cystic), ureters (full course to VUJ), bladder, bowel (appendix, colon, small bowel), mesentery/omentum, retroperitoneum (nodes, IVC, aorta with calibre), pelvic organs (uterus+ovaries or prostate+SVs), free fluid/gas, lung bases, bones (lumbar/sacrum/hips), psoas muscles, abdominal wall.

CT CHEST: lungs (upper/mid/lower zones bilaterally — pattern per zone), airways (trachea, main bronchi, lobar, segmental), pleura bilaterally (effusion size/character, pneumothorax), mediastinum (anterior/middle/posterior compartments, all nodal stations), hila bilaterally, cardiac (size, chambers, pericardium), great vessels (aortic root, ascending, arch, descending — calibre), chest wall (ribs, sternum, clavicles, shoulder girdles), diaphragm bilaterally, axillary nodes bilaterally, thoracic spine, visualised upper abdomen (liver, spleen, adrenals, upper poles).

CT HEAD/BRAIN: brain parenchyma (lobes, WM, BG, thalami, corpus callosum, brainstem, cerebellum), ventricles, CSF spaces, extra-axial spaces bilaterally, calvarium, skull base, paranasal sinuses (all 4 per side), mastoid air cells bilaterally, orbits (if in field), soft tissues.

MRI BRAIN: all parenchymal structures per sequence (T1/T2/FLAIR/DWI/ADC/SWI/post-contrast T1), paranasal sinuses, mastoid air cells bilaterally, pituitary and infundibulum, cavernous sinuses, calvarium, skull base.

MRI SPINE: alignment with Cobb angle if scoliosis, each vertebral level (height, end plates, Modic type if present), each disc (height, T2 signal, morphology, direction), canal AP dimension per level, cord signal (myelopathy mandatory to document), conus level, cauda equina, foraminal compromise bilaterally per level, facet joints, ligamentum flavum, paraspinal muscles, visualised organs at each level.

CT KUB: both kidneys, each stone (size in mm, location, HU density), hydronephrosis grade, periureteric stranding, both ureters full course, bladder, prostate/uterus, adrenals, abdominal/pelvic incidentals, lung bases, bones.

ULTRASOUND THYROID: each lobe (size: length × AP × transverse in cm, volume = 0.479 × L × AP × W, normal <10 ml per lobe), isthmus thickness, echogenicity, nodules (ACR TI-RADS per nodule: size, composition, echogenicity, shape, margin, echogenic foci — TI-RADS score), vascular pattern on Doppler, cervical lymph nodes levels II–VI bilaterally, parathyroid regions, trachea (midline, deviation, compression).

════════════════════════════════════════════════
FORMATTING RULES:
════════════════════════════════════════════════

• Organ-wise paragraphs separated by blank lines.
• Each organ appears exactly ONCE in findings.
• Short efficient paragraphs — not essays.
• Group clearly normal organs when appropriate: "Gallbladder, pancreas, and spleen are unremarkable."
• Section headings in CAPS: TECHNIQUE, CLINICAL INFORMATION, FINDINGS, IMPRESSION, RECOMMENDATIONS.
• Report must be readable in under 30 seconds by a clinician.
• No AI filler phrases ("it is important to note that", "it should be mentioned", "it is worth noting").
• No template-dumping of unrelated structures.
• Write as if a senior consultant signed this report today.

${learningContext ? `Adapt style per user preferences: ${learningContext}` : ""}

${templateInstructions}

${responseFormat}`;

  const userPrompt = `Generate a complete professional radiology report.

Scan type: ${scanType}

Doctor's dictation / clinical input:
${inputText || "No specific dictation — generate based on structured data below."}

Extracted structured data:
${JSON.stringify(structuredData, null, 2)}

REQUIREMENT: This is a COMPLETE study. Every relevant anatomical structure within the field of view must be accounted for. The report must feel written by a seasoned senior radiologist — not AI-generated. No shortcuts, no truncation, no template dumping.`;

  // BUG FIX 5: 16384 tokens for report generation
  const raw = await callGemini(systemPrompt, userPrompt, true, 16384);

  try {
    const result = JSON.parse(raw);

    // Template mode: map standard fields if not already present
    if (isTemplateMode) {
      const techniqueSection = sectionList.find((s) => s.toLowerCase() === "technique");
      const findingsSection = sectionList.find((s) =>
        s.toLowerCase().includes("finding")
      );
      const impressionSection = sectionList.find((s) =>
        s.toLowerCase() === "impression"
      );
      const clinicalSection = sectionList.find((s) =>
        s.toLowerCase().includes("clinical")
      );

      if (!result.technique && techniqueSection && result[techniqueSection]) {
        result.technique = result[techniqueSection];
      }
      if (!result.findings && findingsSection && result[findingsSection]) {
        result.findings = result[findingsSection];
      }
      if (!result.impression && impressionSection && result[impressionSection]) {
        result.impression = result[impressionSection];
      }
      if (!result.clinical_information && clinicalSection && result[clinicalSection]) {
        result.clinical_information = result[clinicalSection];
      }

      // Collect non-standard extra sections
      const standardLabels = ["technique", "clinical_information", "findings", "impression"];
      const extraSections: Record<string, string> = {};
      for (const [key, value] of Object.entries(result)) {
        if (
          typeof value === "string" &&
          !standardLabels.includes(key.toLowerCase()) &&
          key !== "full_report" &&
          key !== "negatives_removed"
        ) {
          extraSections[key] = value;
        }
      }
      result._extra_sections = extraSections;
    }

    // BUG FIX 6: Always ensure required fields exist
    if (!result.technique) result.technique = "";
    if (!result.clinical_information) result.clinical_information = "";
    if (!result.findings) result.findings = "";
    if (!result.impression) result.impression = "";
    if (!result.negatives_removed) result.negatives_removed = [];

    // BUG FIX 7: Build proper full_report with section headings if not provided
    if (!result.full_report || result.full_report.trim().length < 50) {
      const parts: string[] = [];
      if (result.technique) parts.push(`TECHNIQUE\n${result.technique}`);
      if (result.clinical_information)
        parts.push(`CLINICAL INFORMATION\n${result.clinical_information}`);
      if (result.findings) parts.push(`FINDINGS\n${result.findings}`);
      if (result.impression) parts.push(`IMPRESSION\n${result.impression}`);
      // Append any extra template sections
      if (result._extra_sections) {
        for (const [k, v] of Object.entries(result._extra_sections as Record<string, string>)) {
          if (v) parts.push(`${k.toUpperCase()}\n${v}`);
        }
      }
      result.full_report = parts.join("\n\n");
    }

    return result;
  } catch {
    // If JSON parse fails entirely, return raw text as findings
    return {
      technique: "",
      clinical_information: "",
      findings: raw,
      impression: "",
      full_report: raw,
      negatives_removed: [],
    };
  }
}

// ─── suggestImprovements ──────────────────────────────────────────────────────
async function suggestImprovements(
  reportText: string,
  structuredData: object
): Promise<object[]> {
  const systemPrompt = `You are a senior radiologist reviewing a colleague's report for quality. Provide ONLY genuinely useful, specific suggestions.

IMPORTANT: Only flag REAL issues. Do NOT flag:
- Normal statements about structures (e.g., "The left kidney is unremarkable" is FINE)
- Missing "clinical correlation" for every structure
- Minor stylistic preferences
- Template-style normal statements

ONLY suggest improvements for:
1. A significant finding mentioned in findings but NOT in the impression
2. Missing measurement for a clearly measurable finding
3. A genuine internal contradiction
4. A critical finding that lacks urgency language

Return JSON array:
[{
  "type": "missing_finding|measurement|critical_flag|contradiction",
  "priority": "high|medium|low",
  "title": "short title",
  "suggestion": "specific actionable suggestion",
  "location": "technique|findings|impression|general"
}]
Return empty array [] if the report is clinically sound. Return only JSON.`;

  const userPrompt = `Report text:\n${reportText}\n\nExtracted data:\n${JSON.stringify(
    structuredData,
    null,
    2
  )}`;

  const raw = await callGemini(systemPrompt, userPrompt, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.suggestions ?? [];
  } catch {
    return [];
  }
}

// ─── generateDifferential ─────────────────────────────────────────────────────
async function generateDifferential(
  findings: string,
  bodyPart: string,
  modality: string
): Promise<object[]> {
  const systemPrompt = `You are an expert radiologist generating differential diagnoses.
Based on the imaging findings, provide a ranked differential diagnosis list.
Return JSON array:
[{
  "rank": 1,
  "diagnosis": "diagnosis name",
  "likelihood": "high|moderate|low",
  "supporting_features": ["finding that supports this"],
  "against_features": ["finding against this"],
  "next_steps": "recommended workup"
}]
Return only a JSON array, ordered by likelihood.`;

  const userPrompt = `Modality: ${modality}\nBody Part: ${bodyPart}\nFindings: ${findings}`;

  const raw = await callGemini(systemPrompt, userPrompt, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.differentials ?? [];
  } catch {
    return [];
  }
}

// ─── detectErrors ─────────────────────────────────────────────────────────────
async function detectErrors(
  reportText: string,
  structuredData: object
): Promise<object[]> {
  const errors: object[] = [];

  const systemPrompt = `You are a radiology quality control AI. Check this report for REAL errors only.

CRITICAL: Only flag GENUINE, SERIOUS issues. Do NOT flag:
- Normal statements (e.g., "The left kidney is unremarkable" is perfectly fine)
- Missing "clinical correlation" for every structure
- Style preferences or minor wording suggestions
- Template-style normal descriptions
- Statements about one side being normal while the other has a finding (this is EXPECTED)

ONLY flag these ACTUAL ERRORS:
1. A SPECIFIC finding described as present AND also described as absent
2. A CRITICAL finding (cancer, fracture, hemorrhage) NOT mentioned in the impression
3. A measurement that is clinically impossible
4. A genuine left/right laterality swap error
5. A spelling error that changes medical meaning

Return JSON array:
[{
  "type": "contradiction|missing_critical|impossible_measurement|laterality_swap|meaning_spelling",
  "severity": "error|warning",
  "message": "specific description of the REAL issue",
  "auto_detected": true
}]
Return empty array [] if no REAL issues found. Return only JSON.`;

  const userPrompt = `Report:\n${reportText}\n\nExtracted data:\n${JSON.stringify(
    structuredData,
    null,
    2
  )}`;

  try {
    const raw = await callGemini(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(raw);
    const aiErrors = Array.isArray(parsed) ? parsed : parsed.errors ?? [];
    const significantErrors = aiErrors.filter(
      (e: Record<string, unknown>) =>
        e.severity === "error" &&
        e.type !== "missing_correlation" &&
        e.type !== "incomplete"
    );
    errors.push(...significantErrors);
  } catch {
    // AI check failed silently
  }

  return errors;
}

// ─── followUpQuestions ────────────────────────────────────────────────────────
async function followUpQuestions(
  reportText: string,
  structuredData: object
): Promise<string[]> {
  const systemPrompt = `You are an expert radiologist AI assistant. Based on the current report draft, generate 2-3 relevant follow-up questions.
Only ask about genuinely missing information that would affect clinical decision-making.
Return JSON array of question strings. Return only a JSON array.`;

  const userPrompt = `Current report:\n${reportText}\n\nStructured data:\n${JSON.stringify(
    structuredData,
    null,
    2
  )}`;

  const raw = await callGemini(systemPrompt, userPrompt, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.questions ?? [];
  } catch {
    return [];
  }
}

// ─── generateDiseaseFormat ────────────────────────────────────────────────────
async function generateDiseaseFormat(
  diseaseName: string,
  modality: string,
  bodyPart: string
): Promise<object> {
  const systemPrompt = `You are a highly experienced senior radiologist with 35+ years of clinical experience. Generate a professional reference template for a specific condition.

Write like an experienced radiologist — concise, clinically dense, naturally flowing.
Do NOT include contradictory statements.
Cover all relevant anatomy for the modality.

Return JSON with:
{
  "disease": "disease name",
  "modality": "suggested imaging modality",
  "report": {
    "technique": "brief professional technique section",
    "clinical_information": "typical indication for this condition",
    "findings": "findings section with typical appearance — concise, professional, no filler, **bold** on key pathology",
    "impression": "numbered impression points — short and clinically strong"
  },
  "key_measurements": ["list of measurements to document"],
  "critical_findings_to_check": ["critical findings to look for"],
  "common_negative_contradictions": ["negatives to remove if this disease is present"],
  "related_conditions": ["differential diagnoses"]
}`;

  const userPrompt = `Disease/Condition: ${diseaseName}\nModality: ${
    modality || "most appropriate"
  }\nBody Part: ${bodyPart || "relevant area"}\n\nGenerate a professional reference report template for this condition.`;

  const raw = await callGemini(systemPrompt, userPrompt, true, 8192);
  try {
    return JSON.parse(raw);
  } catch {
    return { disease: diseaseName, error: "Failed to generate format" };
  }
}

// ─── fixSpellingAndNegatives ──────────────────────────────────────────────────
async function fixSpellingAndNegatives(reportText: string): Promise<object> {
  const systemPrompt = `You are a radiology report quality correction AI. Fix ONLY clear errors:
1. Spelling errors in medical terminology
2. Contradictory negative statements where a finding IS present
3. Grammar issues that affect meaning

Do NOT change normal statements, clinical content, or style.
Return JSON with:
{
  "corrected_report": "the full corrected report text",
  "spelling_fixes": [{"original": "misspelled word", "corrected": "correct spelling"}],
  "negatives_removed": [{"removed_text": "the negative statement removed", "reason": "why it contradicts a positive finding"}],
  "grammar_fixes": [{"original": "original text", "corrected": "corrected text"}],
  "total_changes": number
}`;

  const userPrompt = `Please correct this radiology report:\n\n${reportText}`;

  const raw = await callGemini(systemPrompt, userPrompt, true, 12288);
  try {
    return JSON.parse(raw);
  } catch {
    return { corrected_report: reportText, total_changes: 0 };
  }
}

// ─── Deno HTTP server ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!Deno.env.get("GEMINI_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { operation, payload } = await req.json();
    let result: unknown;

    switch (operation) {
      case "extract":
        result = await extractStructuredData(
          payload.input_text,
          payload.scan_type ?? "",
          payload.learning_context ?? ""
        );
        break;

      case "generate":
        result = await generateReport(
          payload.structured_data ?? {},
          payload.scan_type ?? "",
          payload.template ?? null,
          payload.input_text ?? "",
          payload.learning_context ?? ""
        );
        break;

      case "suggest":
        result = await suggestImprovements(
          payload.report_text,
          payload.structured_data ?? {}
        );
        break;

      case "differential":
        result = await generateDifferential(
          payload.findings,
          payload.body_part ?? "",
          payload.modality ?? ""
        );
        break;

      case "detect_errors":
        result = await detectErrors(
          payload.report_text,
          payload.structured_data ?? {}
        );
        break;

      case "follow_up":
        result = await followUpQuestions(
          payload.report_text,
          payload.structured_data ?? {}
        );
        break;

      case "disease_format":
        result = await generateDiseaseFormat(
          payload.disease_name ?? "",
          payload.modality ?? "",
          payload.body_part ?? ""
        );
        break;

      case "fix_spelling_negatives":
        result = await fixSpellingAndNegatives(payload.report_text ?? "");
        break;

      case "full_pipeline": {
        const inputText = payload.input_text ?? "";
        const scanType = payload.scan_type ?? "";
        const template = payload.template ?? null;
        const learningContext = payload.learning_context ?? "";

        const structured = await extractStructuredData(
          inputText,
          scanType,
          learningContext
        );
        const report = await generateReport(
          structured,
          scanType,
          template,
          inputText,
          learningContext
        );
        const reportObj = report as Record<string, unknown>;
        const fullText = (reportObj.full_report as string) ?? "";

        const [suggestions, questions] = await Promise.all([
          suggestImprovements(fullText, structured),
          followUpQuestions(fullText, structured),
        ]);

        result = { structured, report, suggestions, errors: [], questions };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});