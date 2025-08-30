
// This is a MOCK service to simulate calling the Gemini API.
// In a real application, this would use `@google/genai` to make a real API call.

export interface AIFeedback {
  strengths: string;
  recommendations: string;
}

export const getAIFeedbackSuggestion = async (scores: Record<string, number | null>, currentFeedback: { strengths: string, recommendations: string }): Promise<AIFeedback> => {
  console.log("Simulating Gemini API call with scores:", scores);
  console.log("And current feedback:", currentFeedback);

  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not found. Using mock response.');
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mocked response based on some logic
  const totalScore: number = Object.values(scores).reduce((acc: number, score) => acc + (score || 0), 0);
  const maxScore = 80; // 30 + 15 + 35

  let strengths = `Generated Strength:\n- The project demonstrates a clear understanding of the core scientific principles.`;
  let recommendations = `Generated Recommendation:\n- To improve, the team could expand on the data analysis section, perhaps by including statistical significance tests.`;

  if (totalScore > maxScore * 0.8) {
    strengths += `\n- The presentation was exceptionally clear and engaging, showing great enthusiasm.`;
  } else {
    recommendations += `\n- The oral presentation could be more dynamic to better capture the audience's interest.`;
  }

  if (currentFeedback.strengths) {
    strengths = `${currentFeedback.strengths}\n\n${strengths}`;
  }
   if (currentFeedback.recommendations) {
    recommendations = `${currentFeedback.recommendations}\n\n${recommendations}`;
  }


  return {
    strengths,
    recommendations,
  };
};
