"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list!");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex border border-obsidian/20 focus-within:border-obsidian transition-colors"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 px-4 py-2.5 text-xs bg-transparent focus:outline-none placeholder:text-obsidian/30"
      />
      <button
        type="submit"
        className="px-4 py-2.5 text-[10px] tracking-[2px] uppercase bg-obsidian text-ivory hover:bg-obsidian/80 transition-colors shrink-0"
      >
        Join
      </button>
    </form>
  );
}
