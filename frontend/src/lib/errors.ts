/** A readable message from anything that was thrown. */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}