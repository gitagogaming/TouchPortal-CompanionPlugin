import { CompanionSatelliteClient } from './client'
import { DeviceId, WrappedDevice } from './device-types/api'
import { wrapAsync } from './lib'




export class DeviceManager {
	private readonly devices: Map<DeviceId, WrappedDevice>
	private readonly pendingDevices: Set<DeviceId>
	private readonly client: CompanionSatelliteClient

	private statusString: string
	//private scanIsRunning = false
	//private scanPending = false

	constructor(client: CompanionSatelliteClient) {
		this.client = client
		this.devices = new Map()
		this.pendingDevices = new Set()

		this.statusString = 'Connecting'

		client.on('connected', () => {
			console.log('connected')

		//	this.showStatusCard('Connected', false)
			

			this.syncCapabilitiesAndRegisterAllDevices()
		})
		client.on('disconnected', () => {
			console.log('disconnected')
//
		//	this.showStatusCard('Connecting', true)
		})
		client.on('connecting', () => {
		//	this.showStatusCard('Connecting', true)
		})


		// Device missing error.. due to device ID we give it..
		client.on(
			'newDevice',
			wrapAsync(
				async (d) => {
					const dev = this.devices.get(d.deviceId)
					if (dev) {
						await dev.deviceAdded()
					} else {
						throw new Error(`Device missing: ${d.deviceId}`)
					}
				},
				(e) => {
					console.error(`Setup device: ${e}`)
				},
			),
		)


		client.on(
			'deviceErrored',
			wrapAsync(
				async (d) => {
					const dev = this.devices.get(d.deviceId)
					if (dev) {
						dev.showStatus(this.client.host, d.message)

						// Try again to add the device, in case we can recover
						this.delayRetryAddOfDevice(d.deviceId)
					} else {
						throw new Error(`Device missing: ${d.deviceId}`)
					}
				},
				(e) => {
					console.error(`Failed device: ${e}`)
				},
			),
		)
	}

	private delayRetryAddOfDevice(deviceId: string) {
		setTimeout(() => {
			const dev = this.devices.get(deviceId)
			if (dev) {
				console.log('try add', deviceId)

				// Make sure device knows what the client is capable of
				dev.updateCapabilities(this.client.capabilities)

				this.client.addDevice(deviceId, dev.productName, dev.getRegisterProps())
			}
		}, 1000)
	}

	public async close(): Promise<void> {
		// usbDetect.stopMonitoring()

		// Close all the devices
		await Promise.allSettled(Array.from(this.devices.values()).map(async (d) => d.close()))
	}


	public syncCapabilitiesAndRegisterAllDevices(): void {
		console.log('registerAll', Array.from(this.devices.keys()))

		let tpDevice = this.client.addDevice("TouchPortal", "TouchPortal Plugin", {
			keysTotal: 32,
			keysPerRow: 8,
			bitmapSize: 128,
			colours: true,
			text: true
		  });

		const keysTotal = 32;
		const keysPerRow = 8;
			
		const gridSize = {
			columns: keysPerRow,
			rows: Math.ceil(keysTotal / keysPerRow),
		};
		console.log("GRID SIZE", gridSize)
		  
	}



















	
	//usb mumbojumbo	usb.on('attach', (dev) => {
	//usb mumbojumbo		if (dev.deviceDescriptor.idVendor === VendorIdElgato) {
	//usb mumbojumbo			this.foundDevice(dev)
	//usb mumbojumbo		} else if (
	//usb mumbojumbo			dev.deviceDescriptor.idVendor === 0xffff &&
	//usb mumbojumbo			(dev.deviceDescriptor.idProduct === 0x1f40 || dev.deviceDescriptor.idProduct === 0x1f41)
	//usb mumbojumbo		) {
	//usb mumbojumbo			this.foundDevice(dev)
	//usb mumbojumbo		} else if (dev.deviceDescriptor.idVendor === VendorIdXencelabs) {
	//usb mumbojumbo			XencelabsQuickKeysManagerInstance.scanDevices().catch((e) => {
	//usb mumbojumbo				console.error(`Quickey scan failed: ${e}`)
	//usb mumbojumbo			})
	//usb mumbojumbo		} else if (
	//usb mumbojumbo			dev.deviceDescriptor.idVendor === VendorIdLoupedeck ||
	//usb mumbojumbo			dev.deviceDescriptor.idVendor === VendorIdRazer
	//usb mumbojumbo		) {
	//usb mumbojumbo			this.foundDevice(dev)
	//usb mumbojumbo		}
	//usb mumbojumbo	})
	//usb mumbojumbo	usb.on('detach', (dev) => {
	//usb mumbojumbo		if (dev.deviceDescriptor.idVendor === 0x0fd9) {
	//usb mumbojumbo			this.removeDevice(dev)
	//usb mumbojumbo		}
	//usb mumbojumbo	})
	//usb mumbojumbo	// Don't block process exit with the watching
	//usb mumbojumbo	usb.unrefHotplugEvents()


	
		//client.on(
	//	'clearDeck',
	//	wrapAsync(
	//		async (d) => {
	//			const dev = this.getDeviceInfo(d.deviceId)
	//			await dev.blankDevice()
	//		},
	//		(e) => {
	//			console.error(`Clear deck: ${e}`)
	//		},
	//	),
	//)


		//private getDeviceInfo(deviceId: string): WrappedDevice {
	//	const dev = this.devices.get(deviceId)
	//	if (!dev) throw new Error(`Missing device for serial: "${deviceId}"`)
	//	return dev
	//}





	//public scanDevices(): void {
	//	if (this.scanIsRunning) {
	//		this.scanPending = true
	//		return
	//	}
//
	//	this.scanIsRunning = true
	//	this.scanPending = false
//
	//	void Promise.allSettled([
	//		HID.devicesAsync()
	//			.then(async (devices) => {
	//				for (const device of devices) {
	//					//const sdInfo = getStreamDeckDeviceInfo(device)
	//					//if (sdInfo && sdInfo.serialNumber) {
	//					//	this.tryAddStreamdeck(sdInfo.path, sdInfo.serialNumber)
	//					// } else if ...
	//					//if (
	//					//	device.path &&
	//					//	device.serialNumber &&
	//					//	device.vendorId === Infinitton.VENDOR_ID &&
	//					//	Infinitton.PRODUCT_IDS.includes(device.productId)
	//					//) {
	//					//	//this.tryAddInfinitton(device.path, device.serialNumber)
	//					//}
	//				}
//
	//				//await XencelabsQuickKeysManagerInstance.openDevicesFromArray(devices)
	//			})
	//			.catch((e) => {
	//				console.error(`HID scan failed: ${e}`)
	//			}),
//
	//	]).finally(() => {
	//		this.scanIsRunning = false
//
	//		if (this.scanPending) {
	//			this.scanDevices()
	//		}
	//	})
	//}

	//private canAddDevice(deviceId: string): boolean {
	//	return !this.pendingDevices.has(deviceId) && !this.devices.has(deviceId)
	//}
//
//
	//private statusCardTimer: NodeJS.Timeout | undefined
	//private showStatusCard(message: string, runLoop: boolean): void {
	//	this.statusString = message
//
	//	if (this.statusCardTimer) {
	//		clearInterval(this.statusCardTimer)
	//		delete this.statusCardTimer
	//	}
//
	//	if (runLoop) {
	//		let dots = ''
	//		this.statusCardTimer = setInterval(() => {
	//			dots += ' .'
	//			if (dots.length > 7) dots = ''
//
	//			this.doDrawStatusCard(message + dots)
	//		}, 1000)
	//	}
//
	//	this.doDrawStatusCard(message)
	//}
//
	//private doDrawStatusCard(message: string) {
	//	for (const dev of this.devices.values()) {
	//		dev.showStatus(this.client.host, message)
	//	}
	//}
}







	//private foundDevice(dev: usb.Device): void {
	//	console.log('Found a device', dev.deviceDescriptor)
//
	//	// most of the time it is available now
	//	this.scanDevices()
	//	// sometimes it ends up delayed
	//	setTimeout(() => this.scanDevices(), 1000)
	//}
//
	//private removeDevice(_dev: usb.Device): void {
	//	// Rescan after a short timeout
	//	// setTimeout(() => this.scanDevices(), 100)
	//	// console.log('Lost a device', dev.deviceDescriptor)
	//	// this.cleanupDeviceById(dev.serialNumber)
	//}
	//private cleanupDeviceById(id: string): void {
	//	const dev2 = this.devices.get(id)
	//	if (dev2) {
	//		// cleanup
	//		this.devices.delete(id)
	//		this.client.removeDevice(id)
	//		try {
	//			dev2.close().catch(() => {
	//				// Ignore
	//			})
	//		} catch (e) {
	//			// Ignore
	//		}
	//	}
	//}


		// dont need to set brightness client.on(
		// dont need to set brightness 	'brightness',
		// dont need to set brightness 	wrapAsync(
		// dont need to set brightness 		async (d) => {
		// dont need to set brightness 			const dev = this.getDeviceInfo(d.deviceId)
		// dont need to set brightness 			await dev.setBrightness(d.percent)
		// dont need to set brightness 		},
		// dont need to set brightness 		(e) => {
		// dont need to set brightness 			console.error(`Set brightness: ${e}`)
		// dont need to set brightness 		},
		// dont need to set brightness 	),
		// dont need to set brightness )



		// this is to draw images I assume onto the device??
		// DRAW ICONS?  client.on(
		// DRAW ICONS?  	'draw',
		// DRAW ICONS?  	wrapAsync(
		// DRAW ICONS?  		async (d) => {
		// DRAW ICONS?  			const dev = this.getDeviceInfo(d.deviceId)
		// DRAW ICONS?  			await dev.draw(d)
		// DRAW ICONS?  		},
		// DRAW ICONS?  		(e) => {
		// DRAW ICONS?  			console.error(`Draw: ${e}`)
		// DRAW ICONS?  		},
		// DRAW ICONS?  	),
		// DRAW ICONS?  )



// private async tryAddDeviceInner(deviceId: string, devInfo: WrappedDevice): Promise<void> {
// 	this.devices.set(deviceId, devInfo)
// 
// 	try {
// 		await devInfo.initDevice(this.client, this.statusString)
// 
// 		devInfo.updateCapabilities(this.client.capabilities)
// 
// 		this.client.addDevice(deviceId, devInfo.productName, devInfo.getRegisterProps())
// 	} catch (e) {
// 		// Remove the failed device
// 		this.devices.delete(deviceId)
// 
// 		throw e
// 	}
// }



//	private tryAddLoupedeck(
//		path: string,
//		serial: string,
//		wrapperClass: new (deviceId: string, device: LoupedeckDevice, cardGenerator: CardGenerator) => WrappedDevice,
//	) {
//		if (this.canAddDevice(serial)) {
//			console.log(`adding new device: ${path}`)
//			console.log(`existing = ${JSON.stringify(Array.from(this.devices.keys()))}`)
//
//			this.pendingDevices.add(serial)
//			openLoupedeck(path)
//				.then(async (ld) => {
//					try {
//						ld.on('error', (err) => {
//							console.error('device error', err)
//							this.cleanupDeviceById(serial)
//						})
//
//						const devInfo = new wrapperClass(serial, ld, this.cardGenerator)
//						await this.tryAddDeviceInner(serial, devInfo)
//					} catch (e) {
//						console.log(`Open "${path}" failed: ${e}`)
//						ld.close().catch(() => null)
//					}
//				})
//				.catch((e) => {
//					console.log(`Open "${path}" failed: ${e}`)
//				})
//				.finally(() => {
//					this.pendingDevices.delete(serial)
//				})
//		}
//	}



//	private tryAddStreamdeck(path: string, serial: string) {
//		if (this.canAddDevice(serial)) {
//			console.log(`adding new device: ${path}`)
//			console.log(`existing = ${JSON.stringify(Array.from(this.devices.keys()))}`)
//
//			this.pendingDevices.add(serial)
//			openStreamDeck(path)
//				.then(async (sd) => {
//					try {
//						sd.on('error', (e) => {
//							console.error('device error', e)
//							this.cleanupDeviceById(serial)
//						})
//
//						const devInfo = new StreamDeckWrapper(serial, sd, this.cardGenerator)
//						await this.tryAddDeviceInner(serial, devInfo)
//					} catch (e) {
//						console.log(`Open "${path}" failed: ${e}`)
//						sd.close().catch(() => null)
//					}
//				})
//				.catch((e) => {
//					console.log(`Open "${path}" failed: ${e}`)
//				})
//				.finally(() => {
//					this.pendingDevices.delete(serial)
//				})
//		}
//	}

	// private getAutoId(path: string, prefix: string): string {
	// 	const val = autoIdMap.get(path)
	// 	if (val) return val

	// 	const nextId = autoIdMap.size + 1
	// 	const val2 = `${prefix}-${nextId.toString().padStart(3, '0')}`
	// 	autoIdMap.set(path, val2)
	// 	return val2
	// }

	//private tryAddQuickKeys(surface: XencelabsQuickKeys): void {
	//	// TODO - support no deviceId for wired devices
	//	if (!surface.deviceId) return
//
	//	try {
	//		const deviceId = surface.deviceId
	//		if (this.canAddDevice(deviceId)) {
	//			console.log(`adding new device: ${deviceId}`)
	//			console.log(`existing = ${JSON.stringify(Array.from(this.devices.keys()))}`)
//
	//			this.pendingDevices.add(deviceId)
//
	//			// TODO - this is race prone..
	//			surface.on('error', (e) => {
	//				console.error('device error', e)
	//				this.cleanupDeviceById(deviceId)
	//			})
//
	//			const devInfo = new QuickKeysWrapper(deviceId, surface)
	//			this.tryAddDeviceInner(deviceId, devInfo)
	//				.catch((e) => {
	//					console.log(`Open "${surface.deviceId}" failed: ${e}`)
	//				})
	//				.finally(() => {
	//					this.pendingDevices.delete(deviceId)
	//				})
	//		}
	//	} catch (e) {
	//		console.log(`Open "${surface.deviceId}" failed: ${e}`)
	//	}
	//}
//
	//private tryAddInfinitton(path: string, serial: string): void {
	//	try {
	//		if (this.canAddDevice(serial)) {
	//			console.log(`adding new device: ${path}`)
	//			console.log(`existing = ${JSON.stringify(Array.from(this.devices.keys()))}`)
//
	//			this.pendingDevices.add(serial)
	//			const panel = new Infinitton(path)
	//			panel.on('error', (e) => {
	//				console.error('device error', e)
	//				this.cleanupDeviceById(serial)
	//			})
//
	//			const devInfo = new InfinittonWrapper(serial, panel, this.cardGenerator)
	//			this.tryAddDeviceInner(serial, devInfo)
	//				.catch((e) => {
	//					console.log(`Open "${path}" failed: ${e}`)
	//					panel.close()
	//				})
	//				.finally(() => {
	//					this.pendingDevices.delete(serial)
	//				})
	//		}
	//	} catch (e) {
	//		console.log(`Open "${path}" failed: ${e}`)
	//	}
	//}