import Link, { LinkProps } from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useRef } from 'react';

// Add this at the top for TypeScript
declare global {
  interface Window {
    __nextRouteDonePatched?: boolean;
  }
}

interface AnimatedNavLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  exitDuration?: number;
}

export default function AnimatedNavLink({
  children,
  href,
  className = '',
  style = {},
  onClick,
  exitDuration = 0.3,
  ...props
}: AnimatedNavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // If already on the target page, do nothing
    const target = typeof href === 'string' ? href : href.toString();
    if (pathname === target) return;
    e.preventDefault();
    if (onClick) onClick();
    // Animate exit, then navigate
    const overlay = document.createElement('div');
    overlayRef.current = overlay;
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'black';
    overlay.style.opacity = '0';
    overlay.style.zIndex = '9999';
    overlay.style.transition = `opacity ${exitDuration}s`;
    overlay.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
        <img src='/animated-pokeball.svg' alt='Loading Pokeball' style='width:64px;height:64px;animation:spin 1s linear infinite;' />
      </div>
      <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    // Listen for route change complete
    const removeOverlay = () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
      window.removeEventListener('next-route-done', removeOverlay);
    };
    window.addEventListener('next-route-done', removeOverlay);
    router.push(target);
  };

  // Patch: fire a custom event when Next.js navigation is done
  if (typeof window !== 'undefined' && !window.__nextRouteDonePatched) {
    window.__nextRouteDonePatched = true;
    const origPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const result = origPushState.apply(this, args);
      setTimeout(() => {
        window.dispatchEvent(new Event('next-route-done'));
      }, 0);
      return result;
    };
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        window.dispatchEvent(new Event('next-route-done'));
      }, 0);
    });
  }

  return (
    <Link href={href} {...props} passHref legacyBehavior>
      <a className={className} style={style} onClick={handleClick}>
        {children}
      </a>
    </Link>
  );
}
