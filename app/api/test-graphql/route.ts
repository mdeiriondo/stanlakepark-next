import { NextResponse } from 'next/server';

const TEST_QUERY = `
  query TestQuery {
    __schema {
      types {
        name
      }
    }
  }
`;

const GET_EXPERIENCES_TEST = `
  query GetExperiencesTest {
    experiences(first: 10) {
      nodes {
        slug
        title
      }
    }
  }
`;

export async function GET() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  
  if (!endpoint) {
    return NextResponse.json({
      error: 'WORDPRESS_GRAPHQL_ENDPOINT not configured',
      endpoint: null,
    }, { status: 500 });
  }

  try {
    // Test 1: Verificar que el endpoint responde
    const schemaResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: TEST_QUERY }),
    });

    const schemaData = await schemaResponse.json();
    
    // Test 2: Intentar obtener experiences
    const experiencesResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_EXPERIENCES_TEST }),
    });

    const experiencesData = await experiencesResponse.json();

    // Buscar tipos relacionados con "experience"
    const experienceTypes = schemaData.data?.__schema?.types?.filter((type: { name: string }) => 
      type.name.toLowerCase().includes('experience')
    ) || [];

    return NextResponse.json({
      success: true,
      endpoint,
      schemaStatus: schemaResponse.status,
      schemaOk: schemaResponse.ok,
      experiencesStatus: experiencesResponse.status,
      experiencesOk: experiencesResponse.ok,
      schemaErrors: schemaData.errors,
      experiencesErrors: experiencesData.errors,
      experienceTypes: experienceTypes.map((t: { name: string }) => t.name),
      experiencesCount: experiencesData.data?.experiences?.nodes?.length || 0,
      sampleExperiences: experiencesData.data?.experiences?.nodes?.slice(0, 3) || [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint,
    }, { status: 500 });
  }
}
