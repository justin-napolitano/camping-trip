import "./styles.css";

export const metadata = {
  title: "Camping Trip Kits",
  description: "Explainable weekend and backpacking kit bundles."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
