/**
 * SafeTrace AI Service
 * Provides multimodal AI analysis using Google Gemini or mock mode
 * All results are labelled as assistive analysis requiring human review
 */

let genAI = null;

const initGemini = () => {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('Gemini AI initialized successfully');
      return true;
    } catch (e) {
      console.log('Gemini AI initialization failed, using mock mode');
      return false;
    }
  }
  console.log('No Gemini API key found, using mock AI mode');
  return false;
};

const isAIAvailable = () => genAI !== null;

// ============================================================
// MOCK AI RESPONSES
// ============================================================

const mockEvidenceAnalysis = (evidence) => ({
  status: 'ASSISTIVE_ANALYSIS',
  disclaimer: 'This is an AI-assisted analysis. All findings require human verification before any action is taken.',
  identityConfirmed: false,
  processingType: evidence.fileType,
  extractedFacts: [
    {
      fact: 'Young person approximately 14-16 years of age observed',
      category: 'person',
      confidence: 0.72,
      sourceReference: { source: evidence.fileName, section: 'visual_analysis' }
    },
    {
      fact: 'Blue clothing visible',
      category: 'clothing',
      confidence: 0.85,
      sourceReference: { source: evidence.fileName, section: 'color_analysis' }
    },
    {
      fact: 'Urban area with transit infrastructure visible',
      category: 'location',
      confidence: 0.68,
      sourceReference: { source: evidence.fileName, section: 'scene_analysis' }
    },
    {
      fact: 'Evening lighting conditions suggest time between 6 PM and 9 PM',
      category: 'time',
      confidence: 0.55,
      sourceReference: { source: evidence.fileName, section: 'lighting_analysis' }
    }
  ],
  sceneDescription: 'The evidence shows an urban setting with transit-related infrastructure. Lighting conditions suggest evening hours. Visual elements include signage and pedestrian areas.',
  objectsDetected: ['signage', 'pedestrian crossing', 'transit structure', 'urban furniture'],
  textDetected: evidence.fileType === 'document' ? 'Sample extracted text from document analysis' : null,
  transcript: evidence.fileType === 'audio' ? 'I saw someone near the railway station around 8 PM. They were wearing a blue shirt and looked like a teenager. They seemed to be looking around as if they were lost or searching for someone.' : null,
  keyframes: evidence.fileType === 'video' ? [
    { timestamp: '00:03', description: 'Wide shot of station entrance' },
    { timestamp: '00:14', description: 'Person in blue clothing walking through frame' },
    { timestamp: '00:22', description: 'Person stops near information board' },
    { timestamp: '00:31', description: 'Person exits frame toward platform area' }
  ] : null,
  confidence: 0.68,
  sourceReferences: [{
    evidenceId: evidence.evidenceId,
    source: evidence.fileName,
    timestamp: evidence.fileType === 'video' ? '00:14-00:19' : null,
    description: 'AI-assisted analysis of uploaded evidence'
  }],
  missingInformation: ['Clearer facial features', 'Exact time of observation', 'Direction of travel'],
  nextAction: 'Authorized investigator review required. This analysis should be cross-referenced with existing case information.',
  analysisTimestamp: new Date().toISOString()
});

const mockSightingAnalysis = (sighting, relatedCases = []) => ({
  status: 'POTENTIAL_LEAD',
  disclaimer: 'This is an AI-assisted analysis. All findings require human verification. AI does not confirm identity.',
  identityConfirmed: false,
  confidence: 'MODERATE',
  relatedCases: relatedCases.slice(0, 3).map((c, i) => ({
    caseId: c.caseId,
    caseName: c.name,
    relevanceScore: Math.max(0.5, 0.85 - (i * 0.15)),
    supportingFactors: [
      sighting.approximateAge && c.estimatedCurrentAge ? `Similar approximate age range (sighting: ~${sighting.approximateAge}, case: ~${c.estimatedCurrentAge})` : null,
      sighting.location?.city && c.lastKnownLocation?.city === sighting.location?.city ? `Same city: ${sighting.location.city}` : 'Nearby geographic area',
      sighting.clothing && c.clothing ? 'Similar clothing description noted' : null,
      'Time period falls within active search window'
    ].filter(Boolean),
    contradictingFactors: [
      'Exact identification cannot be confirmed from available evidence',
      'Additional verification needed for physical description match'
    ],
    sourceReferences: [{
      source: 'sighting_analysis',
      description: `Sighting submitted on ${new Date(sighting.date || Date.now()).toLocaleDateString()}`
    }]
  })),
  extractedFacts: [
    sighting.description ? { fact: sighting.description, category: 'description', confidence: 0.9 } : null,
    sighting.clothing ? { fact: `Clothing: ${sighting.clothing}`, category: 'clothing', confidence: 0.85 } : null,
    sighting.location?.city ? { fact: `Location: ${sighting.location.city}`, category: 'location', confidence: 0.9 } : null,
    sighting.approximateTime ? { fact: `Approximate time: ${sighting.approximateTime}`, category: 'time', confidence: 0.7 } : null
  ].filter(Boolean),
  missingInformation: [
    !sighting.approximateTime ? 'Exact time of sighting' : null,
    'Clearer physical description',
    'Direction of travel',
    'Accompanying persons if any'
  ].filter(Boolean),
  nextAction: 'Potential lead — human verification required. An authorized investigator should review this sighting against case records.',
  analysisTimestamp: new Date().toISOString()
});

const mockAgeAnalysis = (caseData) => {
  const yearsElapsed = caseData.estimatedCurrentAge - caseData.ageWhenMissing;
  return {
    status: 'ASSISTIVE_ANALYSIS',
    disclaimer: 'This is an approximate analysis to assist investigators. It is NOT an exact prediction and should NOT be used as identity confirmation.',
    identityConfirmed: false,
    ageWhenMissing: caseData.ageWhenMissing,
    estimatedCurrentAge: caseData.estimatedCurrentAge,
    yearsElapsed,
    expectedChanges: [
      yearsElapsed > 5 ? 'Significant height change expected' : 'Moderate growth expected',
      yearsElapsed > 10 ? 'Substantial facial structure changes likely' : 'Some facial maturation expected',
      'Hair style and color may have changed',
      'Build and weight likely different from last known appearance',
      yearsElapsed > 15 ? 'Person would now appear as an adult' : 'Person may still appear within adolescent age range'
    ],
    investigatorGuidance: [
      'Focus on distinguishing features that are less likely to change (e.g., birthmarks, scars)',
      'Consider bone structure similarities rather than soft tissue features',
      'Use multiple reference photographs from different angles if available',
      'Cross-reference with family photographs at similar ages for genetic comparison'
    ],
    confidence: yearsElapsed <= 5 ? 'MODERATE' : 'LOW',
    confidenceExplanation: yearsElapsed <= 5
      ? 'Shorter elapsed time allows for more reliable age-based comparison'
      : 'Extended time period makes appearance prediction significantly less reliable',
    warning: 'Age progression analysis provides general guidance only. Physical appearance can vary significantly based on genetics, nutrition, health, and environmental factors. This analysis must not be used as sole evidence for identification.',
    analysisTimestamp: new Date().toISOString()
  };
};

const mockRiskAnalysis = (caseData) => {
  const daysMissing = caseData.dateMissing
    ? Math.floor((Date.now() - new Date(caseData.dateMissing)) / (1000 * 60 * 60 * 24))
    : 0;
  const isMinor = (caseData.ageWhenMissing || 18) < 18;
  const isRecentlyMissing = daysMissing < 7;

  let riskLevel = 'NORMAL';
  const factors = [];

  if (isMinor) { factors.push('Missing person is a minor'); riskLevel = 'HIGH'; }
  if (isRecentlyMissing) { factors.push('Recently reported missing (within 7 days)'); riskLevel = 'HIGH'; }
  if (daysMissing > 365) { factors.push('Extended period since disappearance'); }
  if (caseData.circumstances?.toLowerCase().includes('danger') ||
      caseData.circumstances?.toLowerCase().includes('risk') ||
      caseData.circumstances?.toLowerCase().includes('threat')) {
    factors.push('Circumstances indicate potential danger');
    riskLevel = 'CRITICAL';
  }
  if (caseData.ageWhenMissing && caseData.ageWhenMissing < 12) {
    factors.push('Very young age at time of disappearance');
    riskLevel = 'CRITICAL';
  }

  return {
    status: 'ASSISTIVE_ANALYSIS',
    disclaimer: 'Risk assessment is AI-assisted and should be validated by authorized personnel.',
    identityConfirmed: false,
    riskLevel,
    factors,
    explanation: `Based on available case information, the risk level has been assessed as ${riskLevel}. ${factors.length} contributing factors were identified.`,
    recommendation: riskLevel === 'CRITICAL'
      ? 'Immediate prioritization and resource allocation recommended.'
      : riskLevel === 'HIGH'
      ? 'Elevated attention and regular review recommended.'
      : 'Standard investigation protocols should be followed.',
    confidence: factors.length > 2 ? 'MODERATE' : 'LOW',
    daysMissing,
    timestamp: new Date().toISOString()
  };
};

const mockClusterAnalysis = (cases, sightings) => ({
  status: 'ASSISTIVE_ANALYSIS',
  disclaimer: 'Cluster analysis is AI-assisted. Case relationships require human verification.',
  identityConfirmed: false,
  clusters: [{
    title: 'Geographic Proximity Cluster',
    type: 'GEOGRAPHIC_PATTERN',
    caseIds: cases.slice(0, 3).map(c => c.caseId),
    similarityScore: 0.72,
    sharedAttributes: [
      { attribute: 'city', value: 'Similar geographic area', matchCount: 3 },
      { attribute: 'age_range', value: '12-18 years', matchCount: 2 }
    ],
    explanation: 'Multiple cases share similar geographic characteristics. This may indicate a pattern worthy of investigation, or it may be coincidental. Human review is required.',
    supportingEvidence: ['Proximity of last known locations', 'Overlapping time periods'],
    contradictingEvidence: ['Different physical descriptions in some cases', 'Varying circumstances']
  }],
  patterns: [{
    type: 'temporal_pattern',
    description: 'Cluster of reports within similar time periods',
    confidence: 0.58,
    relatedCaseCount: cases.length
  }],
  nextAction: 'Investigator review required to determine if identified patterns represent meaningful connections.',
  analysisTimestamp: new Date().toISOString()
});

const mockSearchAnalysis = (query) => ({
  status: 'ASSISTIVE_ANALYSIS',
  disclaimer: 'Search results are AI-assisted suggestions. All matches require human verification.',
  identityConfirmed: false,
  interpretation: `Searching for cases and sightings related to: "${query}"`,
  suggestedFilters: {
    keywords: query.split(' ').filter(w => w.length > 2),
    possibleAge: query.match(/\d+/) ? parseInt(query.match(/\d+/)[0]) : null,
    possibleLocation: null
  },
  nextAction: 'Review search results and apply human judgment to determine relevance.',
  analysisTimestamp: new Date().toISOString()
});

// ============================================================
// GEMINI AI CALLS
// ============================================================

const callGemini = async (prompt, fileData = null) => {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const parts = [{ text: prompt }];

    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.base64
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return { rawText: text };
      }
    }
    return { rawText: text };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return null;
  }
};

const analyzeEvidence = async (evidence, fileBuffer = null) => {
  if (!isAIAvailable() || !fileBuffer) {
    return mockEvidenceAnalysis(evidence);
  }

  const base64 = fileBuffer.toString('base64');
  const prompt = `You are SafeTrace, a privacy-aware AI assistant for missing person investigations.
Analyze this ${evidence.fileType} evidence and extract relevant information.

IMPORTANT RULES:
- Do NOT confirm any person's identity
- Do NOT declare cases as the same
- Label everything as "assistive analysis requiring human review"
- Extract: descriptions, locations, times, clothing, objects, text, scene details
- For audio/video: include timestamps for relevant segments
- Return structured JSON

Evidence file: ${evidence.fileName}
File type: ${evidence.fileType}

Return JSON with this structure:
{
  "status": "ASSISTIVE_ANALYSIS",
  "disclaimer": "AI-assisted analysis requiring human verification",
  "identityConfirmed": false,
  "extractedFacts": [{"fact": "", "category": "", "confidence": 0.0, "sourceReference": {}}],
  "sceneDescription": "",
  "objectsDetected": [],
  "textDetected": null,
  "transcript": null,
  "keyframes": null,
  "confidence": 0.0,
  "missingInformation": [],
  "nextAction": "Authorized investigator review required"
}`;

  const result = await callGemini(prompt, {
    mimeType: evidence.mimeType || 'application/octet-stream',
    base64
  });

  if (result) {
    // Ensure safety constraints
    result.identityConfirmed = false;
    result.status = 'ASSISTIVE_ANALYSIS';
    result.disclaimer = result.disclaimer || 'AI-assisted analysis requiring human verification';
    return result;
  }

  return mockEvidenceAnalysis(evidence);
};

const analyzeSighting = async (sighting, relatedCases = []) => {
  if (!isAIAvailable()) {
    return mockSightingAnalysis(sighting, relatedCases);
  }

  const prompt = `You are SafeTrace, a privacy-aware AI assistant for missing person investigations.
Analyze this sighting report and find potential connections to existing cases.

IMPORTANT RULES:
- Do NOT confirm identity
- Do NOT declare cases as the same
- Label as "potential lead requiring human verification"
- Compare descriptions, locations, timing, clothing, and age

Sighting Details:
${JSON.stringify(sighting, null, 2)}

Existing Cases:
${JSON.stringify(relatedCases.map(c => ({
  caseId: c.caseId, name: c.name, ageWhenMissing: c.ageWhenMissing,
  estimatedCurrentAge: c.estimatedCurrentAge, lastKnownLocation: c.lastKnownLocation,
  physicalDescription: c.physicalDescription, clothing: c.clothing, dateMissing: c.dateMissing
})), null, 2)}

Return JSON with structure:
{
  "status": "POTENTIAL_LEAD",
  "identityConfirmed": false,
  "confidence": "LOW|MODERATE|HIGH",
  "relatedCases": [{"caseId":"","relevanceScore":0,"supportingFactors":[],"contradictingFactors":[]}],
  "missingInformation": [],
  "nextAction": "Human verification required"
}`;

  const result = await callGemini(prompt);
  if (result && !result.rawText) {
    result.identityConfirmed = false;
    return result;
  }

  return mockSightingAnalysis(sighting, relatedCases);
};

const analyzeAge = async (caseData) => {
  if (!isAIAvailable()) {
    return mockAgeAnalysis(caseData);
  }
  return mockAgeAnalysis(caseData);
};

const analyzeRisk = async (caseData) => {
  if (!isAIAvailable()) {
    return mockRiskAnalysis(caseData);
  }

  const prompt = `You are SafeTrace, a privacy-aware AI assistant.
Assess the risk level for this missing person case.

Case Details:
${JSON.stringify({
  ageWhenMissing: caseData.ageWhenMissing,
  dateMissing: caseData.dateMissing,
  circumstances: caseData.circumstances,
  lastKnownLocation: caseData.lastKnownLocation
}, null, 2)}

Risk Levels: NORMAL, HIGH, CRITICAL

Return JSON:
{
  "riskLevel": "NORMAL|HIGH|CRITICAL",
  "factors": [],
  "explanation": "",
  "recommendation": "",
  "confidence": "LOW|MODERATE|HIGH"
}`;

  const result = await callGemini(prompt);
  if (result && result.riskLevel) {
    result.status = 'ASSISTIVE_ANALYSIS';
    result.identityConfirmed = false;
    result.disclaimer = 'Risk assessment is AI-assisted and should be validated by authorized personnel.';
    return result;
  }

  return mockRiskAnalysis(caseData);
};

const analyzeClusters = async (cases, sightings) => {
  if (!isAIAvailable()) {
    return mockClusterAnalysis(cases, sightings);
  }
  return mockClusterAnalysis(cases, sightings);
};

const analyzeSearch = async (query) => {
  if (!isAIAvailable()) {
    return mockSearchAnalysis(query);
  }
  return mockSearchAnalysis(query);
};

module.exports = {
  initGemini,
  isAIAvailable,
  analyzeEvidence,
  analyzeSighting,
  analyzeAge,
  analyzeRisk,
  analyzeClusters,
  analyzeSearch
};
