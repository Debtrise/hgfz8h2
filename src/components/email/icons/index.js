import React from 'react';

const IconWrapper = ({ children, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const TextIcon = () => (
  <IconWrapper>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </IconWrapper>
);

export const HeadingIcon = () => (
  <IconWrapper>
    <path d="M4 6h16M4 12h8M4 18h12" />
  </IconWrapper>
);

export const QuoteIcon = () => (
  <IconWrapper>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </IconWrapper>
);

export const ImageIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </IconWrapper>
);

export const ButtonIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </IconWrapper>
);

export const SpacerIcon = () => (
  <IconWrapper>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </IconWrapper>
);

export const DividerIcon = () => (
  <IconWrapper>
    <line x1="3" y1="12" x2="21" y2="12" />
  </IconWrapper>
);

export const ListIcon = () => (
  <IconWrapper>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </IconWrapper>
);

export const TableIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </IconWrapper>
);

export const VideoIcon = () => (
  <IconWrapper>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </IconWrapper>
);

export const SocialIcon = () => (
  <IconWrapper>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </IconWrapper>
);

export const FormIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="12" y2="16" />
  </IconWrapper>
);

export const MapIcon = () => (
  <IconWrapper>
    <path d="M1 6l8.5-4.5L18 6l-8.5 4.5L1 6z" />
    <path d="M1 6v12l8.5 4.5L18 18V6" />
  </IconWrapper>
);

export const CountdownIcon = () => (
  <IconWrapper>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const ProgressIcon = () => (
  <IconWrapper>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </IconWrapper>
);

export const RatingIcon = () => (
  <IconWrapper>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </IconWrapper>
);

export const AccordionIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </IconWrapper>
);

export const TabsIcon = () => (
  <IconWrapper>
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
  </IconWrapper>
);

export const CarouselIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
  </IconWrapper>
);

export const GalleryIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </IconWrapper>
);

export const MenuIcon = () => (
  <IconWrapper>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconWrapper>
);

export const FooterIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </IconWrapper>
);

export const HeaderIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </IconWrapper>
);

export const BackgroundIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M3 9h18M3 15h18" />
  </IconWrapper>
);

export const BorderIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="6" y="6" width="12" height="12" rx="1" ry="1" />
  </IconWrapper>
);

export const ShadowIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="5" y="5" width="18" height="18" rx="2" ry="2" fill="none" />
  </IconWrapper>
);

export const AnimationIcon = () => (
  <IconWrapper>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </IconWrapper>
);

export const LinkIcon = () => (
  <IconWrapper>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </IconWrapper>
);

export const CodeIcon = () => (
  <IconWrapper>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </IconWrapper>
);

export const TemplateIcon = () => (
  <IconWrapper>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </IconWrapper>
); 