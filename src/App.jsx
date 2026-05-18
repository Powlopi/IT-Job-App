import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      // Fetch data from our 'jobs' table in Supabase
      const { data, error } = await supabase.from("jobs").select("*");

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data);
      }
      setLoading(false);
    }

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">
            IT Job Board
          </h1>
          <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
            V1.0 MVP
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-6 text-slate-700">
          Latest IT & CS Openings
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-slate-500 text-center py-12">
            No jobs found. Try inserting one in Supabase!
          </p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer">
                      {job.title}
                    </h3>
                    <p className="text-indigo-600 font-medium text-sm mt-1">
                      {job.company}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-4 text-sm leading-relaxed line-clamp-3">
                  {job.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
