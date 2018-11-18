import { Colors, util } from 'klasa';
import { DashboardClient, DashboardClientOptions } from 'klasa-dashboard-hooks';
import { Node } from 'veza';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
import { PresenceType } from './util/constants';
import { createArray } from './util/util';

const g = new Colors({ text: 'green' }).format('[IPC   ]');
const y = new Colors({ text: 'yellow' }).format('[IPC   ]');
const r = new Colors({ text: 'red' }).format('[IPC   ]');

export class EvlynClient extends DashboardClient {

	public options: Required<EvlynClientOptions>;
	public ipcMonitors = new IPCMonitorStore(this);
	public statistics = {
		aelia: createArray<ClientStatistics[]>(60, () => []),
		alestra: createArray<ClientStatistics[]>(60, () => []),
		evlyn: createArray<ClientStatistics[]>(60, () => []),
		skyra: createArray<ClientStatistics[]>(60, () => [])
	};
	public ipc = new Node('evlyn-master')
		.on('client.identify', (client) => { this.console.log(`${g} Client Connected: ${client.name}`); })
		.on('client.disconnect', (client) => { this.console.log(`${y} Client Disconnected: ${client.name}`); })
		.on('client.destroy', (client) => { this.console.log(`${y} Client Destroyed: ${client.name}`); })
		.on('server.ready', (server) => { this.console.log(`${g} Client Ready: Named ${server.name}`); })
		.on('error', (error, client) => { this.console.error(`${r} Error from ${client.name}`, error); })
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public constructor(options: EvlynClientOptions) {
		super(util.mergeDefault({ dev: false }, options));
		this.registerStore(this.ipcMonitors);
	}

}

EvlynClient.defaultPermissionLevels.add(0, (client, message) => message.author.id === client.options.ownerID, { break: true });

/**
 * The client options for Evlyn
 */
export type EvlynClientOptions = DashboardClientOptions & { dev?: boolean };

/**
 * The client statistics for each shard
 */
export type ClientStatistics = {
	presence: PresenceType;
	status: WebsocketStatus;
	heapUsed: number;
	heapTotal: number;
	ping: number[];
};

/**
 * The websocket status
 */
export enum WebsocketStatus {
	/**
	 * The websocket is active
	 */
	Ready,
	/**
	 * The websocket is connecting
	 */
	Connecting,
	/**
	 * The websocket is reconnecting
	 */
	Reconnecting,
	/**
	 * The websocket is idle
	 */
	Idle,
	/**
	 * The websocket is nearly ready, fetching last data
	 */
	Nearly,
	/**
	 * The websocket is disconnected
	 */
	Disconnected
}