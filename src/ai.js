import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your secret key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function matchResumeToJobs(resumeText, jobsList) {
  // We use gemini-1.5-flash because it is lightning fast and great for text processing
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // This is the "Prompt" - we are strictly instructing the AI on how to act
  const prompt = `
    You are an expert IT/CS recruiter. I will provide a candidate's resume/skills and a list of job postings.
    Please evaluate how well the candidate matches EACH job.
    
    Candidate Resume:
    ${resumeText}

    Job Postings:
    ${JSON.stringify(jobsList)}

    Return ONLY a valid JSON array of objects with the following structure for each job. Do not include markdown formatting or backticks like \`\`\`json:
    [
      {
        "job_id": "the id of the job",
        "match_score": 85,
        "reason": "One short, punchy sentence explaining why they match.",
        "missing_skills": "One short sentence noting what they lack (or 'None' if perfect match)."
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response just in case the AI adds markdown blocks
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Matching Error:", error);
    return null;
  }
}
