/** @format */

/**
 * Spentria Proof of Work Web Worker
 * Computes SHA-256 PoW: finds a solution where SHA-256(nonce + solution)
 * starts with at least `difficulty` zero bits.
 */

self.onmessage = async function (e) {
	const { nonce, difficulty } = e.data;
	let counter = 0;

	while (true) {
		const solution = counter.toString(16).padStart(16, "0");
		const data = new TextEncoder().encode(nonce + solution);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = new Uint8Array(hashBuffer);

		if (countLeadingZeroBits(hashArray) >= difficulty) {
			self.postMessage({ solution });
			return;
		}

		counter++;

		if (counter % 10000 === 0) {
			self.postMessage({ progress: counter });
		}
	}
};

function countLeadingZeroBits(bytes) {
	let bits = 0;
	for (let i = 0; i < bytes.length; i++) {
		if (bytes[i] === 0) {
			bits += 8;
		} else {
			let byte = bytes[i];
			while ((byte & 0x80) === 0) {
				bits++;
				byte <<= 1;
			}
			break;
		}
	}
	return bits;
}
