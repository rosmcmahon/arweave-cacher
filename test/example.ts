import * as Cache from '../src/getCache'

const main = async () => {
	Cache.setDebugMessagesOn(true)
	Cache.setHostServer('http://us.perma.online:1984')


	const current = await Cache.getCurrentHeight()

	let bj1 = (await Cache.getBlockDtoByHeight(current))
	console.log('getBlockDtosByHeight', bj1.height)

	let bj2 = await Cache.getBlockDtoById(bj1.indep_hash)
	console.log('getBlockDtoId', bj2.height)

	//only need 1 block index
	let bi = await Cache.getBlockIndex(current)
	console.log('getBlockIndex ' + bi.length + ', ' + bi[0].hash)

	let wallets1 = await Cache.getWalletList(current)
	console.log('getWalletList', wallets1.length)

	let tx1 = await Cache.getTxDto('2ge-rXTTFeMjVEOkb2r3X1ZooyEH4foRI98CbvcimsQ')
	console.log('getTxDto', tx1.id)

	// test a custom storage path
	Cache.setPathPrefix('another-folder')

	console.log('setPathPrefix', (await Cache.getBlockDtoByHeight(531000)).height )

}
main();

