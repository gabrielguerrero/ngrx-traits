/**
 * Runs `run`, which is expected to start a call and then destroy the injector
 * while it is still in flight, and returns any rxjs EmptyError reported as an
 * unhandled rejection while it did so.
 *
 * The call promises are built with lastValueFrom over a toObservable of the
 * call status, so destroying the injector completes that observable without
 * emitting and rejects the promise. Callers routinely ignore the promise, which
 * is why the traits keep a no-op handler attached to it.
 *
 * zone.js patches Promise, so unhandled rejections surface through its own
 * handler (console.error) rather than process.on('unhandledRejection'), and
 * console.error is swapped rather than spied so this stays free of any test
 * framework globals.
 */
export async function emptyErrorsWhileDestroying(run: () => void) {
  // let rejections left pending by previous tests flush before listening
  await new Promise((resolve) => setTimeout(resolve, 10));
  const originalConsoleError = console.error;
  const captured: unknown[] = [];
  console.error = (...args: unknown[]) => {
    captured.push(...args);
  };
  try {
    run();
    await new Promise((resolve) => setTimeout(resolve, 10));
    return captured.filter((arg) => (arg as Error)?.name === 'EmptyError');
  } finally {
    console.error = originalConsoleError;
  }
}
