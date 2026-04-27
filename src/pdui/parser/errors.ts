export class PduiParseError extends Error {
  constructor(
    public readonly path: string,
    public readonly received: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'PduiParseError';
  }
}
