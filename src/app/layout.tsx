import './globals.css';
export const metadata = { title: 'The Weekly Margin', description: 'A small edition of things worth carrying into the week.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
