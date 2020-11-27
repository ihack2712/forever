# forever

A deno function to run a callback forever, until manually cancelled.

## Basic Example

```ts
// Imports
import forever from "https://deno.land/x/forever/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.0/sleep.ts";

const seconds = 1;
const text = "Hello World"

const context = forever(async (_, a, b) => {
	console.log(b);
	await sleep(a);
}, seconds, text);

setTimeout(() => context.cancel(), 5000);
```

## Advanced Example

```ts
// Imports
import forever from "https://deno.land/x/forever/mod.ts";
import { Event } from "https://deno.land/x/subscription/mod.ts";

// Create an interrupted event.
const oninterrupt = new Event();

// Run a function forever without disturbing
// the current context.
const context = forever(async oncancel => {
	// Get the interrupt signal stream from Deno.
	const signal = Deno.signals.interrupt();

	// Subscribe for the cancel event and
	// dispose the signal stream when event is
	// fired.
	oncancel.subscribeOnce(() => signal.dispose());

	try {
		// Get the interruption events.
		for await (const _ of signal)
			// Fire the interruption event.
			await oninterrupt.dispatch();
	} catch (error) { /** */ }
});

// In case the forever function throws, listen
// for any errors by subscribing to the error
// event.
context.onerror.subscribe(console.error);

// Subscribe to the interruption event.
oninterrupt.subscribe(async () => {
	// Print out that the program was interrupted.
	console.log("Interrupted!");

	// Just for testing, set a timeout for 2
	// seconds to cancel the forever function.
	setTimeout(async () => {
		// Cancel.
		await context.cancel();
	}, 2000);
});
```
