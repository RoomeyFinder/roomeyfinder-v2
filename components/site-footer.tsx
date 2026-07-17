import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/contact" },
  { label: "Terms & conditions", href: "/terms-and-conditions" },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-5 py-10 text-sm">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col">
            <Link href="/" aria-label="RoomeyFinder home">
              <BrandLogo />
            </Link>
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="mailto:support@roomeyfinder.com"
            >
              support@roomeyfinder.com
            </a>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            {navigationLinks.map((link) => (
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/privacy"
            >
              Privacy policy
            </Link>
          </nav>
        </div>

        <div className="flex justify-between border-t pt-6">
          <div className="text-xs text-muted-foreground">
            <p>© 2026 Roomeyfinder, Inc.</p>
          </div>
          <nav aria-label="Social links" className="flex items-center gap-4">
            <a
              aria-label="Facebook"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="https://web.facebook.com/roomeyfinder"
              rel="noreferrer"
              target="_blank"
            >
              <Facebook aria-hidden="true" className="size-4" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              aria-label="Instagram"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="https://www.instagram.com/roomeyfinder"
              rel="noreferrer"
              target="_blank"
            >
              <Instagram aria-hidden="true" className="size-4" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              aria-label="X (formerly Twitter)"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="https://twitter.com/roomeyfinder"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.964 6.817H1.684l7.73-8.835L1.258 2.25H8.084l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
              <span className="sr-only">X (formerly Twitter)</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
