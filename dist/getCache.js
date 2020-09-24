"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxDto = exports.getWalletList = exports.getBlockIndex = exports.getBlockDtoById = exports.getBlockDtoByHeight = exports.getCurrentHeight = exports.setHostServer = exports.setPathPrefix = void 0;
var axios_1 = __importDefault(require("axios"));
var promises_1 = __importDefault(require("fs/promises"));
var is_valid_path_1 = __importDefault(require("is-valid-path"));
var HOST_SERVER = 'http://eu-west-1.arweave.net:1984';
var PATH_PREFIX = 'arweave-cache/';
var PREDEBUG = '\x1b[34marweave-cacher:\x1b[0m';
exports.setPathPrefix = function (path) {
    if (path.charAt(path.length - 1) !== '/') {
        path += '/';
    }
    if (!is_valid_path_1.default(path)) {
        throw new Error("Invalid path prefix: " + path);
    }
    PATH_PREFIX = path;
};
exports.setHostServer = function (hostString) { return HOST_SERVER = hostString; };
exports.getCurrentHeight = function () { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
    switch (_b.label) {
        case 0:
            _a = Number;
            return [4, axios_1.default.get(HOST_SERVER + '/info')];
        case 1: return [2, _a.apply(void 0, [(_b.sent()).data.height])];
    }
}); }); };
var getMatchingFiles = function (partialName, path) { return __awaiter(void 0, void 0, void 0, function () {
    var fileList, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 5]);
                return [4, promises_1.default.readdir(path)];
            case 1:
                fileList = _a.sent();
                fileList = fileList.filter(function (fname) {
                    var splits = fname.split('.');
                    if (splits.includes(partialName) && (splits[splits.length - 1] === 'json')) {
                        return fname;
                    }
                });
                return [3, 5];
            case 2:
                err_1 = _a.sent();
                if (!(err_1.code === 'ENOENT')) return [3, 4];
                return [4, promises_1.default.mkdir(path, { recursive: true })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                fileList = [];
                return [3, 5];
            case 5:
                if (fileList.length > 0) {
                    console.debug(PREDEBUG, 'returning cached file(s): ' + fileList.join(', '));
                    return [2, Promise.all(fileList.map(function (filename) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = JSON).parse;
                                        return [4, promises_1.default.readFile("" + path + filename, 'utf8')];
                                    case 1: return [2, _b.apply(_a, [_c.sent()])];
                                }
                            });
                        }); }))];
                }
                return [2, []];
        }
    });
}); };
exports.getBlockDtoByHeight = function (height) { return __awaiter(void 0, void 0, void 0, function () {
    var heightString, path, cachedFiles, blockDto;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                heightString = height.toString();
                path = PATH_PREFIX + 'blocks/';
                return [4, getMatchingFiles(heightString, path)];
            case 1:
                cachedFiles = _a.sent();
                if (cachedFiles.length > 0) {
                    return [2, cachedFiles[0]];
                }
                console.log(PREDEBUG, 'fetching new block by height ', heightString);
                return [4, axios_1.default.get(HOST_SERVER + '/block/height/' + heightString)];
            case 2:
                blockDto = (_a.sent()).data;
                return [4, promises_1.default.writeFile("" + path + blockDto.height + "." + blockDto.indep_hash + ".json", JSON.stringify(blockDto))];
            case 3:
                _a.sent();
                return [2, blockDto];
        }
    });
}); };
exports.getBlockDtoById = function (blockId) { return __awaiter(void 0, void 0, void 0, function () {
    var path, cachedFiles, blockDto;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                path = PATH_PREFIX + 'blocks/';
                return [4, getMatchingFiles(blockId, path)];
            case 1:
                cachedFiles = _a.sent();
                if (cachedFiles.length > 0) {
                    return [2, cachedFiles[0]];
                }
                console.log(PREDEBUG, 'fetching new block by id ', blockId);
                return [4, axios_1.default.get(HOST_SERVER + '/block/hash/' + blockId)];
            case 2:
                blockDto = (_a.sent()).data;
                return [4, promises_1.default.writeFile("" + path + blockDto.height + "." + blockDto.indep_hash + ".json", JSON.stringify(blockDto))];
            case 3:
                _a.sent();
                return [2, blockDto];
        }
    });
}); };
exports.getBlockIndex = function (minimumHeight) { return __awaiter(void 0, void 0, void 0, function () {
    var path, cachedFiles, blockIndex;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (HOST_SERVER === 'https://arweave.net') {
                    throw new Error("arweave.net does not serve /hash_list 3-tuples");
                }
                path = PATH_PREFIX;
                return [4, getMatchingFiles('block-index', path)];
            case 1:
                cachedFiles = _a.sent();
                if (cachedFiles.length > 0 && cachedFiles[0].length > minimumHeight) {
                    return [2, cachedFiles[0]];
                }
                return [4, axios_1.default.get(HOST_SERVER + '/hash_list', { headers: { "X-Block-Format": "3" } })];
            case 2:
                blockIndex = (_a.sent()).data;
                if (!blockIndex[0].hash) {
                    throw new Error('Error! Incorrect BlockIndex format, blockIndex[0] = ' + blockIndex[0]);
                }
                console.log(PREDEBUG, 'fetching new block index for minimum height ', minimumHeight);
                return [4, promises_1.default.writeFile(path + "block-index.json", JSON.stringify(blockIndex))];
            case 3:
                _a.sent();
                return [2, blockIndex];
        }
    });
}); };
exports.getWalletList = function (height) { return __awaiter(void 0, void 0, void 0, function () {
    var heightString, path, fileList, walletList;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                heightString = height.toString();
                path = PATH_PREFIX + 'wallet-lists/';
                return [4, getMatchingFiles(heightString, path)];
            case 1:
                fileList = _a.sent();
                if (fileList.length > 0) {
                    return [2, fileList[0]];
                }
                console.log(PREDEBUG, 'fetching new wallet list for height ', height);
                return [4, axios_1.default.get('https://arweave.net' + '/block/height/' + heightString + '/wallet_list')];
            case 2:
                walletList = (_a.sent()).data;
                return [4, promises_1.default.writeFile("" + path + height + ".wallets.json", JSON.stringify(walletList))];
            case 3:
                _a.sent();
                return [2, walletList];
        }
    });
}); };
exports.getTxDto = function (txid) { return __awaiter(void 0, void 0, void 0, function () {
    var path, fileList, txDto;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                path = PATH_PREFIX + 'txs/';
                return [4, getMatchingFiles(txid, path)];
            case 1:
                fileList = _a.sent();
                if (fileList.length > 0) {
                    return [2, fileList[0]];
                }
                console.log(PREDEBUG, 'fetching new txDto', txid);
                return [4, axios_1.default.get(HOST_SERVER + "/tx/" + txid)];
            case 2:
                txDto = (_a.sent()).data;
                return [4, promises_1.default.writeFile("" + path + txDto.id + ".json", JSON.stringify(txDto))];
            case 3:
                _a.sent();
                return [2, txDto];
        }
    });
}); };
//# sourceMappingURL=getCache.js.map