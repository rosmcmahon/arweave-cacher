import * as Cache from './getCache'

const main = async () => {
	const current = await Cache.getCurrentHeight()

	let bj1 = (await Cache.getBlockDtosByHeight(current))[0]
	console.log('getBlockDtosByHeight', bj1.height)

	let bj2 = await Cache.getBlockDtoId(bj1.indep_hash)
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

	console.log('setPathPrefix', (await Cache.getBlockDtosByHeight(531000))[0].height )

}
main();