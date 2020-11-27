// Imports
import type { Cancellable, OnCancel, OnError, Context } from "./types.ts";
import { Event } from "./deps.ts";

/**
 * Run a function forever, until specifically cancelled.
 * 
 * **Example**:
 * 
 * ```typescript
 * // Imports
 * import forever from "https://deno.land/x/forever/mod.ts";
 * import { Event } from "https://deno.land/x/subscription/mod.ts";
 * 
 * // Create an interrupted event.
 * const oninterrupt = new Event();
 * 
 * // Run a function forever without disturbing
 * // the current context.
 * const context = forever(async oncancel => {
 *     // Get the interrupt signal stream from Deno.
 *     const signal = Deno.signals.interrupt();
 *     
 *     // Subscribe for the cancel event and
 *     // dispose the signal stream when event is
 *     // fired.
 *     oncancel.subscribeOnce(() => signal.dispose());
 *     
 *     try {
 *         // Get the interruption events.
 *         for await (const _ of signal)
 *             // Fire the interruption event.
 *             await oninterrupt.dispatch();
 *     } catch (error) { }
 * });
 * 
 * // In case the forever function throws, listen
 * // for any errors by subscribing to the error
 * // event.
 * context.onerror.subscribe(console.error);
 * 
 * // Subscribe to the interruption event.
 * oninterrupt.subscribe(async () => {
 *     // Print out that the program was interrupted.
 *     console.log("Interrupted!");
 *     
 *     // Just for testing, set a timeout for 2
 *     // seconds to cancel the forever function.
 *     setTimeout(async () => {
 *         // Cancel.
 *         await context.cancel();
 *     }, 2000);
 * });
 * ```
 * 
 * @param fn The function to run forever.
 * @param args The arguments to pass to the function each time it is called.
 * @returns A context for the forever running function.
 */
// deno-lint-ignore no-explicit-any
export function forever<Arguments extends any[]>(fn: Cancellable<Arguments>, ...args: Arguments) {
	const oncancel: OnCancel = new Event();
	const onerror: OnError = new Event();
	let doRun = true;
	const cancel = (): Promise<void> => {
		if (!doRun) return Promise.resolve();
		doRun = false;
		return new Promise<void>((resolve, reject) => oncancel.dispatch().then(resolve).catch(reject));
	};
	const context: Context = {
		oncancel,
		onerror,
		cancel
	};
	(async () => {
		while (doRun) {
			try {
				await fn(oncancel, ...args);
			} catch (error) {
				await onerror.dispatch(error);
			}
		}
	})();
	return context;
}
