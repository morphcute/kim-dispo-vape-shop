"use client";

import React, { useState, useEffect } from "react";

interface CatalogFormProps {
  fields: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }[];
  onSubmit: (data: Record<string, any>, file?: File | null) => void;
  submitLabel?: string;
  includeFile?: boolean;
  defaultValues?: Record<string, any>;
}

export default function CatalogForm({
  fields,
  onSubmit,
  submitLabel = "Submit",
  includeFile = false,
  defaultValues = {},
}: CatalogFormProps) {
  const [form, setForm] = useState<Record<string, string | number>>(defaultValues);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setForm(defaultValues);
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm text-gray-300 mb-1">{f.label}</label>
          <input
            name={f.name}
            type={f.type || "text"}
            placeholder={f.placeholder}
            value={form[f.name] ?? ""}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
          />
        </div>
      ))}

      {includeFile && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">Poster Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 rounded-lg border border-gray-700 max-h-40 object-contain"
            />
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition"
      >
        {submitLabel}
      </button>
    </form>
  );
}
