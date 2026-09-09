import { env } from '@/config/env';

let bearerToken = '';

export function setGraphqlBearerToken(token: string) {
  bearerToken = token;
}

export async function graphqlRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(env.magentoGraphqlUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(env.magentoStoreCode !== 'default' ? { store: env.magentoStoreCode } : {}),
        ...(bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
    if (!response.ok || payload.errors?.length || !payload.data) {
      throw new Error(payload.errors?.map(item => item.message).join('\n') ?? `GraphQL request failed (${response.status})`);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Adobe Commerce took too long to respond.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
