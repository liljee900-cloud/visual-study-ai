"use client";

import { useState } from "react";
import NodeSVG from "./NodeSVG";
import type { NodeSocket } from "@/lib/blender/types";

interface Props {
  // URL to try first (official Blender docs image)
  src: string | null;
  // Fallback URLs to try in order if src fails
  fallbackUrls?: string[];
  alt: string;
  caption?: string;
  // SVG fallback data (shown if all URLs fail)
  svgNode?: {
    name: string;
    category: string;
    subcategory?: string;
    inputs: NodeSocket[];
    outputs: NodeSocket[];
  };
  className?: string;
}

export default function BlenderDocImage({ src, fallbackUrls = [], alt, caption, svgNode, className }: Props) {
  const allUrls = [src, ...fallbackUrls].filter(Boolean) as string[];
  const [urlIdx, setUrlIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const currentUrl = allUrls[urlIdx];

  function handleError() {
    if (urlIdx < allUrls.length - 1) {
      setUrlIdx(i => i + 1);
    } else {
      setFailed(true);
    }
  }

  return (
    <>
      <figure className={`space-y-2 ${className ?? ""}`}>
        <div className="relative bg-[#141414] border border-white/8 rounded-2xl overflow-hidden group">

          {/* Loading shimmer — visible until image loads */}
          {!failed && !loaded && currentUrl && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/3 via-white/6 to-white/3" />
          )}

          {/* Real image from Blender docs */}
          {!failed && currentUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={alt}
              onLoad={() => setLoaded(true)}
              onError={handleError}
              onClick={() => loaded && setLightbox(true)}
              className={`w-full object-contain transition-opacity duration-300 cursor-zoom-in ${loaded ? "opacity-100" : "opacity-0"}`}
              style={{ maxHeight: 400 }}
            />
          )}

          {/* SVG node fallback */}
          {(failed || !currentUrl) && svgNode && (
            <div className="flex items-center justify-center p-8 min-h-[200px]" onClick={() => setLightbox(true)}>
              <NodeSVG
                name={svgNode.name}
                category={svgNode.category}
                subcategory={svgNode.subcategory}
                inputs={svgNode.inputs}
                outputs={svgNode.outputs}
                width={280}
                className="cursor-zoom-in"
              />
            </div>
          )}

          {/* Zoom hint overlay */}
          {(loaded || ((failed || !currentUrl) && svgNode)) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 text-white/60 text-[9px] px-2 py-1 rounded-md">
                🔍 click to zoom
              </span>
            </div>
          )}

          {/* Source badge */}
          {loaded && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/60 text-white/30 text-[8px] px-2 py-1 rounded-md font-mono">
                docs.blender.org
              </span>
            </div>
          )}
          {(failed || !currentUrl) && svgNode && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/60 text-blue-400/50 text-[8px] px-2 py-1 rounded-md font-mono">
                SVG diagram
              </span>
            </div>
          )}
        </div>

        {caption && (
          <figcaption className="text-[11px] text-white/35 leading-relaxed px-1">
            ↑ {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-5xl w-full max-h-screen overflow-auto" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-2 right-2 z-10 bg-black/60 text-white/60 hover:text-white w-8 h-8 rounded-full flex items-center justify-center text-lg"
            >
              ✕
            </button>
            {loaded && currentUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUrl} alt={alt} className="w-full h-auto rounded-xl" />
            ) : svgNode ? (
              <div className="bg-[#141414] rounded-xl p-12 flex items-center justify-center">
                <NodeSVG
                  name={svgNode.name}
                  category={svgNode.category}
                  subcategory={svgNode.subcategory}
                  inputs={svgNode.inputs}
                  outputs={svgNode.outputs}
                  width={400}
                />
              </div>
            ) : null}
            {caption && (
              <p className="text-center text-sm text-white/50 mt-3">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
