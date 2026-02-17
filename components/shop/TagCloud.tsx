'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Tag {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

function decodeName(name: string): string {
  return name.replace(/&amp;/g, '&');
}

export default function TagCloud() {
  const [tags, setTags] = useState<Tag[]>([]);
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');

  useEffect(() => {
    async function fetchTags() {
      const res = await fetch('/api/products/tags');
      const data = await res.json();
      if (data.success && Array.isArray(data.tags)) {
        setTags(data.tags);
      }
    }
    fetchTags();
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <h3 className="font-serif text-xl text-dark mb-4">Product tags</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !currentTag
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={!currentTag ? { backgroundColor: 'var(--color-brand)' } : undefined}
        >
          All
        </Link>
        {tags.map((tag) => {
          const isActive = currentTag === String(tag.id);
          return (
            <Link
              key={tag.id}
              href={`/shop?tag=${tag.id}`}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                isActive
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={isActive ? { backgroundColor: 'var(--color-brand)' } : undefined}
            >
              {decodeName(tag.name)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
