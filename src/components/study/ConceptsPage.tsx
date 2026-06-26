import type { Concept, Diagram } from "@/lib/types/studyPack";
import ConceptCard from "./ConceptCard";
import DiagramBlock from "./DiagramBlock";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  concepts: Concept[];
  diagram?: Diagram;
}

export default function ConceptsPage({ concepts, diagram }: Props) {
  return (
    <div className="space-y-5 animate-fade-in">
      <SectionHeader
        icon="🧩"
        title="Key Concepts & Tools"
        subtitle="Every important concept from the video — with visuals, examples, and tips."
        count={concepts.length}
      />

      {/* Workflow diagram at the top for context */}
      {diagram && diagram.nodes.length > 0 && (
        <DiagramBlock diagram={diagram} />
      )}

      <div className="space-y-6">
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} />
        ))}
      </div>
    </div>
  );
}
