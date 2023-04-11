export function isNumber(text: string): boolean {
	const regex = /^\d+$/;
	return regex.test(text);
}
