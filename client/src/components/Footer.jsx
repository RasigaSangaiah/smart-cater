import { Link } from "react-router-dom";
import { ChefHat, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-stone-200 bg-ink text-stone-300">
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paprika text-cream">
              <ChefHat size={18} />
            </span>
            <span className="font-display text-xl font-semibold text-cream">SmartCater</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            The catering management platform for weddings, receptions, and every celebration in
            between — from menu to menu-card to final plate.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-cream">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/caterers" className="hover:text-turmeric">Find Caterers</Link></li>
            <li><Link to="/how-it-works" className="hover:text-turmeric">How it Works</Link></li>
            <li><Link to="/register" className="hover:text-turmeric">Register as a Caterer</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-cream">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-turmeric">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-turmeric">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-turmeric">Terms &amp; Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-cream">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-stone-400">
            <li className="flex items-center gap-2"><Mail size={15} /> support@smartcater.com</li>
            <li className="flex items-center gap-2"><Phone size={15} /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><MapPin size={15} /> Chennai, Tamil Nadu, India</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-700 pt-6 text-xs text-stone-500 sm:flex-row">
        <p>© {new Date().getFullYear()} SmartCater. All rights reserved.</p>
        <p>Built for weddings, receptions, and everything worth celebrating.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
