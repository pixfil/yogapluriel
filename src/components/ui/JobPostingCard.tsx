"use client";

import { useState } from "react";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import dynamic from "next/dynamic";

const JobApplicationModal = dynamic(() => import('./JobApplicationModal'), {
  ssr: false,
});

interface JobPostingCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    contract_type?: string | null;
  };
  index: number;
}

export default function JobPostingCard({ job, index }: JobPostingCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <AnimatedSection delay={0.1 * (index + 1)}>
        <GlassCard className="p-6 bg-gradient-to-br from-yellow/10 to-yellow/5 border-2 border-yellow/20 hover:border-yellow/40 transition-colors h-full flex flex-col">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              {job.title}
            </h3>
            {job.contract_type && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-3">
                {job.contract_type}
              </span>
            )}
            <p className="text-gray-700 mb-4 line-clamp-4">
              {job.description.split('\n\n')[0]}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full mt-4 px-4 py-2 bg-yellow hover:bg-yellow/90 text-black font-semibold rounded-lg transition-colors"
          >
            Postuler
          </button>
        </GlassCard>
      </AnimatedSection>

      {showModal && (
        <JobApplicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          jobId={job.id}
          jobTitle={job.title}
        />
      )}
    </>
  );
}
