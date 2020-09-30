import axios from 'axios'
import fs from 'fs/promises'
import isValid from 'is-valid-path'
import { BlockDTO } from './types/dtos/Block.dto'
import { BlockIndexDTO } from './types/dtos/BlockIndex.dto'
import { WalletListDTO } from './types/dtos/WalletList.dto'
import { TxDTO } from './types/dtos/Tx.dto'

const PREDEBUG = '\x1b[34m'+'arweave-cacher:'+'\x1b[0m'

/**
 * Configurabe parameters:
 */
let HOST_SERVER = 'http://eu-west-1.arweave.net:1984' // default node
let PATH_PREFIX = 'arweave-cache/'
let DEBUG_MESSAGES = true // this should default to false

export const setHostServer = (hostString: string) => HOST_SERVER = hostString

export const setPathPrefix = (path: string) => {
	if(path.charAt(path.length-1) !== '/' ){
		path += '/'
	}
	// check we have valid path string
	if(!isValid(path)){
		throw new Error(PREDEBUG + "Invalid path prefix: " + path )
	}
	PATH_PREFIX = path
}

export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b

const consoleDebug = (message: string) => {
	if(DEBUG_MESSAGES){
		console.log(PREDEBUG, message)
	}
}

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
		consoleDebug('returning cached file(s): ' + path + fileList.join(', ')) 

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

export const getBlockDtoByHeight = async (height: number): Promise<BlockDTO> => {
	let heightString = height.toString()
	let path = PATH_PREFIX + 'blocks/'
	let cachedFiles = await getMatchingFiles<BlockDTO>(heightString, path)

	// return cached if *they* are available
	if(cachedFiles.length > 0){
		return cachedFiles[0] //future feature, might be more than 1 block for this height
	}

	consoleDebug('fetching new block by height ' + heightString)
	let blockDto: BlockDTO = (await axios.get( HOST_SERVER + '/block/height/' + heightString )).data
	await fs.writeFile(`${path}${blockDto.height}.${blockDto.indep_hash}.json`, JSON.stringify(blockDto))
	return blockDto
}

export const getBlockDtoById = async (blockId: string): Promise<BlockDTO> => {
	let path = PATH_PREFIX + 'blocks/'
	let cachedFiles = await getMatchingFiles<BlockDTO>(blockId, path)

	// return cached if it's available
	if(cachedFiles.length > 0){
		return cachedFiles[0]
	}

	consoleDebug('fetching new block by id ' + blockId)
	let blockDto: BlockDTO = (await axios.get( HOST_SERVER + '/block/hash/' + blockId )).data
	await fs.writeFile(`${path}${blockDto.height}.${blockDto.indep_hash}.json`, JSON.stringify(blockDto))
	return blockDto
}

/**
 * 
 * @param minimumHeight the minimum height of the block index list
 */
export const getBlockIndex = async (minimumHeight: number): Promise<BlockIndexDTO> => {
	if(HOST_SERVER === 'https://arweave.net'){
		throw new Error("arweave.net does not serve /hash_list 3-tuples")
	}

	let path = PATH_PREFIX
	let cachedFiles = await getMatchingFiles<BlockIndexDTO>('block-index', path) //there's just 1 cache file

	// return cached if it exists & meets the minuimum height
	if(cachedFiles.length > 0 && cachedFiles[0].length > minimumHeight){
		return cachedFiles[0]
	}

	let blockIndex: BlockIndexDTO = (await axios.get( 
		HOST_SERVER + '/hash_list',
		{ headers: { "X-Block-Format": "3" } }
	)).data

	if(!blockIndex[0].hash){
		throw new Error('Error! Incorrect BlockIndex format, blockIndex[0] = ' + blockIndex[0] )
	}

	consoleDebug('fetching new block index for minimum height ' + minimumHeight)
	await fs.writeFile(`${path}block-index.json`, JSON.stringify(blockIndex))
	return blockIndex
}

export const getWalletList = async (height: number): Promise<WalletListDTO> => {
	let heightString = height.toString()
	let path = PATH_PREFIX + 'wallet-lists/'
	let fileList = await getMatchingFiles<WalletListDTO>(heightString, path)

	// return cached if it's available
	if(fileList.length > 0){
		return fileList[0]
	}

	consoleDebug('fetching new wallet list for height ' + height)
	//the nodes can clear old wallet lists to free up space, so this is not guaranteed to work
	let response = (await axios.get( HOST_SERVER + '/block/height/' + heightString + '/wallet_list' ))
	if(response.status !== 200){
		throw new Error(`${PREDEBUG} ERROR ${response.status} cannot fetch wallet list for height=${height} from node=${HOST_SERVER}`)
	}

	let walletList: WalletListDTO = response.data
	await fs.writeFile(`${path}${height}.wallets.json`, JSON.stringify(walletList))
	return walletList
}

export const getTxDto = async (txid: string): Promise<TxDTO> => {
	let path = PATH_PREFIX + 'txs/'
	let fileList = await getMatchingFiles<TxDTO>(txid, path)

	if(fileList.length > 0){
		return fileList[0]
	}

	consoleDebug('fetching new txDto ' + txid)
	let txDto: TxDTO = (await axios.get(`${HOST_SERVER}/tx/${txid}`)).data
	await fs.writeFile(`${path}${txDto.id}.json`, JSON.stringify(txDto))
	return txDto
}



