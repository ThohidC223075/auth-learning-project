import type { ChangeEvent } from "react";

type Props = {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  error,
  placeholder,
  onChange,
}: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full border rounded px-3 py-2 outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}