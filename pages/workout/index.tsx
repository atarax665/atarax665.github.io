import React, { useState } from "react";
import { promises as fs } from "fs";
import path from "path";
import MainLayout from "../../layouts/MainLayout";
import WorkoutHeatmap from "../../components/WorkoutHeatmap";
import WorkoutModal, { WorkoutEntry, SessionData } from "../../components/WorkoutModal";
import { getSidebarData, getPageContent, Page } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";

type PREntry = {
  lift: string;
  unit: string;
  start: number;
  current: number;
  goal: number;
  entries: { date: string; weight: number }[];
};

type WorkoutData = {
  sessions: Record<string, SessionData>;
  workouts: WorkoutEntry[];
  prs: PREntry[];
};

const PHILOSOPHY = [
  {
    title: "Powerlifting base",
    body: "Every program centres on the squat, bench, and deadlift. Accessory work exists to support the competition lifts — not the other way around.",
  },
  {
    title: "Progressive overload",
    body: "Small, deliberate increases beat random effort. Every session is logged. If a number doesn't move over three weeks, something changes.",
  },
  {
    title: "Deload without guilt",
    body: "Every fourth week is a planned deload — lower volume, same intensity. Adaptation happens during recovery, not just during the work.",
  },
  {
    title: "Consistency over intensity",
    body: "Six predictable days a week at 80% beats three heroic days at 100%. The heatmap above is the only vanity metric that matters.",
  },
];

export async function getStaticProps() {
  const [sidebarData, pageContent] = await Promise.all([
    getSidebarData(),
    getPageContent("workout"),
  ]);

  const dataPath = path.join(process.cwd(), "public", "data", "workouts.json");
  const raw = await fs.readFile(dataPath, "utf8");
  const workoutData: WorkoutData = JSON.parse(raw);

  return {
    props: { sidebarData, pageContent, workoutData },
  };
}

export default function Workout({
  sidebarData,
  pageContent,
  workoutData,
}: {
  sidebarData: SidebarData;
  pageContent: Page;
  workoutData: WorkoutData;
}) {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntry | null>(null);

  return (
    <MainLayout sidebarData={sidebarData}>
      <div className="max-w-3xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-lg text-gray-900 mb-1">{pageContent.meta.title}</h1>
          <p className="text-sm text-gray-500">{pageContent.meta.description}</p>
        </div>

        {/* Consistency */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-4">Consistency</h2>
          <WorkoutHeatmap
            workouts={workoutData.workouts}
            onWorkoutClick={setSelectedWorkout}
          />
        </section>

        {/* Strength Progress */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-4">Strength Progress</h2>
          <div className="space-y-5">
            {workoutData.prs.map((pr) => {
              const range = pr.goal - pr.start;
              const gained = pr.current - pr.start;
              const progressPct = Math.min(100, Math.max(0, (gained / range) * 100));
              const remaining = pr.goal - pr.current;

              return (
                <div key={pr.lift}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm text-gray-900">{pr.lift}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-900">
                        {pr.current} {pr.unit}
                      </span>
                      <span className="text-xs text-gray-400">
                        / {pr.goal} {pr.unit} goal
                      </span>
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gray-800 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {pr.start} {pr.unit} start
                    </span>
                    <span className="text-xs text-gray-400">
                      +{gained} {pr.unit} gained · {remaining} {pr.unit} to go
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Training Philosophy */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-4">Training Philosophy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PHILOSOPHY.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-lg p-4"
              >
                <p className="text-sm text-gray-900 mb-1.5">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-100 mb-8" />

        {/* Routine — markdown content */}
        <div className="prose prose-gray max-w-none">
          <div dangerouslySetInnerHTML={{ __html: pageContent.renderedContent }} />
        </div>

        {pageContent.meta.lastUpdated && (
          <div className="mt-8 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date(pageContent.meta.lastUpdated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Session modal */}
      <WorkoutModal
        workout={selectedWorkout}
        sessions={workoutData.sessions}
        onClose={() => setSelectedWorkout(null)}
      />
    </MainLayout>
  );
}
