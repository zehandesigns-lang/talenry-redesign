/** Stand-in for a real analytics client: logs what the prototype would measure. */
export function track(event: string, properties: Record<string, unknown> = {}) {
  console.info(`[analytics] ${event}`, properties)
}
