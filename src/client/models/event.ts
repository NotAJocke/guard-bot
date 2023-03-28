import { type Client } from "./client";

export interface Event {
	exec: (client: Client, ...args: any[]) => void;

	settings: {
		enabled: boolean;
	};
}
