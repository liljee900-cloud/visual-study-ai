import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import NodeCard from "@/components/blender/NodeCard";
import { CATEGORY_MAP, BLENDER_CATEGORIES } from "@/lib/blender/categories";
import { NODE_INDEX } from "@/lib/blender/nodes";

export async function generateStaticParams() {
  return BLENDER_CATEGORIES.map(c => ({ slug: c.id }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORY_MAP[slug as keyof typeof CATEGORY_MAP];
  if (!cat) notFound();

  const nodes = NODE_INDEX.filter(n => n.category === slug);
  const isNodeCategory = nodes.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <span className="text-white/60">{cat.name}</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-[#0d1117] to-[#080a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{cat.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{cat.name}</h1>
              <p className="text-white/45 mt-1">{cat.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {cat.topics.map(t => (
              <span key={t} className="text-xs bg-white/5 border border-white/10 text-white/40 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* Nodes */}
        {isNodeCategory && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Nodes in {cat.name} ({nodes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nodes.map(node => <NodeCard key={node.id} node={node} />)}
            </div>
          </section>
        )}

        {/* Topics / Coming soon */}
        {!isNodeCategory && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-4">{cat.icon}</span>
            <h3 className="text-lg font-bold text-white mb-2">{cat.name} Reference</h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-md mx-auto mb-6">
              Detailed reference pages for {cat.name} are being written. Use the AI Topic Generator to get an instant lesson on any {cat.name} topic right now.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {cat.topics.map(t => (
                <span key={t} className="text-xs bg-white/5 border border-white/8 text-white/40 rounded-full px-3 py-1.5">{t}</span>
              ))}
            </div>
            <Link href="/blender" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
              🤖 Generate a Lesson on {cat.name}
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
