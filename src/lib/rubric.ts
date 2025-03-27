import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_KEY });

async function evaluateTextWithRubric(problem: string, parameters: string, solution: string) {
  try {
    // const prompt = `Evaluate the following text based on the given rubric and provide a numerical score from 0 to 10.

    // Text:
    // """
    // ${text}
    // """

    // Rubric:
    // ${rubric}

    // Provide the score in this format: {"score": X}`;

    const prompt = `For the following problem statement for an ideathon and the submitted idea give a score out of 10 for each of the following parameters:
Parameters: ${parameters}

Problem Statement: ${problem}

Idea: ${solution}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              parameter: {
                type: Type.STRING,
                description: "Name of parameter",
                nullable: false,
              },
              score: {
                type: Type.NUMBER,
                description: "Score out of 10 for the parameter",
                nullable: false,
              },
            },
            required: ["parameter", "score"],
          },
        },
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error parsing response:", error);
    return null;
  }
}

export { evaluateTextWithRubric };
