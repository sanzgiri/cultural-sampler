export type SampleLink = { workId: string; href?: string; label: string; provider: string; kind: 'preview' | 'trailer' | 'book-page'; status: 'available' | 'unavailable'; blurb: string };

export const sampleLinks: SampleLink[] = [
  { workId: 'book-death-of-ivan-ilyich', href: 'https://www.gutenberg.org/ebooks/689', label: 'Read the full authorized text', provider: 'Project Gutenberg', kind: 'book-page', status: 'available', blurb: 'A short, devastating novel about a life interrupted—and the clarity that arrives too late.' },
  { workId: 'music-kind-of-blue', href: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/54/e8/0a/54e80a8b-1d60-6b59-e908-6fd65c4ff783/mzaf_2469862574651846302.plus.aac.p.m4a', label: 'Play a short audio sample', provider: 'Apple / iTunes', kind: 'preview', status: 'available', blurb: 'A spacious, quietly revolutionary jazz album built around listening and response.' },
  { workId: 'film-in-the-mood-for-love', href: 'https://www.themoviedb.org/movie/843-in-the-mood-for-love/videos', label: 'Open official trailer listings', provider: 'TMDB / JustWatch', kind: 'trailer', status: 'available', blurb: 'A restrained, visually exacting story about timing, longing, and what remains unsaid.' },
];

export function sampleLinkFor(workId: string): SampleLink | undefined {
  return sampleLinks.find((sample) => sample.workId === workId);
}
