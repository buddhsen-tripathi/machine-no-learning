export default function VisualizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-14 bg-black">
      {children}
    </div>
  );
}
