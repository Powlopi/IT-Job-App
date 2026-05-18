import { useState } from "react";
import { matchResumeToJobs } from "./ai";

export default function ResumeMatcher({ jobs, onCancel }) {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState(null);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume or skills first!");
      return;
    }
    if (jobs.length === 0) {
      setError("There are no jobs on the board to match against.");
      return;
    }

    setAnalyzing(true);
    setError("");

    // Call our Gemini AI function
    const aiResults = await matchResumeToJobs(resumeText, jobs);

    if (aiResults && Array.isArray(aiResults)) {
      // Merge the AI scores with our actual database jobs
      const enrichedJobs = jobs
        .map((job) => {
          // Match the ID from Supabase to the ID Gemini returned
          const matchData = aiResults.find(
            (r) => String(r.job_id) === String(job.id),
          );
          return { ...job, ...matchData };
        })
        // Remove any jobs Gemini failed to score, and sort highest score first
        .filter((j) => j.match_score !== undefined)
        .sort((a, b) => b.match_score - a.match_score);

      setMatchedJobs(enrichedJobs);
    } else {
      setError("Failed to analyze jobs. Please try again.");
    }

    setAnalyzing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          ✨ AI Resume Matcher
        </h2>
        <button
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          ✕ Close
        </button>
      </div>

      {!matchedJobs ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Paste your resume, LinkedIn bio, or just a list of your technical
            skills below. Our AI will analyze your profile against all open
            positions and find your best fits.
          </p>
          <textarea
            rows="8"
            placeholder="e.g., I am a Full Stack Developer with 3 years of experience in React, Node.js, and PostgreSQL..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full p-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          ></textarea>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            onClick={handleMatch}
            disabled={analyzing}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg font-semibold transition-all disabled:opacity-50 mt-2 cursor-pointer shadow-md"
          >
            {analyzing ? "🧠 Analyzing Profile..." : "Find My Matches"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              Analysis complete! Found {matchedJobs.length} potential matches
              based on your profile.
            </p>
            <button
              onClick={() => setMatchedJobs(null)}
              className="text-xs bg-white dark:bg-slate-700 px-3 py-1.5 rounded shadow-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="grid gap-4">
            {matchedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-0.5">
                      {job.company}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${
                      job.match_score >= 80
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                        : job.match_score >= 60
                          ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          : "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}
                  >
                    {job.match_score}% Match
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Why You Match
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-100 dark:border-slate-700/50">
                      {job.reason}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Missing Skills
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-100 dark:border-slate-700/50">
                      {job.missing_skills}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
