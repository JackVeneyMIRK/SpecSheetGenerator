import './globals.css';

export const metadata = {
  title: 'Spec Sheet Generator',
  description: 'Multi-tenant equipment spec sheet dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
