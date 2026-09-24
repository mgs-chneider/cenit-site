// JSON schema for the structured tender analysis returned by Claude.
// Structured outputs require every object to list all properties as required
// and to forbid additional properties.

const str = { type: "string" };
const strList = { type: "array", items: str };
const nullableNumber = { anyOf: [{ type: "number" }, { type: "null" }] };

function obj(properties) {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

export const analysisSchema = obj({
  document: obj({
    title: str,
    reference: str,
    document_type: str,
    source_language: str,
  }),
  overview: obj({
    country: str,
    contracting_authority: str,
    funder: str,
    sector: str,
    procurement_method: str,
    contract_type: str,
    duration: str,
    summary: str,
  }),
  deadlines: {
    type: "array",
    items: obj({
      label: str,
      date: str,
      time: str,
      original_text: str,
      source_page: nullableNumber,
    }),
  },
  amounts: {
    type: "array",
    items: obj({
      label: str,
      value: nullableNumber,
      currency: str,
      original_text: str,
      source_page: nullableNumber,
    }),
  },
  scope: strList,
  key_experts: {
    type: "array",
    items: obj({
      position: str,
      qualifications: str,
      person_days: str,
    }),
  },
  eligibility: strList,
  evaluation: obj({
    method: str,
    technical_weight: str,
    financial_weight: str,
    criteria: strList,
  }),
  risks: {
    type: "array",
    items: obj({
      risk: str,
      severity: { type: "string", enum: ["high", "medium", "low"] },
    }),
  },
  open_questions: strList,
  glossary: {
    type: "array",
    items: obj({
      source_term: str,
      translation: str,
      explanation: str,
    }),
  },
  assessment: obj({
    recommendation: { type: "string", enum: ["go", "conditional", "no_go"] },
    rationale: str,
    strengths: strList,
    concerns: strList,
  }),
});
