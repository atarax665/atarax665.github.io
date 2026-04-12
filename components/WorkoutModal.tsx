import React, { useEffect } from "react";

type WorkoutType = "push" | "pull" | "legs";

export type WorkoutEntry = {
  date: string;
  type: WorkoutType;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  note?: string;
};

export type SessionData = {
  label: string;
  exercises: Exercise[];
};

type Props = {
  workout: WorkoutEntry | null;
  sessions: Record<string, SessionData>;
  onClose: () => void;
};

// Map workout type + day-of-week → session key
// Mon=1 Thu=4 → push_a/push_b  |  Tue=2 Fri=5 → pull_a/pull_b  |  Wed=3 Sat=6 → legs_a/legs_b
const SESSION_KEY: Record<WorkoutType, Record<number, string>> = {
  push: { 1: "push_a", 4: "push_b", 0: "push_a", 2: "push_a", 3: "push_a", 5: "push_b", 6: "push_b" },
  pull: { 2: "pull_a", 5: "pull_b", 0: "pull_a", 1: "pull_a", 3: "pull_a", 4: "pull_b", 6: "pull_b" },
  legs: { 3: "legs_a", 6: "legs_b", 0: "legs_a", 1: "legs_a", 2: "legs_a", 4: "legs_b", 5: "legs_b" },
};

const TYPE_BADGE: Record<WorkoutType, string> = {
  push: "bg-sky-100 text-sky-700",
  pull: "bg-emerald-100 text-emerald-700",
  legs: "bg-amber-100 text-amber-700",
};

export default function WorkoutModal({ workout, sessions, onClose }: Props) {
  useEffect(() => {
    if (!workout) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [workout, onClose]);

  if (!workout) return null;

  const date = new Date(workout.date + "T00:00:00");
  const dow = date.getDay();
  const sessionKey = SESSION_KEY[workout.type]?.[dow] ?? `${workout.type}_a`;
  const session = sessions?.[sessionKey] ?? null;

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_BADGE[workout.type]}`}>
                {workout.type}
              </span>
              {session && (
                <span className="text-xs text-gray-400">{session.label}</span>
              )}
            </div>
            <p className="text-sm text-gray-900">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Exercise table */}
        {session ? (
          <div className="overflow-y-auto flex-1 px-5 py-3">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-normal pb-2.5 pr-4">Exercise</th>
                  <th className="text-right text-xs text-gray-400 font-normal pb-2.5 pr-4 whitespace-nowrap">Sets</th>
                  <th className="text-right text-xs text-gray-400 font-normal pb-2.5 whitespace-nowrap">Reps</th>
                </tr>
              </thead>
              <tbody>
                {session.exercises.map((ex, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-2.5 pr-4">
                      <span className="text-gray-900">{ex.name}</span>
                      {ex.note && (
                        <span className="block text-xs text-gray-400 mt-0.5">{ex.note}</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-500 tabular-nums">{ex.sets}</td>
                    <td className="py-2.5 text-right text-gray-500 tabular-nums whitespace-nowrap">{ex.reps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-400">No session data.</p>
          </div>
        )}

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t border-gray-50">
          <p className="text-xs text-gray-400">Press Esc or click outside to close</p>
        </div>
      </div>
    </div>
  );
}
