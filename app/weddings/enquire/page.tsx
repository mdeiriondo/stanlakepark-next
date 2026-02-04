import React from "react";
import WeddingNav from "@/components/layout/WeddingNav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function EnquirePage() {
  return (
    <main className="bg-white min-h-screen text-dark">
      <WeddingNav />

      <div className="max-w-2xl mx-auto pt-48 pb-32 px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif mb-6">Start Your Journey</h1>
          <p className="text-gray-500">
            Tell us about your dream day. Our wedding coordinators will be in
            touch shortly.
          </p>
        </div>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                First Name
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Last Name
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Proposed Date
              </label>
              <input
                type="date"
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent text-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Guest Count (Approx)
              </label>
              <input
                type="number"
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Your Message
            </label>
            <textarea
              rows={4}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-gold transition-colors bg-transparent resize-none"
            ></textarea>
          </div>

          <div className="pt-8 text-center">
            <Button variant="wedding" className="w-full md:w-auto">
              Send Enquiry
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
