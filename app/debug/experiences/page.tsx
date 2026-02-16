import { notFound } from 'next/navigation';

const GET_EXPERIENCES = `
  query GetExperiences {
    experiences(first: 100) {
      nodes {
        slug
        title
        id
      }
    }
  }
`;

async function getExperiences() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return { error: 'WORDPRESS_GRAPHQL_ENDPOINT not configured' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_EXPERIENCES }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export default async function DebugExperiencesPage() {
  const result = await getExperiences();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Experiences Debug</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p><strong>WORDPRESS_GRAPHQL_ENDPOINT:</strong></p>
        <code className="text-sm">
          {process.env.WORDPRESS_GRAPHQL_ENDPOINT || '(not set)'}
        </code>
      </div>

      {result.error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{result.error}</p>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-4">
            Experiences Found: {result.data?.experiences?.nodes?.length || 0}
          </h2>
          <div className="space-y-2">
            {result.data?.experiences?.nodes?.map((exp: { slug: string; title: string; id: string }) => (
              <div key={exp.id} className="p-3 border rounded">
                <p><strong>Slug:</strong> {exp.slug}</p>
                <p><strong>Title:</strong> {exp.title}</p>
                <p><strong>URL:</strong> <a href={`/experiences/${exp.slug}`} className="text-blue-600 hover:underline">/experiences/{exp.slug}</a></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
