//import * as exitHook from 'exit-hook';
import { CompanionSatelliteClient } from './client'
import { DeviceManager } from './devices'
import { DEFAULT_PORT } from './lib'
import { RestServer } from './rest'
import Conf, { Schema } from 'conf'
import * as path from 'path'

import { TPClient, pluginId } from './tp'


// HAD TO MOVE CONFIG.TS HERE TO AVOID IMPORT ERRORS
// THEY APPEARED FOR NO GOOD REASON

export interface SatelliteConfig {
	remoteIp: string
	remotePort: number

	restEnabled: boolean
	restPort: number
}

export const satelliteConfigSchema: Schema<SatelliteConfig> = {
	remoteIp: {
		type: 'string',
		description: 'Address of Companion installation',
		default: '127.0.0.1',
	},
	remotePort: {
		type: 'integer',
		description: 'Port number of Companion installation',
		minimum: 1,
		maximum: 65535,
		default: 16622,
	},

	restEnabled: {
		type: 'boolean',
		description: 'Enable HTTP api',
		default: true,
	},
	restPort: {
		type: 'integer',
		description: 'Port number of run HTTP server on',
		minimum: 1,
		maximum: 65535,
		default: 9999,
	},
}

export function ensureFieldsPopulated(store: Conf<SatelliteConfig>): void {
	for (const [key, schema] of Object.entries<any>(satelliteConfigSchema)) {
		if (store.get(key) === undefined && schema.default !== undefined) {
			// Ensure values are written to disk
			store.set(key, schema.default)
		}
	}
}

export function openHeadlessConfig(rawConfigPath: string): Conf<SatelliteConfig> {
	const absoluteConfigPath = path.isAbsolute(rawConfigPath) ? rawConfigPath : path.join(process.cwd(), rawConfigPath)

	const appConfig = new Conf<SatelliteConfig>({
		schema: satelliteConfigSchema,
		configName: path.parse(absoluteConfigPath).name,
		projectName: 'TP-Gitago',
		cwd: path.dirname(absoluteConfigPath),
	})
	ensureFieldsPopulated(appConfig)
	return appConfig
}
// END OF CONFIG.TS


const rawConfigPath = process.argv[2]
if (!rawConfigPath) {
	console.log(`
	Usage
	  $ companion-satellite <configuration-path>

	Examples
	  $ companion-satellite config.json
	  $ companion-satellite /home/satellite/.config/companion-satellite.json
`)
	// eslint-disable-next-line no-process-exit
	process.exit(1)
}

const appConfig = openHeadlessConfig(rawConfigPath)

console.log('Starting', appConfig.path)

const webRoot = path.join(__dirname, '../../webui/dist')

const client = new CompanionSatelliteClient({ debug: true })
const devices = new DeviceManager(client)
const server = new RestServer(webRoot, appConfig, client, devices)

client.on('log', (l) => console.log(l))
client.on('error', (e) => console.error(e))

// exitHook(() => {
// 	console.log('Exiting')
// 	client.disconnect()
// 	devices.close().catch(() => null)
// 	server.close()
// })

const tryConnect = () => {
	client.connect(appConfig.get('remoteIp') || '127.0.0.1', appConfig.get('remotePort') || DEFAULT_PORT).catch((e) => {
		console.log(`Failed to connect`, e)
	})
}

// Connecting to TouchPortal
TPClient.connect({ pluginId });

appConfig.onDidChange('remoteIp', () => tryConnect())
appConfig.onDidChange('remotePort', () => tryConnect())

tryConnect()
server.open()

