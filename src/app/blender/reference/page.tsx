import { Suspense } from "react";
import ReferenceContent from "./ReferenceContent";

export default function ReferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080a0f]">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReferenceContent />
    </Suspense>
  );
}
