interface HashOptions {
	/**
	 * When you change a value (e.g. `hash.$('foo', 'bar')`)
	 * Does it directly reflect in the url's hash?
	 * If set to false, you can call `reflectParamsToHash` manually.
	 *
	 * @default true
	 */
	paramsToHashReflect: boolean;

	/**
	 * When the hash changes in the url, should the new values reflect in this instance?
	 * If true, the object is listening `hashchange` event and will call
	 * `reflectHashToParams()` in the background.
	 *
	 * @default false
	 */
	hashToParamsReflect: boolean;

	/**
	 * Whether to encode when reflecting params to hash
	 *
	 * @default true
	 */
	encode: boolean;
}

export class Hash<T extends Record<string, any> = Record<string, any>> {
	#options: HashOptions;
	#params: Partial<T> = {};

	constructor(options?: Partial<HashOptions>) {
		this.#options = {
			paramsToHashReflect: true,
			hashToParamsReflect: false,
			encode: true,
			...options,
		};
		if (this.#options.hashToParamsReflect) {
			window.addEventListener('hashchange', () => this.reflectHashToParams());
		}
		this.reflectHashToParams();
	}

	$(param: keyof T): T[keyof T] | undefined;
	$(param: keyof T, value: T[keyof T]): T[keyof T];
	$(param: keyof T, value?: T[keyof T]) {
		if (value !== undefined) {
			this.#params[param] = value;
			if (this.#options.paramsToHashReflect) {
				this.reflectParamsToHash();
			}
		} else {
			return this.#params[param];
		}
	}

	get params(): Partial<T> {
		return {...this.#params};
	}

	has(param: keyof T) {
		return this.$(param) !== undefined;
	}

	#coerce(value: string): any {
		if (value === 'true') return true;
		if (value === 'false') return false;
		const num = Number(value);
		if (!isNaN(num) && value.trim() !== '') return num;
		return value;
	}

	reflectHashToParams() {
		const hash = window.location.hash.slice(1);

		const newParams: Partial<T> = {};

		if (!hash) {
			return (this.#params = newParams);
		}

		const parts = hash.split('&');
		for (const part of parts) {
			if (part.includes('=')) {
				const [key, val] = part.split('=');
				newParams[decodeURIComponent(key) as keyof T] = this.#coerce(
					decodeURIComponent(val),
				);
			} else {
				// key without '=', treat as boolean true
				newParams[decodeURIComponent(part) as keyof T] = true as any;
			}
		}

		this.#params = newParams;
	}

	reflectParamsToHash() {
		const parts: string[] = [];
		for (const key in this.#params) {
			const value = this.#params[key];
			if (value === true) {
				// key only, no '='
				parts.push(key);
			} else if (value === false) {
				parts.push(`${key}=false`);
			} else if (value === '') {
				// key with empty string value
				parts.push(`${key}=`);
			} else if (value !== undefined && value !== false && value !== null) {
				const _value = this.#options.encode
					? encodeURIComponent(String(value))
					: String(value);
				parts.push(`${key}=${_value}`);
			}
			// skip false, null, undefined
		}
		window.location.hash = parts.join('&');
	}
}
