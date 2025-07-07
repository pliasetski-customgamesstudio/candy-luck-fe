export abstract class IActionNodeStrategy<TContext> {
  abstract performStrategy(actionContext: TContext): void;
}
