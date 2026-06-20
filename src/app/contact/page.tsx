"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
          Get in Touch
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-4">
          Contact Us
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-12">
          Have a question about a fragrance, need help with an order, or just
          want to say hello? We would love to hear from you.
        </p>

        {submitted ? (
          <div className="p-12 border border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-serif mb-4">Thank You</p>
            <p className="text-neutral-500 dark:text-neutral-400">
              Your message has been received. We will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-xs uppercase tracking-widest text-neutral-500"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs uppercase tracking-widest text-neutral-500"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="subject"
                className="text-xs uppercase tracking-widest text-neutral-500"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                className="border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-xs uppercase tracking-widest text-neutral-500"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                required
                className="border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="self-start inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Send Message
            </button>
          </form>
        )}

        <div className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-3">Email</h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              hello@zarafragrance.com
            </p>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-3">Location</h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              New York, NY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
