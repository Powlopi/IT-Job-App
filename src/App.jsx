import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import PostJob from "./PostJob";
import ResumeMatcher from "./ResumeMatcher";

// NEW: A mini-component just for displaying individual jobs with a Read More toggle
function JobCard({ job }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if the description is long enough to need a "Read more" button
  const isLong = job.description.length > 250;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">
            {job.title}
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs sm:text-sm mt-0.5">
            {job.company}
          </p>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap mt-1 sm:mt-0">
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* UPDATED: We use Tailwind's line-clamp-3 to hide text if it's not expanded */}
      <p
        className={`text-slate-600 dark:text-slate-400 mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${!isExpanded && isLong ? "line-clamp-3 overflow-hidden" : ""}`}
      >
        {job.description}
      </p>

      {/* NEW: The Read More / Show Less button */}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold mt-2 hover:underline cursor-pointer"
        >
          {isExpanded ? "Show less" : "Read more..."}
        </button>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("board"); // 'board', 'post', or 'matcher'

  // UPDATED: Initialize dark mode state based on localStorage or user's system settings
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Fallback: Check if their actual computer/operating system prefers dark mode
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // UPDATED: Sync the theme with the HTML element AND save it to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  // Extracted fetch function so we can reuse it when a new job is posted
  const fetchJobs = async () => {
    setLoading(true);
    // Order by created_at descending so newest jobs are at the top
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 sm:px-8 sticky top-0 z-10 shadow-sm transition-colors duration-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1
            onClick={() => setCurrentView("board")}
            className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight cursor-pointer"
          >
            IT Job Board
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xl p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {session && (
              <>
                {/* AI Match Button */}
                {currentView === "board" && (
                  <button
                    onClick={() => setCurrentView("matcher")}
                    className="text-xs sm:text-sm bg-linear-to-r from-indigo-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  >
                    ✨ AI Match
                  </button>
                )}

                {/*Post Job Button */}
                {currentView === "board" && (
                  <button
                    onClick={() => setCurrentView("post")}
                    className="text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                  >
                    + Post Job
                  </button>
                )}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-xs sm:text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {!session ? (
          <div className="px-1">
            <Auth />
          </div>
        ) : currentView === "post" ? (
          // NEW: Render the PostJob component
          <div className="max-w-2xl mx-auto">
            <PostJob
              onCancel={() => setCurrentView("board")}
              onJobPosted={() => {
                setCurrentView("board");
                fetchJobs(); // Refresh the feed immediately!
              }}
            />
          </div>
        ) : currentView === "matcher" ? ( // NEW BLOCK HERE
          <div className="max-w-3xl mx-auto">
            <ResumeMatcher
              jobs={jobs}
              onCancel={() => setCurrentView("board")}
            />
          </div>
        ) : (
          <>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-700 dark:text-slate-300">
              Latest IT & CS Openings
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-slate-500 text-center py-12 text-sm sm:text-base">
                No jobs found. Be the first to post one!
              </p>
            ) : (
              <div className="grid gap-4">
                {/* FIX: Now it actually calls the JobCard component! */}
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
