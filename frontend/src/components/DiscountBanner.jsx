import { Tag } from "lucide-react";

export default function DiscountBanner({ total }) {
  if (total === 0) return null;
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-2">
      <Tag size={16} className="text-orange-500" />
      <p className="text-sm text-orange-700">
        AI discount engine will apply your personalised discount at checkout!
      </p>
    </div>
  );
}
