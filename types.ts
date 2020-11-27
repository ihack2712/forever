// Imports
import type { Event } from "./deps.ts";

type AsyncResponse = unknown | Promise<unknown>;

export type OnCancel = Event;
export type OnError = Event<[Error]>;
export type Context = {
	readonly oncancel: OnCancel;
	readonly onerror: OnError;
	readonly cancel: () => AsyncResponse;
};

// deno-lint-ignore no-explicit-any
export type Cancellable<Arguments extends any[]> =
	((oncancel: OnCancel, ...args: Arguments) => AsyncResponse);
