import { Receipt } from "lucide-react";

export default function EmptyState({ icon: Icon = Receipt, title, message, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rise">
      <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      )}
      {children}
    </div>
  );
}
