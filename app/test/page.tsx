export default function TestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Next.js is Working!</h1>
        <p className="text-muted-foreground">Your GCP Quest Dashboard is ready.</p>
        <div className="flex gap-4 justify-center mt-8">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Framework</p>
            <p className="font-bold">Next.js 16</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">React</p>
            <p className="font-bold">v19</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">TypeScript</p>
            <p className="font-bold">v5.7</p>
          </div>
        </div>
        <div className="mt-8">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
