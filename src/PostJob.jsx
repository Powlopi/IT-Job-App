import { useState } from "react";
import { supabase } from "./supabase";

export default function PostJob({ onJobPosted, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Insert the new job into the Supabase 'jobs' table
    const { error: insertError } = await supabase
      .from("jobs")
      .insert([{ title, company, description }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      // Clear the form and tell the main app to go back to the job board
      setLoading(false);
      onJobPosted();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Post a New Job
        </h2>
        <button
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          ✕ Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Senior React Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Company Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. TechFlow Innovations"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Description
          </label>
          <textarea
            required
            rows="5"
            placeholder="Describe the role, requirements, and tech stack..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          ></textarea>
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? "Publishing..." : "Publish Job Listing"}
        </button>
      </form>
    </div>
  );
}
