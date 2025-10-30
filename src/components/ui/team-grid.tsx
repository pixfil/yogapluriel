"use client";

import { TeamMember } from "@/app/actions/team";
import Image from "next/image";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  members: TeamMember[];
};

export default function TeamGrid({ members }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="group relative"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
            {member.photo_url ? (
              <Image
                src={member.photo_url}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 to-yellow/5 flex items-center justify-center">
                <Users className="w-16 h-16 text-gray-300" />
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-lg mb-1">
                {member.name}
              </h3>
              <p className="text-yellow text-sm font-medium">
                {member.position}
              </p>
              {member.bio && (
                <p className="text-gray-200 text-xs mt-2 line-clamp-3">
                  {member.bio}
                </p>
              )}
            </div>

            {/* Default Name Badge (visible sans hover sur mobile) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 lg:group-hover:opacity-0 transition-opacity">
              <p className="text-white font-semibold text-sm">{member.name}</p>
              <p className="text-yellow text-xs">{member.position}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
