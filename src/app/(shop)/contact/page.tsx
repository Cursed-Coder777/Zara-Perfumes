"use client";

import { useState } from "react";
import { usePageTitle } from "~/lib/use-page-title";

/** Simple contact form page with name, email, and message fields.
 *  Currently displays a static form that prevents default submission — a
 *  backend handler (e.g. email API or database insert) can be wired in later. */
export default function ContactPage() {
  usePageTitle("Contact");
  // Form field state — one piece of state per input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="px-6 pt-32 pb-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        {/* Section heading and introductory copy */}
        <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">Get in Touch</p>
        <h1 className="mb-4 font-serif text-4xl leading-tight tracking-tight md:text-6xl">
          Contact Us
        </h1>
        <p className="mb-16 max-w-2xl leading-relaxed text-neutral-500 dark:text-neutral-400">
          Have a question about a fragrance, need help with an order, or just want to say hello? We
          would love to hear from you.
        </p>

        {/* Contact form — preventDefault currently keeps it client-only */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Name input field */}
          <div className="md:col-span-1 md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm tracking-widest text-neutral-500 uppercase"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-neutral-300 bg-transparent px-4 py-3 text-sm transition-colors focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-50"
            />
          </div>
          {/* Email input field */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm tracking-widest text-neutral-500 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 bg-transparent px-4 py-3 text-sm transition-colors focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-50"
            />
          </div>
          {/* Message textarea — spans both columns on larger screens */}
          <div className="md:col-span-2">
            <label
              htmlFor="message"
              className="mb-2 block text-sm tracking-widest text-neutral-500 uppercase"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none border border-neutral-300 bg-transparent px-4 py-3 text-sm transition-colors focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-50"
            />
          </div>
          {/* Submit button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-neutral-950 px-8 py-3 text-sm font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
