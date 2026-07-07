// The backend wraps list responses as { success, data: [...], pagination: {...} }
// and detail responses either as the raw object or { success, data: {...} }.
// Some DRF defaults (e.g. non-paginated) may return a raw array/object directly.
export function unwrapList(response) {
  const body = response?.data;
  if (Array.isArray(body)) return { results: body, pagination: null };
  if (Array.isArray(body?.data)) return { results: body.data, pagination: body.pagination || null };
  if (Array.isArray(body?.results)) return { results: body.results, pagination: body.pagination || null };
  return { results: [], pagination: null };
}

export function unwrapItem(response) {
  const body = response?.data;
  if (body?.data && typeof body.data === 'object' && !Array.isArray(body.data)) return body.data;
  return body;
}
