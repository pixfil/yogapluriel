"use client";

import { UserRole, ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions";

type RoleBadgeProps = {
  role: UserRole;
  size?: "sm" | "md" | "lg";
};

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role];
  const label = ROLE_LABELS[role];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}

type MultiRoleBadgesProps = {
  roles: UserRole[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
};

export function MultiRoleBadges({ roles, size = "md", maxDisplay }: MultiRoleBadgesProps) {
  const displayRoles = maxDisplay ? roles.slice(0, maxDisplay) : roles;
  const remaining = maxDisplay && roles.length > maxDisplay ? roles.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-1">
      {displayRoles.map((role) => (
        <RoleBadge key={role} role={role} size={size} />
      ))}
      {remaining > 0 && (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 ${
            size === "sm" ? "px-2 py-0.5 text-xs" : size === "md" ? "px-3 py-1 text-sm" : "px-4 py-1.5 text-base"
          }`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
