export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=100063981547959',
  instagram: 'https://www.instagram.com/tryeno_official',
  x: 'https://x.com/tryeno_official',
  linkedin: 'https://www.linkedin.com/company/tryeno/',
  twitter: 'https://x.com/tryeno_official',
  youtube: 'https://youtube.com/@tryeno',
} as const;

/** Unique platforms shown in the UI (twitter omitted — same URL as x). */
export const SOCIAL_LINK_ITEMS = [
  { id: 'facebook', label: 'Facebook', href: SOCIAL_LINKS.facebook },
  { id: 'instagram', label: 'Instagram', href: SOCIAL_LINKS.instagram },
  { id: 'x', label: 'X', href: SOCIAL_LINKS.x },
  { id: 'linkedin', label: 'LinkedIn', href: SOCIAL_LINKS.linkedin },
  { id: 'youtube', label: 'YouTube', href: SOCIAL_LINKS.youtube },
] as const;
