import {Hash} from './Hash.js';
import {installRouter} from './installRouter.js';

type LocationUpdateCallback = (params: {
	location: Location;
	event: Event | null;
	// hash: Hash;
	parts: Readonly<string[]>;
}) => void | Promise<void>;

export class Router {
	#firstCall = true;
	#navigationPromiseWithResolvers!: PromiseWithResolvers<void>;
	// #hash: Hash;
	get navigationComplete() {
		return this.#navigationPromiseWithResolvers.promise;
	}
	#newPromise() {
		this.#navigationPromiseWithResolvers = Promise.withResolvers();
	}
	/**
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !! Just so you know, Anchor clicks won't trigger 'hashchange' events........
	 * !! even if the href explicitely changes the hash !!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 */
	constructor(
		protected callback: LocationUpdateCallback,
		// hash?: Hash<any>,
	) {
		// this.#hash = hash ?? new Hash();
		this.#newPromise(); // Just to make sure an initial promise is available.
		installRouter(async (location, event) => {
			if (!this.#firstCall) {
				// this.#navigationPromiseWithResolvers?.reject(); // Reject just in case, does nothing if already resolved.
				this.#newPromise();
			} else {
				this.#firstCall = false;
			}

			// if (event && event.type === 'popstate') {
			// 	await waitForNextHashChange();
			// }

			const parts = this.parts;

			await callback({location, event /*hash: this.#hash*/, parts});
			this.#navigationPromiseWithResolvers.resolve();
		});
	}

	get parts(): Readonly<string[]> {
		return window.location.pathname.split(/\//).filter((i) => i);
	}
}

// function waitForNextHashChange(): Promise<void> {
// 	return new Promise((resolve) => {
// 		const handler = () => {
// 			window.removeEventListener('hashchange', handler);
// 			setTimeout(resolve, 0); // ensure all listeners finished
// 		};
// 		window.addEventListener('hashchange', handler);
// 	});
// }
