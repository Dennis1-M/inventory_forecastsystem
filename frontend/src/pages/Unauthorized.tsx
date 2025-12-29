// src/pages/Unauthorized.tsx
export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
