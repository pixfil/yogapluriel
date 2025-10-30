import React from 'react';

interface BulkSelectCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function BulkSelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
}: BulkSelectCheckboxProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 rounded border-gray-300 text-yellow focus:ring-yellow cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
