import type { Concept } from "@/lib/types/studyPack";
import ConceptCard from "./ConceptCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  concepts: Concept[];
}

export default function ConceptsPage({ concepts }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <SectionHeader
        icon="🧩"
        title="Key Concepts & Tools"
        subtitle="Every important concept from the video — with explanations, examples, and tips."
        count={concepts.length}
      />
      <div className="space-y-4">
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} />
        ))}
      </div>
    </div>
  );
}
