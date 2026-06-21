"use client";

import { useState } from "react";

/** Simple contact form page with name, email, and message fields.
 *  Currently displays a static form that prevents default submission — a
 *  backend handler (e.g. email API or database insert) can be wired in later. */
export default function ContactPage() {
  // Form field state — one piece of state per input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        {/* Section heading and introductory copy */}
        <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
          Get in Touch
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-4">
          Contact Us
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-16 max-w-2xl">
          Have a question about a fragrance, need help with an order, or just
          want to say hello? We would love to hear from you.
        </p>

        {/* Contact form — preventDefault currently keeps it client-only */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Name input field */}
          <div className="md:col-span-2 md:col-span-1">
            <label htmlFor="name" className="block text-sm uppercase tracking-widest mb-2 text-neutral-500">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
            />
          </div>
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-sm uppercase tracking-widest mb-2 text-neutral-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
            />
          </div>
          {/* Message textarea — spans both columns on larger screens */}
          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-sm uppercase tracking-widest mb-2 text-neutral-500">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors resize-none"
            />
          </div>
          {/* Submit button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
