export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">You’re offline</h1>
        <p className="mt-2 text-sm text-gray-600">
          The calculator works offline. Some updates will appear when you reconnect.
        </p>
      </div>
    </main>
  );
}
