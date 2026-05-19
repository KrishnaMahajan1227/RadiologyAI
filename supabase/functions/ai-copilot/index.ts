import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const FAST_MODEL = "gemini-2.5-flash";
const SMART_MODEL = "gemini-2.5-flash";

async function callGemini(
  messages: object[],
  jsonMode = false
): Promise<string> {
  const systemMessage =
    (messages.find((m: any) => m.role === "system") as any)?.content || "";

  const userMessages = messages
    .filter((m: any) => m.role !== "system")
    .map((m: any) => m.content)
    .join("\n\n");

  const prompt = `
${systemMessage}

${userMessages}
`;

  const response = await fetch(
    `${GEMINI_API_URL}?key=${Deno.env.get("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: jsonMode
            ? "application/json"
            : "text/plain",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(
      `Gemini API error: ${response.status} - ${err}`
    );
  }

  const data = await response.json();

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
  );
}

async function extractStructuredData(inputText: string, scanType: string, learningContext: string): Promise<object> {
  const messages = [
    {
      role: "system",
      content: `You are a radiology AI assistant. Extract structured clinical data from radiology dictation/notes.
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
Return only valid JSON.`,
    },
    {
      role: "user",
      content: `Scan type: ${scanType || "Unknown"}\n\nDictation/Notes:\n${inputText}`,
    },
  ];

  const raw = await callGemini(messages, FAST_MODEL, true);
  try {
    return JSON.parse(raw);
  } catch {
    return { raw_input: inputText };
  }
}

async function generateReport(structuredData: object, scanType: string, template: string | null, inputText: string, learningContext: string): Promise<object> {
  let templateInstructions = "Use standard radiology report format with Technique, Findings, and Impression sections.";
  let sectionList = ["Technique", "Findings", "Impression"];

  if (template) {
    try {
      const sections = JSON.parse(template);
      sectionList = sections.map((s: { label: string }) => s.label);
      const sectionDetails = sections.map((s: { label: string; placeholder: string; required: boolean; type: string; options?: string[] }) => {
        let desc = `- ${s.label}${s.required ? " (REQUIRED)" : " (optional)"}: ${s.placeholder || "Fill in appropriate content"}`;
        if (s.options?.length) desc += `. Options: ${s.options.join(", ")}`;
        return desc;
      }).join("\n");

      templateInstructions = `A TEMPLATE has been selected by the radiologist. You MUST generate content for EACH section in this template.

Template sections (in order): ${sectionList.join(", ")}

Section details:
${sectionDetails}

CRITICAL TEMPLATE RULES:
1. You MUST return a JSON object with a key for EVERY template section label (exact match, case-sensitive)
2. Fill EACH section with clinically appropriate content based on the dictation
3. If the dictation mentions specific findings, put them in the CORRECT template section
4. If a section has no relevant findings from the dictation, write a brief normal statement
5. Do NOT leave any required section empty
6. The dictation is the PRIMARY source of clinical information - the template is the STRUCTURE
7. Write like a real radiologist - concise, precise, professional medical language
8. When dictation says something is normal, write it as a normal statement in the appropriate section
9. When dictation describes a finding, write it clearly with measurements if provided
10. Do NOT include contradictory statements - if a finding IS present, do NOT also say "no evidence of" that finding`;
    } catch {
      // Template parse failed, use default
    }
  }

  const isTemplateMode = template !== null;
  const responseFormat = isTemplateMode
    ? `Return JSON with a key for EACH template section (exact labels: ${sectionList.join(", ")}), plus:
{
  ${sectionList.map((s) => `"${s}": "content for this section",`).join("\n  ")}
  "full_report": "complete formatted report with all sections",
  "negatives_removed": ["list of contradictory negative statements that were automatically removed"]
}`
    : `Return JSON with:
{
  "technique": "complete technique section",
  "findings": "complete findings section with organized paragraphs",
  "impression": "numbered impression list, most significant first",
  "full_report": "complete formatted report",
  "negatives_removed": ["list of contradictory negative statements that were automatically removed"]
}`;

  const systemPrompt = `You are a highly experienced senior consultant radiologist with 25+ years of reporting experience in premium hospitals and diagnostic centers (Apollo, Fortis, Manipal, Sparsh, etc.).

Generate highly realistic, consultant-level radiology reports exactly like real hospital-issued reports. The final output must look and read like an authentic radiologist's finalized report — concise, clinically strong, naturally written, and professionally formatted.

CRITICAL AI BEHAVIOR:
Even if the doctor dictates only a short abnormal finding, intelligently complete the remaining clinically relevant findings for the entire study.

Example:
If the doctor dictates: "4 mm stone in right kidney"
You must intelligently generate:
- Liver findings
- Gall bladder findings
- Pancreas findings
- Spleen findings
- Both kidneys (highlighting the stone)
- Urinary bladder
- Relevant pelvic/abdominal findings
while naturally highlighting the important pathology.

REPORT WRITING STYLE:
- Use natural radiologist language.
- Maintain concise but complete reporting style.
- Do NOT generate AI-style essays.
- Do NOT over-explain normal findings.
- Do NOT create repetitive sections.
- Do NOT generate robotic text.
- Reports should feel efficient, human-written, and clinically confident.
- The report should read like: "A real consultant radiologist finalized this report."
- NOT like: "An AI expanded a prompt."

REPORT STRUCTURE:
1. Technique / Indication (if available)
2. Findings
3. Impression

FINDINGS SECTION RULES:
- Organ-wise structured reporting.
- Use short readable paragraphs.
- Mention normal findings briefly and naturally.
- Focus more attention on abnormal findings.
- Avoid duplicate subsections.
- Keep the flow similar to real hospital reports.
- Group normal organs together when appropriate (e.g., "Gallbladder, pancreas, spleen: Unremarkable.")

IMPRESSION SECTION RULES:
- Short, strong, consultant-style conclusion.
- Use concise numbered points.
- Highlight major diagnoses in **BOLD** markdown.
- Avoid unnecessary AI recommendations.
- Only add clinical correlation if genuinely needed.
- Maximum 3-5 points.

FORMATTING & TYPOGRAPHY:
- Use clean hospital-style formatting.
- Organize findings in organ-wise format.
- Use short professional paragraphs.
- IMPORTANT abnormalities, measurements, diagnoses, and critical findings MUST be highlighted in **BOLD** markdown.
- Keep normal findings concise and realistic.
- Do not over-explain obvious normal structures.
- Each organ/structure should appear ONCE in findings.
- Use newlines to separate organ paragraphs for readability.

TECHNIQUE:
- Keep short and professional (1-2 sentences).
- Example: "Ultrasound examination of the abdomen was performed using a curvilinear transducer."
- Only mention technique specifics that are clinically relevant.

MODALITY-SPECIFIC COMPLETENESS:

For ULTRASOUND ABDOMEN: Always cover liver, gallbladder, pancreas, spleen, both kidneys, urinary bladder, aorta as relevant.
For CT ABDOMEN/PELVIS: Cover liver, pancreas, spleen, both kidneys, bladder, adrenals, bowel, vasculature, lymph nodes.
For CT CHEST: Cover lungs, mediastinum, heart, hilum, pleura, chest wall, diaphragm.
For MRI BRAIN: Cover all lobes, ventricles, subarachnoid spaces, brainstem, cerebellum, signal abnormalities.
For SPINE MRI: Cover vertebral bodies, discs, spinal canal, neural foramina, cord signal, ligaments.
For MAMMOGRAPHY: Cover both breasts, all quadrants, comparison views, skin, axilla.
For CHEST X-RAY: Cover lungs, mediastinum, heart, diaphragm, soft tissues, bones.
For MSK STUDIES: Cover bones, joints, soft tissues, neurovascular structures.
For DOPPLER: Cover flow velocities, resistive indices, spectral analysis, color flow mapping.
For RENAL ULTRASOUND: Cover both kidneys (size, cortex, medulla, pelvis), bladder, prostate/uterus as relevant.

CRITICAL DON'Ts:
- Do NOT generate one-line reports.
- Do NOT generate essay-style reports with unnecessary paragraphs.
- Do NOT repeat findings across sections.
- Do NOT produce robotic AI text.
- Do NOT overuse recommendations like "Clinical correlation advised."
- Do NOT over-describe normal anatomy.
- Do NOT create duplicate sections.
- Do NOT make the report feel template-generated.
- Do NOT use phrases like "as noted above" or "as described" — each organ gets its own standalone description.

RADIOLOGIST THINKING PATTERN:
Think like a real senior radiologist completing a report:
1. Identify the PRIMARY pathology/abnormality first
2. Assess relevant normal anatomy naturally
3. Keep impression clinically strong and concise
4. Avoid filler phrases and unnecessary sentences
5. Write for clinical decision-making, not for completeness

FINDINGS SECTION PRIORITY:
Abnormal findings deserve attention and description.
Normal findings are mentioned briefly and naturally grouped.

GOOD FINDINGS FLOW:
"Liver: Normal size and echotexture without focal lesion.
Pancreas: Unremarkable.
**Right kidney: 11.2 cm with normal echotexture. 4 mm echogenic focus in renal parenchyma consistent with calculus. No hydronephrosis.**
Left kidney: Normal, 10.8 cm. No stone or dilatation.
Urinary bladder: Distended with normal wall thickness, no calculi."

BAD FINDINGS FLOW:
Long paragraphs explaining every organ in detail. Repetition. Overly verbose normal findings.

BOLD MARKDOWN USAGE:
Apply **BOLD** ONLY to:
- Abnormalities and pathology
- Measurements of abnormal findings
- Clinical diagnoses
- Important negative findings that clarify status (e.g., "**No hydronephrosis**" if stone present)

DO NOT BOLD:
- Normal anatomy
- Routine descriptors
- Standard negative findings in isolation

IMPRESSION FORMATTING:
Use bullet points or numbered list.
Each point is a separate clinical statement.
Main diagnosis should be first and in **BOLD**.

Example of GOOD impression:
• **Acute right lower lobe pneumonia**
• No pleural effusion
• Cardiac silhouette normal

Example of BAD impression:
"There is pneumonia. Clinical correlation is advised. Follow-up recommended."

FINAL OUTPUT REQUIREMENT:
The report must feel polished, concise, clinically accurate, visually clean, and indistinguishable from a premium hospital-issued radiology report (Sparsh / Apollo / Fortis / Manipal style). Readable in under 20-30 seconds by clinicians. Suitable for direct PACS/HIS/EMR export. Feel like a senior radiologist wrote it efficiently — NOT like AI generated it.

${templateInstructions}
${learningContext ? `Adapt your language to match these user preferences: ${learningContext}` : ""}

${responseFormat}`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Generate a professional radiology report for:
Scan type: ${scanType}

Doctor's dictation/input:
${inputText || "No specific dictation provided - generate based on structured data."}

Extracted structured data:
${JSON.stringify(structuredData, null, 2)}

Remember: This is a COMPLETE study. Cover all relevant anatomy professionally while maintaining a natural, experienced radiologist's tone. The final report must feel like it was written by a seasoned radiologist, not AI-generated.`,
    },
  ];

  const raw = await callGemini(messages, true);
  try {
    const result = JSON.parse(raw);

    // If template mode, ensure standard fields exist for compatibility
    if (isTemplateMode) {
      // Map template sections to standard fields if they exist
      const techniqueSection = sectionList.find((s) => s.toLowerCase() === "technique");
      const findingsSection = sectionList.find((s) => s.toLowerCase().includes("findings"));
      const impressionSection = sectionList.find((s) => s.toLowerCase() === "impression");

      if (!result.technique && techniqueSection && result[techniqueSection]) {
        result.technique = result[techniqueSection];
      }
      if (!result.findings && findingsSection && result[findingsSection]) {
        result.findings = result[findingsSection];
      }
      if (!result.impression && impressionSection && result[impressionSection]) {
        result.impression = result[impressionSection];
      }

      // Build extra sections (non-standard ones)
      const standardLabels = ["technique", "findings", "impression"];
      const extraSections: Record<string, string> = {};
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === "string" && !standardLabels.includes(key.toLowerCase()) &&
            key !== "full_report" && key !== "negatives_removed") {
          extraSections[key] = value;
        }
      }
      result._extra_sections = extraSections;
    }

    // Ensure required fields always exist
    if (!result.technique) result.technique = "";
    if (!result.findings) result.findings = "";
    if (!result.impression) result.impression = "";
    if (!result.full_report) {
      result.full_report = `TECHNIQUE:\n${result.technique}\n\nFINDINGS:\n${result.findings}\n\nIMPRESSION:\n${result.impression}`;
    }
    if (!result.negatives_removed) result.negatives_removed = [];

    return result;
  } catch {
    return {
      technique: "Technique not available.",
      findings: raw,
      impression: "",
      full_report: raw,
      negatives_removed: [],
    };
  }
}

async function suggestImprovements(reportText: string, structuredData: object): Promise<object[]> {
  const messages = [
    {
      role: "system",
      content: `You are a senior radiologist reviewing a colleague's report for quality. Provide ONLY genuinely useful, specific suggestions.

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
Return empty array [] if the report is clinically sound. Return only JSON.`,
    },
    {
      role: "user",
      content: `Report text:\n${reportText}\n\nExtracted data:\n${JSON.stringify(structuredData, null, 2)}`,
    },
  ];

  const raw = await callGemini(messages, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.suggestions ?? []);
  } catch {
    return [];
  }
}

async function generateDifferential(findings: string, bodyPart: string, modality: string): Promise<object[]> {
  const messages = [
    {
      role: "system",
      content: `You are an expert radiologist generating differential diagnoses.
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
Return only a JSON array, ordered by likelihood.`,
    },
    {
      role: "user",
      content: `Modality: ${modality}\nBody Part: ${bodyPart}\nFindings: ${findings}`,
    },
  ];

  const raw = await callGemini(messages, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.differentials ?? []);
  } catch {
    return [];
  }
}

async function detectErrors(reportText: string, structuredData: object): Promise<object[]> {
  const errors: object[] = [];

  // AI-based error detection - with strict instructions to avoid false positives
  const messages = [
    {
      role: "system",
      content: `You are a radiology quality control AI. Check this report for REAL errors only.

CRITICAL: Only flag GENUINE, SERIOUS issues. Do NOT flag:
- Normal statements (e.g., "The left kidney is unremarkable" is perfectly fine)
- Missing "clinical correlation" for every structure
- Style preferences or minor wording suggestions
- Template-style normal descriptions
- Statements about one side being normal while the other has a finding (this is EXPECTED)
- Missing sections if the content is clearly present

ONLY flag these ACTUAL ERRORS:
1. A SPECIFIC finding described as present AND also described as absent (e.g., "3mm stone in right kidney" AND "no evidence of stone in both kidneys")
2. A CRITICAL finding (cancer, fracture, hemorrhage) NOT mentioned in the impression
3. A measurement that is clinically impossible
4. A genuine left/right swap error
5. A spelling error that changes medical meaning

Return JSON array:
[{
  "type": "contradiction|missing_critical|impossible_measurement|laterality_swap|meaning_spelling",
  "severity": "error|warning",
  "message": "specific description of the REAL issue",
  "auto_detected": true
}]
Return empty array [] if no REAL issues found. Return only JSON.`,
    },
    {
      role: "user",
      content: `Report:\n${reportText}\n\nExtracted data:\n${JSON.stringify(structuredData, null, 2)}`,
    },
  ];

  try {
    const raw = await callGemini(messages, true);
    const parsed = JSON.parse(raw);
    const aiErrors = Array.isArray(parsed) ? parsed : (parsed.errors ?? []);
    const significantErrors = aiErrors.filter((e: Record<string, unknown>) =>
      e.severity === "error" && e.type !== "missing_correlation" && e.type !== "incomplete"
    );
    errors.push(...significantErrors);
  } catch {
    // AI check failed silently
  }

  return errors;
}

async function followUpQuestions(reportText: string, structuredData: object): Promise<string[]> {
  const messages = [
    {
      role: "system",
      content: `You are an expert radiologist AI assistant. Based on the current report draft, generate 2-3 relevant follow-up questions.
Only ask about genuinely missing information that would affect clinical decision-making.
Return JSON array of question strings. Return only a JSON array.`,
    },
    {
      role: "user",
      content: `Current report:\n${reportText}\n\nStructured data:\n${JSON.stringify(structuredData, null, 2)}`,
    },
  ];

  const raw = await callGemini(messages, FAST_MODEL, true);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
  } catch {
    return [];
  }
}

async function generateDiseaseFormat(diseaseName: string, modality: string, bodyPart: string): Promise<object> {
  const messages = [
    {
      role: "system",
      content: `You are a highly experienced senior radiologist with 25+ years of clinical experience. Generate a professional reference template for a specific condition.

Write like an experienced radiologist would - concise, clinically dense, naturally flowing.
Do NOT include contradictory statements.
Cover all relevant anatomy for the modality.

Return JSON with:
{
  "disease": "disease name",
  "modality": "suggested imaging modality",
  "report": {
    "technique": "brief professional technique section",
    "findings": "findings section with typical appearance - concise, professional, no filler",
    "impression": "numbered impression points - short and clinically strong"
  },
  "key_measurements": ["list of measurements to document"],
  "critical_findings_to_check": ["critical findings to look for"],
  "common_negative_contradictions": ["negatives to remove if this disease is present"],
  "related_conditions": ["differential diagnoses"]
}`,
    },
    {
      role: "user",
      content: `Disease/Condition: ${diseaseName}\nModality: ${modality || "most appropriate"}\nBody Part: ${bodyPart || "relevant area"}\n\nGenerate a professional reference report template for this condition.`,
    },
  ];

  const raw = await callGemini(messages, SMART_MODEL, true);
  try {
    return JSON.parse(raw);
  } catch {
    return { disease: diseaseName, error: "Failed to generate format" };
  }
}

async function fixSpellingAndNegatives(reportText: string): Promise<object> {
  const messages = [
    {
      role: "system",
      content: `You are a radiology report quality correction AI. Fix ONLY clear errors:
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
}`,
    },
    {
      role: "user",
      content: `Please correct this radiology report:\n\n${reportText}`,
    },
  ];

  const raw = await callGemini(messages, SMART_MODEL, true);
  try {
    return JSON.parse(raw);
  } catch {
    return { corrected_report: reportText, total_changes: 0 };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!Deno.env.get("GEMINI_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { operation, payload } = await req.json();
    let result: unknown;

    switch (operation) {
      case "extract":
        result = await extractStructuredData(
          payload.input_text, payload.scan_type ?? "", payload.learning_context ?? ""
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
        result = await suggestImprovements(payload.report_text, payload.structured_data ?? {});
        break;

      case "differential":
        result = await generateDifferential(payload.findings, payload.body_part ?? "", payload.modality ?? "");
        break;

      case "detect_errors":
        result = await detectErrors(payload.report_text, payload.structured_data ?? {});
        break;

      case "follow_up":
        result = await followUpQuestions(payload.report_text, payload.structured_data ?? {});
        break;

      case "disease_format":
        result = await generateDiseaseFormat(payload.disease_name ?? "", payload.modality ?? "", payload.body_part ?? "");
        break;

      case "fix_spelling_negatives":
        result = await fixSpellingAndNegatives(payload.report_text ?? "");
        break;

      case "full_pipeline": {
        const inputText = payload.input_text ?? "";
        const scanType = payload.scan_type ?? "";
        const template = payload.template ?? null;
        const learningContext = payload.learning_context ?? "";

        const structured = await extractStructuredData(inputText, scanType, learningContext);
        const report = await generateReport(structured, scanType, template, inputText, learningContext);
        const reportObj = report as Record<string, unknown>;
        const fullText = (reportObj.full_report as string) ?? "";

        const [suggestions, questions] = await Promise.all([
          suggestImprovements(fullText, structured),
          followUpQuestions(fullText, structured),
        ]);

        // No error detection on freshly generated reports
        result = { structured, report, suggestions, errors: [], questions };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
