import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: 'Emergent Shorts AI | AI YouTube Shorts Generator',
  description: 'Create faceless vertical videos and YouTube Shorts in seconds with Emergent Shorts AI. The ultimate AI video generator for creators and performance marketers.',
  openGraph: {
    title: 'Emergent Shorts AI | AI YouTube Shorts Generator',
    description: 'Create faceless vertical videos and YouTube Shorts in seconds with Emergent Shorts AI. The ultimate AI video generator for creators and marketers.',
    url: 'https://emergentshorts.ai',
    siteName: 'Emergent Shorts AI',
    images: [
      {
        url: 'https://emergentshorts.ai/og.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emergent Shorts AI | AI YouTube Shorts Generator',
    description: 'Create faceless vertical videos and YouTube Shorts in seconds with Emergent Shorts AI.',
  },
};

export function buildSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Emergent Shorts AI',
    operatingSystem: 'Any',
    applicationCategory: 'MultimediaApplication',
    description: 'An AI-powered web-based tool that generates faceless vertical videos for YouTube Shorts and TikTok from text prompts.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };
}

export function buildVideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl,
  };
}
