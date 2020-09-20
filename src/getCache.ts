import axios from 'axios'
import { BlockDTO } from './types/dtos/Block.dto'
import fs from 'fs/promises'
import { BlockIndex } from './types/dtos/BlockIndex.dto'
import { WalletList } from './types/dtos/WalletList.dto'
import { TxDTO } from './types/dtos/Tx.dto'

let HOST_SERVER = 'http://eu-west-1.arweave.net:1984' // default node
let PATH_PREFIX = 'arweave-cache/'
const PREDEBUG = '\x1b[34marweave-cacher:\x1b[0m'

export const setPathPrefix = (path: string) => {
	// extremely basic check that we have a folder string
	if(path.charAt(path.length-1) !== '/' ){
		path += '/'
	}
	PATH_PREFIX = path
}

export const setHostServer = (hostString: string) => HOST_SERVER = hostString

export const getCurrentHeight = async () => Number((await axios.get(HOST_SERVER +'/info')).data.height)

const getMatchingFiles = async <T>(partialName: string, path: string): Promise<T[]> => {
	let fileList: string[]
	try{
		fileList = await fs.readdir(path)

		//example filename format: "<height>.<blockid>.json"
		fileList = fileList.filter( fname => {
			let splits = fname.split('.')
			//filter for json files including our name partial
			if( splits.includes(partialName) && (splits[splits.length-1] === 'json') ){
				return fname
			}
		}) 

	} catch(err) {
		if(err.code === 'ENOENT'){
			await fs.mkdir(path, {recursive: true})	//create the path if it does not exist yet
		}
		fileList = []
	}

	if(fileList.length > 0){
		console.debug(PREDEBUG, 'Returning cached file(s): ' + fileList.join(', ')) 

		return Promise.all(
			fileList.map(
				async (filename): Promise<T> => {
					return JSON.parse(await fs.readFile(`${path}${filename}`, 'utf8')) as T
			})
		)
	}

	// no file found
	return []
}

export const getBlockDtosByHeight = async (height: number): Promise<BlockDTO[]> => {
	let heightString = height.toString()
	let path = PATH_PREFIX + 'blocks/'
	let cachedFiles = await getMatchingFiles<BlockDTO>(heightString, path)

	// return cached if *they* are available
	if(cachedFiles.length > 0){
		return cachedFiles
	}

	console.log(PREDEBUG, 'fetching new block by height ', heightString)
	let blockDto: BlockDTO = (await axios.get( HOST_SERVER + '/block/height/' + heightString )).data
	await fs.writeFile(`${path}${blockDto.height}.${blockDto.indep_hash}.json`, JSON.stringify(blockDto))
	return [blockDto]
}

export const getBlockDtoId = async (blockId: string): Promise<BlockDTO> => {
	let path = PATH_PREFIX + 'blocks/'
	let cachedFiles = await getMatchingFiles<BlockDTO>(blockId, path)

	// return cached if it's available
	if(cachedFiles.length > 0){
		return cachedFiles[0]
	}

	console.log(PREDEBUG, 'fetching new block by id ', blockId)
	let blockDto: BlockDTO = (await axios.get( HOST_SERVER + '/block/hash/' + blockId )).data
	await fs.writeFile(`${path}${blockDto.height}.${blockDto.indep_hash}.json`, JSON.stringify(blockDto))
	return blockDto
}

/**
 * 
 * @param minimumHeight the minimum height of the block index list
 */
export const getBlockIndex = async (minimumHeight: number): Promise<BlockIndex> => {
	if(HOST_SERVER === 'https://arweave.net'){
		throw new Error("arweave.net does not serve /hash_list 3-tuples")
	}

	let path = PATH_PREFIX + 'block-indexes/'
	let cachedFiles = await getMatchingFiles<BlockIndex>(minimumHeight.toString(), path) //FIX THIS! We only need 1 list cached

	// return cached if it's available
	if(cachedFiles.length > 0){
		return cachedFiles[0]
	}

	let blockIndex: BlockIndex = (await axios.get( 
		HOST_SERVER + '/hash_list',
		{ headers: { "X-Block-Format": "3" } }
	)).data

	if(!blockIndex[0].hash){
		throw new Error('Error! Incorrect BlockIndex format, blockIndex[0] = ' + blockIndex[0] )
	}

	console.log('fetching new block index for height ', minimumHeight)
	await fs.writeFile(`${path}${blockIndex.length.toString()}.${blockIndex[0].hash}.json`, JSON.stringify(blockIndex))
	return blockIndex
}

export const getWalletList = async (height: number): Promise<WalletList> => {
	let heightString = height.toString()
	let path = PATH_PREFIX + 'wallet-lists/'
	let fileList = await getMatchingFiles<WalletList>(heightString, path)

	// return cached if it's available
	if(fileList.length > 0){
		return fileList[0]
	}

	console.log(PREDEBUG, 'fetching new wallet list for height ', height)
	//arweave.net keeps old lists
	let walletList: WalletList = (await axios.get( 'https://arweave.net' + '/block/height/' + heightString + '/wallet_list' )).data
	await fs.writeFile(`${path}${height}.wallets.json`, JSON.stringify(walletList))
	return walletList
}

export const getTxDto = async (txid: string): Promise<TxDTO> => {
	let path = PATH_PREFIX + 'txs/'
	let fileList = await getMatchingFiles<TxDTO>(txid, path)

	if(fileList.length > 0){
		return fileList[0]
	}

	console.log(PREDEBUG, 'fetching new txDto', txid)
	let txDto: TxDTO = (await axios.get(`${HOST_SERVER}/tx/${txid}`)).data
	await fs.writeFile(`${path}${txDto.id}.json`, JSON.stringify(txDto))
	return txDto
}



