import { ParsedIntent, QueryPerspective, AgentContext } from '../../shared/types/agents';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for perspectives

export class PerspectiveAgent {
  constructor() {
    console.log("PerspectiveAgent initialized");
  }

  generatePerspectives(intent: ParsedIntent, context: AgentContext): QueryPerspective[] {
    const perspectives: QueryPerspective[] = [];
    // const now = new Date(); // For consistent IDs or timestamps if needed - not used in current logic

    // 1. Analytics & Aggregation Perspective
    if (intent.analysisType === 'aggregation' || intent.analysisType === 'analytics') {
      perspectives.push({
        id: uuidv4(),
        name: "Data Aggregation / Statistical Analysis",
        description: "Focuses on aggregating data and providing counts or statistics based on the query.",
        approach: 'analytics',
        reasoning: "The user's query or parsed intent explicitly asks for data analysis or counts.",
        confidence: 0.9, // High confidence if explicitly stated
        estimatedComplexity: 3, // Medium to High
      });
    }

    // 2. Direct Entity Search (if not primarily aggregation)
    //    Consider if there are specific, high-confidence entities.
    const hasSpecificEntities = 
      (intent.entities.jobTitles && intent.entities.jobTitles.length > 0) ||
      (intent.entities.companies && intent.entities.companies.length > 0) ||
      (intent.entities.locations && intent.entities.locations.length === 1); // e.g., single specific location

    if (intent.analysisType === 'search' && hasSpecificEntities && intent.confidence > 0.7) {
      perspectives.push({
        id: uuidv4(),
        name: "Targeted Search",
        description: "Focuses on finding documents that precisely match the identified key entities like job titles, companies, and locations.",
        approach: 'exact_match',
        reasoning: "High confidence in parsed entities suggests the user is looking for specific items.",
        confidence: 0.85 * intent.confidence, // Modulate by intent confidence
        estimatedComplexity: 2, // Low to Medium
      });
    }

    // 3. Broad Skills Search (if skills are present and it's a search)
    if (intent.analysisType === 'search' && intent.entities.skills && intent.entities.skills.length > 0) {
      let skillConfidence = 0.75;
      let skillReasoning = "User input emphasizes skills, suggesting a need to search within larger text fields like job descriptions.";
      if (perspectives.some(p => p.approach === 'exact_match')) {
        skillConfidence = 0.65; // Slightly less confident if an exact match perspective already exists
        skillReasoning += " This perspective offers a broader match as an alternative or supplement.";
      }
      perspectives.push({
        id: uuidv4(),
        name: "Skills-Focused Search",
        description: "Prioritizes matching specified skills, potentially using broader search techniques for job descriptions.",
        approach: 'fuzzy_search', // Or a mix depending on QueryBuilder
        reasoning: skillReasoning,
        confidence: skillConfidence * intent.confidence,
        estimatedComplexity: 3, // Medium
      });
    }
    
    // 4. Location-Centric Search (if locations are prominent)
    // Added check to ensure it doesn't duplicate if "Targeted Search" already covers a single specific location.
    if (intent.analysisType === 'search' && 
        intent.entities.locations && 
        intent.entities.locations.length > 0 && 
        !perspectives.some(p => p.name === "Targeted Search" && intent.entities.locations?.length === 1)) {
        perspectives.push({
            id: uuidv4(),
            name: "Location Focused Search",
            description: "Prioritizes job listings based on the specified geographical locations.",
            approach: 'exact_match', // Can be fuzzy too depending on query builder
            reasoning: "User has specified location criteria. This offers a location-primary view.",
            confidence: 0.7 * intent.confidence,
            estimatedComplexity: 2,
        });
    }

    // 5. Trend Analysis (if date ranges are specified) - simple version
    if (intent.entities.dateRanges && intent.entities.dateRanges.length > 0 && (intent.analysisType === 'search' || intent.analysisType === 'analytics')) {
        perspectives.push({
            id: uuidv4(),
            name: "Time-Based Trend Search",
            description: "Analyzes data over the specified time period. Useful for identifying trends or patterns if combined with aggregations or specific keywords.",
            approach: 'trend_analysis', // This may signal QueryBuilder to use date fields prominently
            reasoning: "User has specified date ranges, implying an interest in time-sensitive data or trends.",
            confidence: 0.6 * intent.confidence,
            estimatedComplexity: 3,
        });
    }

    // Fallback: Generic Search Perspective if no other perspective fits well for 'search' type
    if (intent.analysisType === 'search' && perspectives.length === 0) {
      perspectives.push({
        id: uuidv4(),
        name: "General Search",
        description: "A general search approach based on the overall user query.",
        approach: 'fuzzy_search', // Default to fuzzy for general queries
        reasoning: "No specific strong signals for other perspectives; applying a general search strategy.",
        confidence: 0.5 * intent.confidence,
        estimatedComplexity: 2,
      });
    }
    
    // Limit to max 3 perspectives, prioritizing higher confidence
    // (A more sophisticated ranking could be done here)
    const sortedPerspectives = perspectives.sort((a, b) => b.confidence - a.confidence);
    
    if (context.debugMode) { // Added debug logging
        console.log(`PerspectiveAgent: Generated ${perspectives.length} initial perspectives.`);
        perspectives.forEach(p => console.log(`Perspective: ${p.name}, Confidence: ${p.confidence.toFixed(2)}`));
        console.log(`PerspectiveAgent: Returning top ${Math.min(3, sortedPerspectives.length)} perspectives after sorting.`);
    }
    
    return sortedPerspectives.slice(0, 3);
  }
}
