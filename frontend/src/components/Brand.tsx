import { BookOpenCheck } from "lucide-react";

export function Brand() {
  return (
    <div className="brand" aria-label="Avendia">
      <span className="brand__mark"><BookOpenCheck aria-hidden="true" /></span>
      <span>Avendia</span>
    </div>
  );
}

