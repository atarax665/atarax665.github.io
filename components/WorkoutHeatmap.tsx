import React, { useMemo } from "react";
import { WorkoutEntry } from "./WorkoutModal";

type WorkoutType = "push" | "pull" | "legs";

const TYPE_COLORS: Record<WorkoutType, string> = {
  push: "bg-sky-300",
  pull: "bg-emerald-300",
  legs: "bg-amber-300",
};

const TYPE_HOVER: Record<WorkoutType, string> = {
  push: "hover:bg-sky-400",
  pull: "hover:bg-emerald-400",
  legs: "hover:bg-amber-400",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type Props = {
  workouts: WorkoutEntry[];
  onWorkoutClick: (workout: WorkoutEntry) => void;
};

export default function WorkoutHeatmap({ workouts, onWorkoutClick }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // date string → full workout entry
  const workoutMap = useMemo(() => {
    const map = new Map<string, WorkoutEntry>();
    workouts.forEach((w) => map.set(w.date, w));
    return map;
  }, [workouts]);

  // Build 52-week grid: Monday of (current week − 51 weeks) → Sunday of current week
  const weeks = useMemo(() => {
    const dow = today.getDay();
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - daysToMonday);

    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - 51 * 7);

    const allWeeks: Date[][] = [];
    const cur = new Date(start);
    for (let w = 0; w < 52; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      allWeeks.push(week);
    }
    return allWeeks;
  }, [today]);

  const stats = useMemo(() => {
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const total = workouts.filter((w) => {
      const d = new Date(w.date + "T00:00:00");
      return d >= oneYearAgo && d <= today;
    }).length;

    const thisMonth = workouts.filter((w) => {
      const d = new Date(w.date + "T00:00:00");
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    const twelveWeeksAgo = new Date(today);
    twelveWeeksAgo.setDate(today.getDate() - 84);
    const last12Count = workouts.filter((w) => {
      const d = new Date(w.date + "T00:00:00");
      return d >= twelveWeeksAgo && d <= today;
    }).length;
    const weeklyAvg = (last12Count / 12).toFixed(1);

    return { total, thisMonth, weeklyAvg };
  }, [workouts, today]);

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-8 mb-6">
        <div>
          <p className="text-xl text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-0.5">sessions this year</p>
        </div>
        <div>
          <p className="text-xl text-gray-900">{stats.thisMonth}</p>
          <p className="text-xs text-gray-400 mt-0.5">this month</p>
        </div>
        <div>
          <p className="text-xl text-gray-900">{stats.weeklyAvg}</p>
          <p className="text-xs text-gray-400 mt-0.5">avg / week</p>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 32 }}>
            {weeks.map((week, i) => {
              const firstDay = week[0];
              const showLabel = firstDay.getDate() <= 7;
              return (
                <div
                  key={i}
                  style={{ width: 14, flexShrink: 0 }}
                  className="text-xs text-gray-400 overflow-visible whitespace-nowrap"
                >
                  {showLabel ? MONTHS[firstDay.getMonth()] : ""}
                </div>
              );
            })}
          </div>

          {/* Day rows: Mon–Sun */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <div key={dayIndex} className="flex items-center">
              <div
                className="text-right pr-2 text-xs text-gray-400 flex-shrink-0 select-none"
                style={{ width: 32, lineHeight: "12px" }}
              >
                {dayIndex % 2 === 0 ? DAY_LABELS[dayIndex] : ""}
              </div>

              {weeks.map((week, weekIndex) => {
                const day = week[dayIndex];
                const dateStr = formatDate(day);
                const entry = workoutMap.get(dateStr);
                const isFuture = day > today;
                const type = entry?.type as WorkoutType | undefined;

                if (isFuture) {
                  return (
                    <div
                      key={weekIndex}
                      className="flex-shrink-0 opacity-0"
                      style={{ width: 12, height: 12, margin: 1 }}
                    />
                  );
                }

                if (type && entry) {
                  return (
                    <button
                      key={weekIndex}
                      title={`${dateStr} · ${type}`}
                      onClick={() => onWorkoutClick(entry)}
                      className={`flex-shrink-0 rounded-sm transition-colors cursor-pointer ${TYPE_COLORS[type]} ${TYPE_HOVER[type]}`}
                      style={{ width: 12, height: 12, margin: 1 }}
                    />
                  );
                }

                return (
                  <div
                    key={weekIndex}
                    title={`${dateStr} · rest`}
                    className="flex-shrink-0 rounded-sm bg-gray-100"
                    style={{ width: 12, height: 12, margin: 1 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <span className="text-xs text-gray-400">Click a session to see exercises.</span>
        <span className="text-xs text-gray-300">·</span>
        {(["push", "pull", "legs"] as WorkoutType[]).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${TYPE_COLORS[type]}`} />
            <span className="text-xs text-gray-500 capitalize">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-gray-100" />
          <span className="text-xs text-gray-500">Rest</span>
        </div>
      </div>
    </div>
  );
}
