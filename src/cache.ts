import crypto from "node:crypto";
import fs from "node:fs";
import nodepath from "node:path";
import { version } from "../package.json";

export const DEFAULT_CACHE_FILE = ".bladeformatter.cache";

// Bump when the on-disk layout changes
const CACHE_FORMAT = 1;

type CacheData = {
	format: number;
	formatterVersion: string;
	hashes: Record<string, string>;
};

/**
 * Remembers which files were already formatted, in the spirit of
 * php-cs-fixer's .php-cs-fixer.cache.
 *
 * Each entry maps a file path to a hash of the file's content together with
 * a signature of the options it was formatted with. A file is skipped when
 * that hash still matches, so editing the file, changing options or
 * upgrading blade-formatter all cause it to be formatted again.
 */
export default class FormatCache {
	private readonly cacheFile: string;
	private readonly baseDir: string;
	private hashes: Record<string, string> = {};
	private dirty = false;

	constructor(cacheFile: string) {
		this.cacheFile = nodepath.resolve(cacheFile);
		this.baseDir = nodepath.dirname(this.cacheFile);
		this.load();
	}

	private load() {
		let data: CacheData;
		try {
			data = JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
		} catch (_error) {
			return;
		}

		if (
			data?.format !== CACHE_FORMAT ||
			data.formatterVersion !== version ||
			typeof data.hashes !== "object"
		) {
			// Stale cache from another version, start over
			this.dirty = true;
			return;
		}

		this.hashes = data.hashes;
	}

	private key(path: string) {
		return nodepath
			.relative(this.baseDir, nodepath.resolve(path))
			.split(nodepath.sep)
			.join("/");
	}

	private static hash(content: string, signature: string) {
		return crypto
			.createHash("sha1")
			.update(signature)
			.update("\0")
			.update(content)
			.digest("hex");
	}

	isFormatted(path: string, content: string, signature: string) {
		return this.hashes[this.key(path)] === FormatCache.hash(content, signature);
	}

	markFormatted(path: string, content: string, signature: string) {
		const hash = FormatCache.hash(content, signature);
		const key = this.key(path);
		if (this.hashes[key] === hash) return;
		this.hashes[key] = hash;
		this.dirty = true;
	}

	forget(path: string) {
		const key = this.key(path);
		if (!(key in this.hashes)) return;
		delete this.hashes[key];
		this.dirty = true;
	}

	/**
	 * Synchronous so it can run from a signal handler.
	 */
	save() {
		if (!this.dirty) return;

		const data: CacheData = {
			format: CACHE_FORMAT,
			formatterVersion: version,
			hashes: this.hashes,
		};
		const tmp = `${this.cacheFile}.${process.pid}.tmp`;
		try {
			fs.writeFileSync(tmp, JSON.stringify(data));
			fs.renameSync(tmp, this.cacheFile);
			this.dirty = false;
		} catch (_error) {
			// A missing cache only costs speed, never fail the run over it
			fs.rmSync(tmp, { force: true });
		}
	}
}

/**
 * Deterministic JSON so the same options always give the same signature.
 */
export function stableStringify(value: unknown): string {
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(",")}]`;
	}
	if (value && typeof value === "object") {
		return `{${Object.keys(value)
			.sort()
			.filter((key) => (value as any)[key] !== undefined)
			.map(
				(key) =>
					`${JSON.stringify(key)}:${stableStringify((value as any)[key])}`,
			)
			.join(",")}}`;
	}
	return JSON.stringify(value) ?? "null";
}
