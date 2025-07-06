export class Hash<T extends Record<string, any> = Record<string, any>> {
	#params: Partial<T> = {};

	constructor() {
		window.addEventListener('hashchange', () => this.#reflectHashToParams());
		this.#reflectHashToParams();
	}

	$(param: keyof T): T[keyof T] | undefined;
	$(param: keyof T, value: T[keyof T]): T[keyof T];
	$(param: keyof T, value?: T[keyof T]) {
		if (value !== undefined) {
			this.#params[param] = value;
			this.#reflectParamsToHash();
			return value;
		} else {
			return this.#params[param];
		}
	}

	get params(): Partial<T> {
		return {...this.#params};
	}

	has(param: string) {
		return this.$(param) !== undefined;
	}

	#coerce(value: string): any {
		if (value === 'true') return true;
		if (value === 'false') return false;
		const num = Number(value);
		if (!isNaN(num) && value.trim() !== '') return num;
		return value;
	}

	#reflectHashToParams() {
		console.log('fuck');
		const hash = window.location.hash.startsWith('#')
			? window.location.hash.slice(1)
			: window.location.hash;
		const newParams: Partial<T> = {};

		if (!hash) {
			this.#params = newParams;
			return;
		}

		const parts = hash.split('&');
		for (const part of parts) {
			if (part.includes('=')) {
				const [key, val] = part.split('=');
				newParams[key as keyof T] = this.#coerce(val);
			} else {
				// key without '=', treat as boolean true
				newParams[part as keyof T] = /**/ true /**/ as any;
			}
		}

		this.#params = newParams;
		this.#updateResolvers.forEach((r) => r());
		this.#updateResolvers = [];
	}

	#reflectParamsToHash() {
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
				parts.push(`${key}=${encodeURIComponent(String(value))}`);
			}
			// skip false, null, undefined
		}
		window.location.hash = parts.join('&');
	}

	#updateResolvers: (() => void)[] = [];

	waitForUpdate() {
		return new Promise<void>((resolve) => {
			this.#updateResolvers.push(resolve);
		});
	}
}
