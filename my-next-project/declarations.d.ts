/** @format */

declare module "*.png" {
	const content: import("next/dist/client/image").StaticImageData;
	export default content;
}

declare module "*.webp" {
	const content: import("next/dist/client/image").StaticImageData;
	export default content;
}

declare module "*.avif" {
	const content: import("next/dist/client/image").StaticImageData;
	export default content;
}
