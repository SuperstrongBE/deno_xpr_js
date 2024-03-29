var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/rpc/error.ts
var RpcError = class extends Error {
  constructor(json) {
    let data;
    let details;
    if (json && json.error && json.error.details && json.error.details.length && json.error.details[0].message) {
      data = json.error.details[0].message;
      details = json.error.details;
    } else if (json && json.processed && json.processed.except && json.processed.except.message) {
      data = json.processed.except.message;
      details = json.processed.except;
    } else if (json && json.result && json.result.except && json.result.except.message) {
      data = json.result.except.message;
      details = json.result.except;
    } else if (json) {
      data = json.message;
    } else {
      data = json;
    }
    super(data);
    if (details) {
      this.details = details;
    }
    Object.setPrototypeOf(this, RpcError.prototype);
    this.json = json;
  }
};

// src/rpc/proton.ts
async function getValidKycProviders() {
  try {
    const { rows } = await this.get_table_rows({
      code: "eosio.proton",
      table: "kycproviders",
      scope: "eosio.proton"
    });
    this.validKycProviders = rows.reduce(
      (acc, provider) => {
        if (!provider.blisted) {
          acc.push(provider.kyc_provider);
        }
        return acc;
      },
      []
    );
  } catch (e) {
    throw new Error("Unable to get KYC Providers.");
  }
}
async function isLightKYCVerified(account) {
  const tier1Kyc = ["firstname", "lastname", "birthdate", "address"];
  const tier2Kyc = ["selfie", "frontofid", "backofid"];
  if (account.length === 0) {
    throw new Error("Please enter an account.");
  }
  if (this.validKycProviders.length === 0) {
    await this.getValidKycProviders();
  }
  let users = [];
  if (Array.isArray(account)) {
    users = account;
  } else if (typeof account === "string") {
    try {
      const { rows } = await this.get_table_rows({
        code: "eosio.proton",
        table: "usersinfo",
        scope: "eosio.proton",
        lower_bound: account,
        upper_bound: account
      });
      users = rows;
    } catch (e) {
      throw new Error("Account not found!");
    }
  }
  const resultsWithKycStatus = users.map((user) => {
    const levelsResult = user.kyc.reduce((acc, kyc) => {
      if (this.validKycProviders.indexOf(kyc.kyc_provider) >= 0) {
        const result = kyc.kyc_level.split(",").map((kycItem) => kycItem.split(":")[1]);
        acc = result.concat(acc);
      }
      return acc;
    }, []);
    user.isTier1KYCVerified = tier1Kyc.every(
      (lightKycField) => levelsResult.includes(lightKycField)
    );
    user.isTier2KYCVerified = user.isTier1KYCVerified && tier2Kyc.every((lightKycField) => levelsResult.includes(lightKycField));
    user.isTier3KYCVerified = false;
    user.isLightKYCVerified = user.isTier1KYCVerified;
    return user;
  });
  return resultsWithKycStatus;
}
async function fetchCredentials(actor) {
  const { rows: credentials } = await this.get_table_rows({
    code: "webauthn",
    scope: "webauthn",
    table: "credentials",
    lower_bound: actor,
    upper_bound: actor,
    key_type: "name",
    index_position: 2
  });
  return credentials;
}

// src/rpc/index.ts
import fetch from "cross-fetch";

// src/api/numeric.ts
var numeric_exports = {};
__export(numeric_exports, {
  KeyType: () => KeyType,
  base58ToBinary: () => base58ToBinary,
  base64ToBinary: () => base64ToBinary,
  binaryToBase58: () => binaryToBase58,
  binaryToDecimal: () => binaryToDecimal,
  convertLegacyPublicKey: () => convertLegacyPublicKey,
  convertLegacyPublicKeys: () => convertLegacyPublicKeys,
  decimalToBinary: () => decimalToBinary,
  isNegative: () => isNegative,
  negate: () => negate,
  privateKeyDataSize: () => privateKeyDataSize,
  privateKeyToLegacyString: () => privateKeyToLegacyString,
  privateKeyToString: () => privateKeyToString,
  publicKeyDataSize: () => publicKeyDataSize,
  publicKeyToLegacyString: () => publicKeyToLegacyString,
  publicKeyToString: () => publicKeyToString,
  signatureDataSize: () => signatureDataSize,
  signatureToString: () => signatureToString,
  signedBinaryToDecimal: () => signedBinaryToDecimal,
  signedDecimalToBinary: () => signedDecimalToBinary,
  stringToPrivateKey: () => stringToPrivateKey,
  stringToPublicKey: () => stringToPublicKey,
  stringToSignature: () => stringToSignature
});
import { sha256 } from "hash.js";
import RIPEMD160 from "ripemd-ts";
var ripemd160 = RIPEMD160.hash;
var base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var create_base58_map = () => {
  const base58M = Array(256).fill(-1);
  for (let i = 0; i < base58Chars.length; ++i) {
    base58M[base58Chars.charCodeAt(i)] = i;
  }
  return base58M;
};
var base58Map = create_base58_map();
var create_base64_map = () => {
  const base64M = Array(256).fill(-1);
  for (let i = 0; i < base64Chars.length; ++i) {
    base64M[base64Chars.charCodeAt(i)] = i;
  }
  base64M["=".charCodeAt(0)] = 0;
  return base64M;
};
var base64Map = create_base64_map();
var isNegative = (bignum) => {
  return (bignum[bignum.length - 1] & 128) !== 0;
};
var negate = (bignum) => {
  let carry = 1;
  for (let i = 0; i < bignum.length; ++i) {
    const x = (~bignum[i] & 255) + carry;
    bignum[i] = x;
    carry = x >> 8;
  }
};
var decimalToBinary = (size, s) => {
  const result = new Uint8Array(size);
  for (let i = 0; i < s.length; ++i) {
    const srcDigit = s.charCodeAt(i);
    if (srcDigit < "0".charCodeAt(0) || srcDigit > "9".charCodeAt(0)) {
      throw new Error("invalid number");
    }
    let carry = srcDigit - "0".charCodeAt(0);
    for (let j = 0; j < size; ++j) {
      const x = result[j] * 10 + carry;
      result[j] = x;
      carry = x >> 8;
    }
    if (carry) {
      throw new Error("number is out of range");
    }
  }
  return result;
};
var signedDecimalToBinary = (size, s) => {
  const negative = s[0] === "-";
  if (negative) {
    s = s.substr(1);
  }
  const result = decimalToBinary(size, s);
  if (negative) {
    negate(result);
    if (!isNegative(result)) {
      throw new Error("number is out of range");
    }
  } else if (isNegative(result)) {
    throw new Error("number is out of range");
  }
  return result;
};
var binaryToDecimal = (bignum, minDigits = 1) => {
  const result = Array(minDigits).fill("0".charCodeAt(0));
  for (let i = bignum.length - 1; i >= 0; --i) {
    let carry = bignum[i];
    for (let j = 0; j < result.length; ++j) {
      const x = (result[j] - "0".charCodeAt(0) << 8) + carry;
      result[j] = "0".charCodeAt(0) + x % 10;
      carry = x / 10 | 0;
    }
    while (carry) {
      result.push("0".charCodeAt(0) + carry % 10);
      carry = carry / 10 | 0;
    }
  }
  result.reverse();
  return String.fromCharCode(...result);
};
var signedBinaryToDecimal = (bignum, minDigits = 1) => {
  if (isNegative(bignum)) {
    const x = bignum.slice();
    negate(x);
    return "-" + binaryToDecimal(x, minDigits);
  }
  return binaryToDecimal(bignum, minDigits);
};
var base58ToBinaryVarSize = (s) => {
  const result = [];
  for (let i = 0; i < s.length; ++i) {
    let carry = base58Map[s.charCodeAt(i)];
    if (carry < 0) {
      throw new Error("invalid base-58 value");
    }
    for (let j = 0; j < result.length; ++j) {
      const x = result[j] * 58 + carry;
      result[j] = x & 255;
      carry = x >> 8;
    }
    if (carry) {
      result.push(carry);
    }
  }
  for (const ch of s) {
    if (ch === "1") {
      result.push(0);
    } else {
      break;
    }
  }
  result.reverse();
  return new Uint8Array(result);
};
var base58ToBinary = (size, s) => {
  if (!size) {
    return base58ToBinaryVarSize(s);
  }
  const result = new Uint8Array(size);
  for (let i = 0; i < s.length; ++i) {
    let carry = base58Map[s.charCodeAt(i)];
    if (carry < 0) {
      throw new Error("invalid base-58 value");
    }
    for (let j = 0; j < size; ++j) {
      const x = result[j] * 58 + carry;
      result[j] = x;
      carry = x >> 8;
    }
    if (carry) {
      throw new Error("base-58 value is out of range");
    }
  }
  result.reverse();
  return result;
};
var binaryToBase58 = (bignum) => {
  const result = [];
  for (const byte of bignum) {
    let carry = byte;
    for (let j = 0; j < result.length; ++j) {
      const x = (base58Map[result[j]] << 8) + carry;
      result[j] = base58Chars.charCodeAt(x % 58);
      carry = x / 58 | 0;
    }
    while (carry) {
      result.push(base58Chars.charCodeAt(carry % 58));
      carry = carry / 58 | 0;
    }
  }
  for (const byte of bignum) {
    if (byte) {
      break;
    } else {
      result.push("1".charCodeAt(0));
    }
  }
  result.reverse();
  return String.fromCharCode(...result);
};
var base64ToBinary = (s) => {
  let len = s.length;
  if ((len & 3) === 1 && s[len - 1] === "=") {
    len -= 1;
  }
  if ((len & 3) !== 0) {
    throw new Error("base-64 value is not padded correctly");
  }
  const groups = len >> 2;
  let bytes = groups * 3;
  if (len > 0 && s[len - 1] === "=") {
    if (s[len - 2] === "=") {
      bytes -= 2;
    } else {
      bytes -= 1;
    }
  }
  const result = new Uint8Array(bytes);
  for (let group = 0; group < groups; ++group) {
    const digit0 = base64Map[s.charCodeAt(group * 4 + 0)];
    const digit1 = base64Map[s.charCodeAt(group * 4 + 1)];
    const digit2 = base64Map[s.charCodeAt(group * 4 + 2)];
    const digit3 = base64Map[s.charCodeAt(group * 4 + 3)];
    result[group * 3 + 0] = digit0 << 2 | digit1 >> 4;
    if (group * 3 + 1 < bytes) {
      result[group * 3 + 1] = (digit1 & 15) << 4 | digit2 >> 2;
    }
    if (group * 3 + 2 < bytes) {
      result[group * 3 + 2] = (digit2 & 3) << 6 | digit3;
    }
  }
  return result;
};
var KeyType = /* @__PURE__ */ ((KeyType2) => {
  KeyType2[KeyType2["k1"] = 0] = "k1";
  KeyType2[KeyType2["r1"] = 1] = "r1";
  KeyType2[KeyType2["wa"] = 2] = "wa";
  KeyType2[KeyType2["rsa"] = 100] = "rsa";
  KeyType2[KeyType2["eth"] = 101] = "eth";
  return KeyType2;
})(KeyType || {});
var publicKeyDataSize = 33;
var privateKeyDataSize = 32;
var signatureDataSize = 65;
var digestSuffixRipemd160 = (data, suffix) => {
  const d = new Uint8Array(data.length + suffix.length);
  for (let i = 0; i < data.length; ++i) {
    d[i] = data[i];
  }
  for (let i = 0; i < suffix.length; ++i) {
    d[data.length + i] = suffix.charCodeAt(i);
  }
  return ripemd160(d);
};
var stringToKey = (s, type, size, suffix) => {
  const whole = base58ToBinary(size ? size + 4 : 0, s);
  const result = {
    type,
    data: new Uint8Array(whole.buffer, 0, whole.length - 4)
  };
  const digest = new Uint8Array(digestSuffixRipemd160(result.data, suffix));
  if (digest[0] !== whole[whole.length - 4] || digest[1] !== whole[whole.length - 3] || digest[2] !== whole[whole.length - 2] || digest[3] !== whole[whole.length - 1]) {
    throw new Error("checksum doesn't match");
  }
  return result;
};
var keyToString = (key, suffix, prefix) => {
  const digest = new Uint8Array(digestSuffixRipemd160(key.data, suffix));
  const whole = new Uint8Array(key.data.length + 4);
  for (let i = 0; i < key.data.length; ++i) {
    whole[i] = key.data[i];
  }
  for (let i = 0; i < 4; ++i) {
    whole[i + key.data.length] = digest[i];
  }
  return prefix + binaryToBase58(whole);
};
var stringToPublicKey = (s, prefix = "EOS") => {
  if (typeof s !== "string") {
    throw new Error("expected string containing public key");
  }
  if (s.substr(0, 3) === prefix) {
    const whole = base58ToBinary(publicKeyDataSize + 4, s.substr(3));
    const key = { type: 0 /* k1 */, data: new Uint8Array(publicKeyDataSize) };
    for (let i = 0; i < publicKeyDataSize; ++i) {
      key.data[i] = whole[i];
    }
    const digest = new Uint8Array(ripemd160(key.data));
    if (digest[0] !== whole[publicKeyDataSize] || digest[1] !== whole[34] || digest[2] !== whole[35] || digest[3] !== whole[36]) {
      throw new Error("checksum doesn't match");
    }
    return key;
  } else if (s.substr(0, 7) === "PUB_K1_") {
    return stringToKey(s.substr(7), 0 /* k1 */, publicKeyDataSize, "K1");
  } else if (s.substr(0, 7) === "PUB_R1_") {
    return stringToKey(s.substr(7), 1 /* r1 */, publicKeyDataSize, "R1");
  } else if (s.substr(0, 7) === "PUB_WA_") {
    return stringToKey(s.substr(7), 2 /* wa */, 0, "WA");
  } else {
    throw new Error("unrecognized public key format");
  }
};
var publicKeyToLegacyString = (key, prefix = "EOS") => {
  if (key.type === 0 /* k1 */ && key.data.length === publicKeyDataSize) {
    return keyToString(key, "", prefix);
  } else if (key.type === 1 /* r1 */ || key.type === 2 /* wa */) {
    throw new Error("Key format not supported in legacy conversion");
  } else {
    throw new Error("unrecognized public key format");
  }
};
var publicKeyToString = (key) => {
  if (key.type === 0 /* k1 */ && key.data.length === publicKeyDataSize) {
    return keyToString(key, "K1", "PUB_K1_");
  } else if (key.type === 1 /* r1 */ && key.data.length === publicKeyDataSize) {
    return keyToString(key, "R1", "PUB_R1_");
  } else if (key.type === 2 /* wa */) {
    return keyToString(key, "WA", "PUB_WA_");
  } else {
    throw new Error("unrecognized public key format");
  }
};
var convertLegacyPublicKey = (s, prefix = "EOS") => {
  if (s.substr(0, 3) === prefix) {
    return publicKeyToString(stringToPublicKey(s, prefix));
  }
  return s;
};
var convertLegacyPublicKeys = (keys, prefix = "EOS") => {
  return keys.map((key) => convertLegacyPublicKey(key, prefix));
};
var stringToPrivateKey = (s) => {
  if (typeof s !== "string") {
    throw new Error("expected string containing private key");
  }
  if (s.substr(0, 7) === "PVT_R1_") {
    return stringToKey(s.substr(7), 1 /* r1 */, privateKeyDataSize, "R1");
  } else if (s.substr(0, 7) === "PVT_K1_") {
    return stringToKey(s.substr(7), 0 /* k1 */, privateKeyDataSize, "K1");
  } else {
    const whole = base58ToBinary(privateKeyDataSize + 5, s);
    const key = { type: 0 /* k1 */, data: new Uint8Array(privateKeyDataSize) };
    if (whole[0] !== 128) {
      throw new Error("unrecognized private key type");
    }
    for (let i = 0; i < privateKeyDataSize; ++i) {
      key.data[i] = whole[i + 1];
    }
    return key;
  }
};
var privateKeyToLegacyString = (key) => {
  if (key.type === 0 /* k1 */ && key.data.length === privateKeyDataSize) {
    const whole = [];
    whole.push(128);
    key.data.forEach((byte) => whole.push(byte));
    const digest = new Uint8Array(
      sha256().update(sha256().update(whole).digest()).digest()
    );
    const result = new Uint8Array(privateKeyDataSize + 5);
    for (let i = 0; i < whole.length; i++) {
      result[i] = whole[i];
    }
    for (let i = 0; i < 4; i++) {
      result[i + whole.length] = digest[i];
    }
    return binaryToBase58(result);
  } else if (key.type === 1 /* r1 */ || key.type === 2 /* wa */) {
    throw new Error("Key format not supported in legacy conversion");
  } else {
    throw new Error("unrecognized public key format");
  }
};
var privateKeyToString = (key) => {
  if (key.type === 1 /* r1 */) {
    return keyToString(key, "R1", "PVT_R1_");
  } else if (key.type === 0 /* k1 */) {
    return keyToString(key, "K1", "PVT_K1_");
  } else {
    throw new Error("unrecognized private key format");
  }
};
var stringToSignature = (s) => {
  if (typeof s !== "string") {
    throw new Error("expected string containing signature");
  }
  if (s.substr(0, 7) === "SIG_K1_") {
    return stringToKey(s.substr(7), 0 /* k1 */, signatureDataSize, "K1");
  } else if (s.substr(0, 7) === "SIG_R1_") {
    return stringToKey(s.substr(7), 1 /* r1 */, signatureDataSize, "R1");
  } else if (s.substr(0, 7) === "SIG_WA_") {
    return stringToKey(s.substr(7), 2 /* wa */, 0, "WA");
  } else {
    throw new Error("unrecognized signature format");
  }
};
var signatureToString = (signature) => {
  if (signature.type === 0 /* k1 */) {
    return keyToString(signature, "K1", "SIG_K1_");
  } else if (signature.type === 1 /* r1 */) {
    return keyToString(signature, "R1", "SIG_R1_");
  } else if (signature.type === 2 /* wa */) {
    return keyToString(signature, "WA", "SIG_WA_");
  } else {
    throw new Error("unrecognized signature format");
  }
};

// src/rpc/index.ts
if (typeof global !== "undefined" && !global.AbortController) {
  __require("abortcontroller-polyfill/dist/polyfill-patch-fetch");
}
var arrayToHex = (data) => {
  let result = "";
  for (const x of data) {
    result += ("00" + x.toString(16)).slice(-2);
  }
  return result;
};
async function fetchWithTimeout(resource, options) {
  const { timeout } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options || {},
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}
var JsonRpc = class {
  constructor(endpoints = [], options = {}) {
    this.validKycProviders = [];
    this.timeout = 5e3;
    this.isLightKYCVerified = isLightKYCVerified;
    this.getValidKycProviders = getValidKycProviders;
    this.fetchCredentials = fetchCredentials;
    if (options.timeout) {
      this.timeout = options.timeout;
    }
    endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    this.initialEndpoints = endpoints.map(
      (endpoint) => endpoint.replace(/\/$/, "")
    );
    this.endpoints = this.initialEndpoints.slice(0);
    this.currentEndpoint = "";
    this.nextEndpoint();
  }
  nextEndpoint() {
    if (this.endpoints.length && this.currentEndpoint) {
      const removed = this.endpoints.shift();
      this.endpoints = this.endpoints.concat(removed || []);
    } else {
      this.endpoints = this.initialEndpoints;
    }
    this.currentEndpoint = this.endpoints[0];
  }
  async fetch(path, body, currentRetries = 0, logError = true) {
    let response;
    let json;
    try {
      response = await fetchWithTimeout(this.currentEndpoint + path, {
        body: JSON.stringify(body),
        method: "POST",
        timeout: this.timeout
      });
      json = await response.json();
      if (json.processed && json.processed.except || json.result && json.result.except || json.code === 404) {
        throw new RpcError(json);
      }
    } catch (e) {
      if (logError) {
        console.log(e);
      }
      if (this.endpoints.length > 1) {
        this.nextEndpoint();
        if (currentRetries < this.initialEndpoints.length) {
          return this.fetch(path, body, ++currentRetries, logError);
        }
      }
      e.isFetchError = true;
      throw new RpcError(e);
    }
    if (!(response && response.ok)) {
      throw new RpcError(json);
    }
    if (json && json.head_block_time) {
      const headTime = new Date(json.head_block_time + "Z").getTime();
      const ct = new Date().getTime();
      const secondsBehind = (ct - headTime) / 1e3;
      if (secondsBehind > 30 && this.endpoints.length > 1) {
        this.nextEndpoint();
        if (currentRetries < this.initialEndpoints.length) {
          return this.fetch(path, body, ++currentRetries);
        }
      }
    }
    return json;
  }
  async get(path) {
    const res = await fetch(path);
    if (res.status >= 400) {
      throw new Error("Bad response from server " + res.status);
    }
    const data = await res.json();
    return data;
  }
  async abi_bin_to_json(code, action, binargs) {
    return await this.fetch("/v1/chain/abi_bin_to_json", {
      code,
      action,
      binargs
    });
  }
  async abi_json_to_bin(code, action, args) {
    return await this.fetch("/v1/chain/abi_json_to_bin", {
      code,
      action,
      args
    });
  }
  async get_abi(accountName) {
    return await this.fetch("/v1/chain/get_abi", { account_name: accountName });
  }
  async get_account(accountName) {
    return await this.fetch("/v1/chain/get_account", {
      account_name: accountName
    });
  }
  async get_accounts_by_authorizers(accounts, keys) {
    return await this.fetch("/v1/chain/get_accounts_by_authorizers", {
      accounts,
      keys
    });
  }
  async get_activated_protocol_features({
    limit,
    search_by_block_num,
    reverse,
    lower_bound,
    upper_bound
  } = {
    limit: 50,
    search_by_block_num: false,
    reverse: false
  }) {
    return await this.fetch("/v1/chain/get_activated_protocol_features", {
      lower_bound,
      upper_bound,
      limit,
      search_by_block_num,
      reverse
    });
  }
  async get_block_header_state(blockNumOrId) {
    return await this.fetch("/v1/chain/get_block_header_state", {
      block_num_or_id: blockNumOrId
    });
  }
  async get_block_info(blockNum) {
    return await this.fetch(
      "/v1/chain/get_block_info",
      { block_num: blockNum },
      0,
      false
    );
  }
  async get_block(blockNumOrId) {
    return await this.fetch("/v1/chain/get_block", {
      block_num_or_id: blockNumOrId
    });
  }
  async get_code(accountName) {
    return await this.fetch("/v1/chain/get_code", {
      account_name: accountName,
      code_as_wasm: true
    });
  }
  async get_code_hash(accountName) {
    return await this.fetch("/v1/chain/get_code_hash", {
      account_name: accountName
    });
  }
  async get_currency_balance(code, account, symbol) {
    return await this.fetch("/v1/chain/get_currency_balance", {
      code,
      account,
      symbol
    });
  }
  async get_currency_stats(code, symbol) {
    return await this.fetch("/v1/chain/get_currency_stats", { code, symbol });
  }
  async get_info() {
    return await this.fetch("/v1/chain/get_info", {});
  }
  async get_producer_schedule() {
    return await this.fetch("/v1/chain/get_producer_schedule", {});
  }
  async get_producers(json = true, lowerBound = "", limit = 50) {
    return await this.fetch("/v1/chain/get_producers", {
      json,
      lower_bound: lowerBound,
      limit
    });
  }
  async get_raw_code_and_abi(accountName) {
    return await this.fetch("/v1/chain/get_raw_code_and_abi", {
      account_name: accountName
    });
  }
  async getRawAbi(accountName) {
    const rawAbi = await this.get_raw_abi(accountName);
    const abi = base64ToBinary(rawAbi.abi);
    return { accountName: rawAbi.account_name, abi };
  }
  async get_raw_abi(accountName) {
    return await this.fetch("/v1/chain/get_raw_abi", {
      account_name: accountName
    });
  }
  async get_scheduled_transactions(json = true, lowerBound = "", limit = 50) {
    return await this.fetch("/v1/chain/get_scheduled_transactions", {
      json,
      lower_bound: lowerBound,
      limit
    });
  }
  async get_table_rows({
    json = true,
    code,
    scope,
    table,
    lower_bound = "",
    upper_bound = "",
    index_position = 1,
    key_type = "",
    limit = 10,
    reverse = false,
    show_payer = false
  }) {
    return await this.fetch("/v1/chain/get_table_rows", {
      json,
      code,
      scope,
      table,
      lower_bound,
      upper_bound,
      index_position,
      key_type,
      limit,
      reverse,
      show_payer
    });
  }
  async get_kv_table_rows({
    json = true,
    code,
    table,
    index_name,
    encode_type = "bytes",
    index_value,
    lower_bound,
    upper_bound,
    limit = 10,
    reverse = false,
    show_payer = false
  }) {
    return await this.fetch("/v1/chain/get_kv_table_rows", {
      json,
      code,
      table,
      index_name,
      encode_type,
      index_value,
      lower_bound,
      upper_bound,
      limit,
      reverse,
      show_payer
    });
  }
  async get_table_by_scope({
    code,
    table,
    lower_bound = "",
    upper_bound = "",
    limit = 10
  }) {
    return await this.fetch("/v1/chain/get_table_by_scope", {
      code,
      table,
      lower_bound,
      upper_bound,
      limit
    });
  }
  async getRequiredKeys(args) {
    const requiredKeys = await this.fetch("/v1/chain/get_required_keys", {
      transaction: args.transaction,
      available_keys: args.availableKeys
    });
    return convertLegacyPublicKeys(requiredKeys.required_keys);
  }
  async push_transaction({
    signatures,
    compression = 0,
    serializedTransaction,
    serializedContextFreeData
  }) {
    try {
      return await this.fetch("/v1/chain/push_transaction", {
        signatures,
        compression,
        packed_context_free_data: arrayToHex(
          serializedContextFreeData || new Uint8Array(0)
        ),
        packed_trx: arrayToHex(serializedTransaction)
      });
    } catch (e) {
      if (e && e.json && e.json.error) {
        const expired = e.json.error.name === "expired_tx_exception";
        if (expired) {
          e.json.error.message = "Transaction Expired: Try Again";
          this.nextEndpoint();
        }
      }
      throw e;
    }
  }
  async push_ro_transaction({ signatures, compression = 0, serializedTransaction }, returnFailureTraces = false) {
    return await this.fetch("/v1/chain/push_ro_transaction", {
      transaction: {
        signatures,
        compression,
        packed_context_free_data: arrayToHex(new Uint8Array(0)),
        packed_trx: arrayToHex(serializedTransaction)
      },
      return_failure_traces: returnFailureTraces
    });
  }
  async push_transactions(transactions) {
    const packedTrxs = transactions.map(
      ({
        signatures,
        compression = 0,
        serializedTransaction,
        serializedContextFreeData
      }) => {
        return {
          signatures,
          compression,
          packed_context_free_data: arrayToHex(
            serializedContextFreeData || new Uint8Array(0)
          ),
          packed_trx: arrayToHex(serializedTransaction)
        };
      }
    );
    return await this.fetch("/v1/chain/push_transactions", packedTrxs);
  }
  async send_transaction({
    signatures,
    compression = 0,
    serializedTransaction,
    serializedContextFreeData
  }) {
    return await this.fetch("/v1/chain/send_transaction", {
      signatures,
      compression,
      packed_context_free_data: arrayToHex(
        serializedContextFreeData || new Uint8Array(0)
      ),
      packed_trx: arrayToHex(serializedTransaction)
    });
  }
  async db_size_get() {
    return await this.fetch("/v1/db_size/get", {});
  }
  async trace_get_block(block_num) {
    return await this.fetch("/v1/trace_api/get_block", { block_num });
  }
  async history_get_actions(accountName, pos = null, offset = null) {
    return await this.fetch("/v1/history/get_actions", {
      account_name: accountName,
      pos,
      offset
    });
  }
  async history_get_transaction(id, blockNumHint = null) {
    return await this.fetch("/v1/history/get_transaction", {
      id,
      block_num_hint: blockNumHint
    });
  }
  async history_get_key_accounts(publicKey) {
    return await this.fetch("/v1/history/get_key_accounts", {
      public_key: publicKey
    });
  }
  async history_get_controlled_accounts(controllingAccount) {
    return await this.fetch("/v1/history/get_controlled_accounts", {
      controlling_account: controllingAccount
    });
  }
  async get_nfts_fio_address(address) {
    return await this.fetch("/v1/chain/get_nfts_fio_address", {
      fio_address: address
    });
  }
};

// src/rpc/types.ts
var types_exports = {};

// src/api/index.ts
import { inflate, deflate } from "pako";
import base64url2 from "base64url";

// src/api/serialize.ts
var serialize_exports = {};
__export(serialize_exports, {
  SerialBuffer: () => SerialBuffer,
  SerializerState: () => SerializerState,
  arrayToHex: () => arrayToHex2,
  b64tob64u: () => b64tob64u,
  blockTimestampToDate: () => blockTimestampToDate,
  createAbiTypes: () => createAbiTypes,
  createBaseResolvedTransaction: () => createBaseResolvedTransaction,
  createInitialTypes: () => createInitialTypes,
  createTransactionExtensionTypes: () => createTransactionExtensionTypes,
  createTransactionTypes: () => createTransactionTypes,
  dateToBlockTimestamp: () => dateToBlockTimestamp,
  dateToTimePoint: () => dateToTimePoint,
  dateToTimePointSec: () => dateToTimePointSec,
  deserializeAction: () => deserializeAction,
  deserializeActionData: () => deserializeActionData,
  deserializeAnyArray: () => deserializeAnyArray,
  deserializeAnyObject: () => deserializeAnyObject,
  deserializeAnyvar: () => deserializeAnyvar,
  deserializeAnyvarShort: () => deserializeAnyvarShort,
  getType: () => getType,
  getTypesFromAbi: () => getTypesFromAbi,
  hexToUint8Array: () => hexToUint8Array,
  serializeAction: () => serializeAction,
  serializeActionData: () => serializeActionData,
  serializeAnyArray: () => serializeAnyArray,
  serializeAnyObject: () => serializeAnyObject,
  serializeAnyvar: () => serializeAnyvar,
  serializeQuery: () => serializeQuery,
  stringToSymbol: () => stringToSymbol,
  supportedAbiVersion: () => supportedAbiVersion,
  symbolToString: () => symbolToString,
  timePointSecToDate: () => timePointSecToDate,
  timePointToDate: () => timePointToDate,
  transactionHeader: () => transactionHeader
});
import "fast-text-encoding";
var SerializerState = class {
  constructor(options = {}) {
    this.skippedBinaryExtension = false;
    this.options = options;
  }
};
var SerialBuffer = class {
  constructor({ array, textEncoder, textDecoder } = {}) {
    this.readPos = 0;
    this.array = array || new Uint8Array(1024);
    this.length = array ? array.length : 0;
    this.textEncoder = textEncoder || new TextEncoder();
    this.textDecoder = textDecoder || new TextDecoder("utf-8");
  }
  reserve(size) {
    if (this.length + size <= this.array.length) {
      return;
    }
    let l = this.array.length;
    while (this.length + size > l) {
      l = Math.ceil(l * 1.5);
    }
    const newArray = new Uint8Array(l);
    newArray.set(this.array);
    this.array = newArray;
  }
  haveReadData() {
    return this.readPos < this.length;
  }
  restartRead() {
    this.readPos = 0;
  }
  asUint8Array() {
    return new Uint8Array(
      this.array.buffer,
      this.array.byteOffset,
      this.length
    );
  }
  pushArray(v) {
    this.reserve(v.length);
    this.array.set(v, this.length);
    this.length += v.length;
  }
  push(...v) {
    this.pushArray(v);
  }
  get() {
    if (this.readPos < this.length) {
      return this.array[this.readPos++];
    }
    throw new Error("Read past end of buffer");
  }
  pushUint8ArrayChecked(v, len) {
    if (v.length !== len) {
      throw new Error("Binary data has incorrect size");
    }
    this.pushArray(v);
  }
  getUint8Array(len) {
    if (this.readPos + len > this.length) {
      throw new Error("Read past end of buffer");
    }
    const result = new Uint8Array(
      this.array.buffer,
      this.array.byteOffset + this.readPos,
      len
    );
    this.readPos += len;
    return result;
  }
  skip(len) {
    if (this.readPos + len > this.length) {
      throw new Error("Read past end of buffer");
    }
    this.readPos += len;
  }
  pushUint16(v) {
    this.push(v >> 0 & 255, v >> 8 & 255);
  }
  getUint16() {
    let v = 0;
    v |= this.get() << 0;
    v |= this.get() << 8;
    return v;
  }
  pushUint32(v) {
    this.push(
      v >> 0 & 255,
      v >> 8 & 255,
      v >> 16 & 255,
      v >> 24 & 255
    );
  }
  getUint32() {
    let v = 0;
    v |= this.get() << 0;
    v |= this.get() << 8;
    v |= this.get() << 16;
    v |= this.get() << 24;
    return v >>> 0;
  }
  pushNumberAsUint64(v) {
    this.pushUint32(v >>> 0);
    this.pushUint32(Math.floor(v / 4294967296) >>> 0);
  }
  getUint64AsNumber() {
    const low = this.getUint32();
    const high = this.getUint32();
    return (high >>> 0) * 4294967296 + (low >>> 0);
  }
  pushVaruint32(v) {
    while (true) {
      if (v >>> 7) {
        this.push(128 | v & 127);
        v = v >>> 7;
      } else {
        this.push(v);
        break;
      }
    }
  }
  getVaruint32() {
    let v = 0;
    let bit = 0;
    while (true) {
      const b = this.get();
      v |= (b & 127) << bit;
      bit += 7;
      if (!(b & 128)) {
        break;
      }
    }
    return v >>> 0;
  }
  pushVarint32(v) {
    this.pushVaruint32(v << 1 ^ v >> 31);
  }
  getVarint32() {
    const v = this.getVaruint32();
    if (v & 1) {
      return ~v >> 1 | 2147483648;
    } else {
      return v >>> 1;
    }
  }
  pushFloat32(v) {
    this.pushArray(new Uint8Array(new Float32Array([v]).buffer));
  }
  getFloat32() {
    return new Float32Array(this.getUint8Array(4).slice().buffer)[0];
  }
  pushFloat64(v) {
    this.pushArray(new Uint8Array(new Float64Array([v]).buffer));
  }
  getFloat64() {
    return new Float64Array(this.getUint8Array(8).slice().buffer)[0];
  }
  pushName(s) {
    if (typeof s !== "string") {
      throw new Error("Expected string containing name");
    }
    const regex = new RegExp(/^[.1-5a-z]{0,12}[.1-5a-j]?$/);
    if (!regex.test(s)) {
      throw new Error(
        "Name should be less than 13 characters, or less than 14 if last character is between 1-5 or a-j, and only contain the following symbols .12345abcdefghijklmnopqrstuvwxyz"
      );
    }
    const charToSymbol = (c) => {
      if (c >= "a".charCodeAt(0) && c <= "z".charCodeAt(0)) {
        return c - "a".charCodeAt(0) + 6;
      }
      if (c >= "1".charCodeAt(0) && c <= "5".charCodeAt(0)) {
        return c - "1".charCodeAt(0) + 1;
      }
      return 0;
    };
    const a = new Uint8Array(8);
    let bit = 63;
    for (let i = 0; i < s.length; ++i) {
      let c = charToSymbol(s.charCodeAt(i));
      if (bit < 5) {
        c = c << 1;
      }
      for (let j = 4; j >= 0; --j) {
        if (bit >= 0) {
          a[Math.floor(bit / 8)] |= (c >> j & 1) << bit % 8;
          --bit;
        }
      }
    }
    this.pushArray(a);
  }
  getName() {
    const a = this.getUint8Array(8);
    let result = "";
    for (let bit = 63; bit >= 0; ) {
      let c = 0;
      for (let i = 0; i < 5; ++i) {
        if (bit >= 0) {
          c = c << 1 | a[Math.floor(bit / 8)] >> bit % 8 & 1;
          --bit;
        }
      }
      if (c >= 6) {
        result += String.fromCharCode(c + "a".charCodeAt(0) - 6);
      } else if (c >= 1) {
        result += String.fromCharCode(c + "1".charCodeAt(0) - 1);
      } else {
        result += ".";
      }
    }
    while (result.endsWith(".")) {
      result = result.substr(0, result.length - 1);
    }
    return result;
  }
  pushBytes(v) {
    this.pushVaruint32(v.length);
    this.pushArray(v);
  }
  getBytes() {
    return this.getUint8Array(this.getVaruint32());
  }
  pushString(v) {
    this.pushBytes(this.textEncoder.encode(v));
  }
  getString() {
    return this.textDecoder.decode(this.getBytes());
  }
  pushSymbolCode(name) {
    if (typeof name !== "string") {
      throw new Error("Expected string containing symbol_code");
    }
    const a = [];
    a.push(...this.textEncoder.encode(name));
    while (a.length < 8) {
      a.push(0);
    }
    this.pushArray(a.slice(0, 8));
  }
  getSymbolCode() {
    const a = this.getUint8Array(8);
    let len;
    for (len = 0; len < a.length; ++len) {
      if (!a[len]) {
        break;
      }
    }
    const name = this.textDecoder.decode(
      new Uint8Array(a.buffer, a.byteOffset, len)
    );
    return name;
  }
  pushSymbol({
    name,
    precision
  }) {
    if (!/^[A-Z]{1,7}$/.test(name)) {
      throw new Error(
        "Expected symbol to be A-Z and between one and seven characters"
      );
    }
    const a = [precision & 255];
    a.push(...this.textEncoder.encode(name));
    while (a.length < 8) {
      a.push(0);
    }
    this.pushArray(a.slice(0, 8));
  }
  getSymbol() {
    const precision = this.get();
    const a = this.getUint8Array(7);
    let len;
    for (len = 0; len < a.length; ++len) {
      if (!a[len]) {
        break;
      }
    }
    const name = this.textDecoder.decode(
      new Uint8Array(a.buffer, a.byteOffset, len)
    );
    return { name, precision };
  }
  pushAsset(s) {
    if (typeof s !== "string") {
      throw new Error("Expected string containing asset");
    }
    s = s.trim();
    let pos = 0;
    let amount = "";
    let precision = 0;
    if (s[pos] === "-") {
      amount += "-";
      ++pos;
    }
    let foundDigit = false;
    while (pos < s.length && s.charCodeAt(pos) >= "0".charCodeAt(0) && s.charCodeAt(pos) <= "9".charCodeAt(0)) {
      foundDigit = true;
      amount += s[pos];
      ++pos;
    }
    if (!foundDigit) {
      throw new Error("Asset must begin with a number");
    }
    if (s[pos] === ".") {
      ++pos;
      while (pos < s.length && s.charCodeAt(pos) >= "0".charCodeAt(0) && s.charCodeAt(pos) <= "9".charCodeAt(0)) {
        amount += s[pos];
        ++precision;
        ++pos;
      }
    }
    const name = s.substr(pos).trim();
    this.pushArray(signedDecimalToBinary(8, amount));
    this.pushSymbol({ name, precision });
  }
  getAsset() {
    const amount = this.getUint8Array(8);
    const { name, precision } = this.getSymbol();
    let s = signedBinaryToDecimal(amount, precision + 1);
    if (precision) {
      s = s.substr(0, s.length - precision) + "." + s.substr(s.length - precision);
    }
    return s + " " + name;
  }
  pushPublicKey(s) {
    const key = stringToPublicKey(s);
    this.push(key.type);
    this.pushArray(key.data);
  }
  getPublicKey() {
    const type = this.get();
    let data;
    if (type === 2 /* wa */) {
      const begin = this.readPos;
      this.skip(34);
      this.skip(this.getVaruint32());
      data = new Uint8Array(
        this.array.buffer,
        this.array.byteOffset + begin,
        this.readPos - begin
      );
    } else {
      data = this.getUint8Array(publicKeyDataSize);
    }
    return publicKeyToString({ type, data });
  }
  pushPrivateKey(s) {
    const key = stringToPrivateKey(s);
    this.push(key.type);
    this.pushArray(key.data);
  }
  getPrivateKey() {
    const type = this.get();
    const data = this.getUint8Array(privateKeyDataSize);
    return privateKeyToString({ type, data });
  }
  pushSignature(s) {
    const key = stringToSignature(s);
    this.push(key.type);
    this.pushArray(key.data);
  }
  getSignature() {
    const type = this.get();
    let data;
    if (type === 2 /* wa */) {
      const begin = this.readPos;
      this.skip(65);
      this.skip(this.getVaruint32());
      this.skip(this.getVaruint32());
      data = new Uint8Array(
        this.array.buffer,
        this.array.byteOffset + begin,
        this.readPos - begin
      );
    } else {
      data = this.getUint8Array(signatureDataSize);
    }
    return signatureToString({ type, data });
  }
};
var supportedAbiVersion = (version) => {
  return version.startsWith("eosio::abi/1.");
};
var checkDateParse = (date) => {
  const result = Date.parse(date);
  if (Number.isNaN(result)) {
    throw new Error("Invalid time format");
  }
  return result;
};
var dateToTimePoint = (date) => {
  return Math.round(checkDateParse(date + "Z") * 1e3);
};
var timePointToDate = (us) => {
  const s = new Date(us / 1e3).toISOString();
  return s.substr(0, s.length - 1);
};
var dateToTimePointSec = (date) => {
  return Math.round(checkDateParse(date + "Z") / 1e3);
};
var timePointSecToDate = (sec) => {
  const s = new Date(sec * 1e3).toISOString();
  return s.substr(0, s.length - 1);
};
var dateToBlockTimestamp = (date) => {
  return Math.round((checkDateParse(date + "Z") - 9466848e5) / 500);
};
var blockTimestampToDate = (slot) => {
  const s = new Date(slot * 500 + 9466848e5).toISOString();
  return s.substr(0, s.length - 1);
};
var stringToSymbol = (s) => {
  if (typeof s !== "string") {
    throw new Error("Expected string containing symbol");
  }
  const m = s.match(/^([0-9]+),([A-Z]+)$/);
  if (!m) {
    throw new Error("Invalid symbol");
  }
  return { name: m[2], precision: +m[1] };
};
var symbolToString = ({
  name,
  precision
}) => {
  return precision + "," + name;
};
var arrayToHex2 = (data) => {
  let result = "";
  for (const x of data) {
    result += ("00" + x.toString(16)).slice(-2);
  }
  return result.toUpperCase();
};
var hexToUint8Array = (hex) => {
  if (typeof hex !== "string") {
    throw new Error("Expected string containing hex digits");
  }
  if (hex.length % 2) {
    throw new Error("Odd number of hex digits");
  }
  const l = hex.length / 2;
  const result = new Uint8Array(l);
  for (let i = 0; i < l; ++i) {
    const x = parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(x)) {
      throw new Error("Expected hex string");
    }
    result[i] = x;
  }
  return result;
};
function serializeUnknown(_, __) {
  throw new Error("Don't know how to serialize " + this.name);
}
function deserializeUnknown(_) {
  throw new Error("Don't know how to deserialize " + this.name);
}
function serializeStruct(buffer, data, state = new SerializerState(), allowExtensions = true) {
  if (typeof data !== "object") {
    throw new Error("expected object containing data: " + JSON.stringify(data));
  }
  if (this.base) {
    this.base.serialize(buffer, data, state, allowExtensions);
  }
  for (const field of this.fields) {
    if (field.name in data) {
      if (state.skippedBinaryExtension) {
        throw new Error("unexpected " + this.name + "." + field.name);
      }
      field.type.serialize(
        buffer,
        data[field.name],
        state,
        allowExtensions && field === this.fields[this.fields.length - 1]
      );
    } else {
      if (allowExtensions && field.type.extensionOf) {
        state.skippedBinaryExtension = true;
      } else {
        throw new Error(
          "missing " + this.name + "." + field.name + " (type=" + field.type.name + ")"
        );
      }
    }
  }
}
function deserializeStruct(buffer, state = new SerializerState(), allowExtensions = true) {
  let result;
  if (this.base) {
    result = this.base.deserialize(buffer, state, allowExtensions);
  } else {
    result = {};
  }
  for (const field of this.fields) {
    if (allowExtensions && field.type.extensionOf && !buffer.haveReadData()) {
      state.skippedBinaryExtension = true;
    } else {
      result[field.name] = field.type.deserialize(
        buffer,
        state,
        allowExtensions
      );
    }
  }
  return result;
}
function serializeVariant(buffer, data, state, allowExtensions) {
  if (!Array.isArray(data) || data.length !== 2 || typeof data[0] !== "string") {
    throw new Error('expected variant: ["type", value]');
  }
  const i = this.fields.findIndex((field) => field.name === data[0]);
  if (i < 0) {
    throw new Error(`type "${data[0]}" is not valid for variant`);
  }
  buffer.pushVaruint32(i);
  this.fields[i].type.serialize(buffer, data[1], state, allowExtensions);
}
function deserializeVariant(buffer, state, allowExtensions) {
  const i = buffer.getVaruint32();
  if (i >= this.fields.length) {
    throw new Error(`type index ${i} is not valid for variant`);
  }
  const field = this.fields[i];
  return [field.name, field.type.deserialize(buffer, state, allowExtensions)];
}
function serializeArray(buffer, data, state, _) {
  buffer.pushVaruint32(data.length);
  for (const item of data) {
    this.arrayOf.serialize(buffer, item, state, false);
  }
}
function deserializeArray(buffer, state, _) {
  const len = buffer.getVaruint32();
  const result = [];
  for (let i = 0; i < len; ++i) {
    result.push(this.arrayOf.deserialize(buffer, state, false));
  }
  return result;
}
function serializeOptional(buffer, data, state, allowExtensions) {
  if (data === null || data === void 0) {
    buffer.push(0);
  } else {
    buffer.push(1);
    this.optionalOf.serialize(buffer, data, state, allowExtensions);
  }
}
function deserializeOptional(buffer, state, allowExtensions) {
  if (buffer.get()) {
    return this.optionalOf.deserialize(buffer, state, allowExtensions);
  } else {
    return null;
  }
}
function serializeExtension(buffer, data, state, allowExtensions) {
  this.extensionOf.serialize(buffer, data, state, allowExtensions);
}
function deserializeExtension(buffer, state, allowExtensions) {
  return this.extensionOf.deserialize(buffer, state, allowExtensions);
}
function serializeObject(buffer, data, state, allowExtensions) {
  const entries = Object.entries(data);
  buffer.pushVaruint32(entries.length);
  for (const [key, value] of entries) {
    const keyType = this.fields[0].type;
    const dataType = this.fields[1].type;
    keyType.serialize(buffer, key, state, allowExtensions);
    dataType.serialize(buffer, value, state, allowExtensions);
  }
}
function deserializeObject(buffer, state, allowExtensions) {
  const len = buffer.getVaruint32();
  const result = {};
  for (let i = 0; i < len; ++i) {
    const keyType = this.fields[0].type;
    const dataType = this.fields[1].type;
    const key = keyType.deserialize(buffer, state, allowExtensions);
    result[key] = dataType.deserialize(
      buffer,
      state,
      allowExtensions
    );
  }
  return result;
}
function serializePair(buffer, data, state, allowExtensions) {
  buffer.pushVaruint32(data.length);
  data.forEach((item) => {
    this.fields[0].type.serialize(buffer, item[0], state, allowExtensions);
    this.fields[1].type.serialize(buffer, item[1], state, allowExtensions);
  });
}
function deserializePair(buffer, state, allowExtensions) {
  const result = [];
  const len = buffer.getVaruint32();
  for (let i = 0; i < len; ++i) {
    result.push(
      this.fields[0].type.deserialize(buffer, state, allowExtensions)
    );
    result.push(
      this.fields[1].type.deserialize(buffer, state, allowExtensions)
    );
  }
  return result;
}
var createType = (attrs) => {
  return {
    name: "<missing name>",
    aliasOfName: "",
    arrayOf: void 0,
    optionalOf: void 0,
    extensionOf: void 0,
    baseName: "",
    base: void 0,
    fields: [],
    serialize: serializeUnknown,
    deserialize: deserializeUnknown,
    ...attrs
  };
};
var checkRange = (orig, converted) => {
  if (Number.isNaN(+orig) || Number.isNaN(+converted) || typeof orig !== "number" && typeof orig !== "string") {
    throw new Error("Expected number");
  }
  if (+orig !== +converted) {
    throw new Error("Number is out of range");
  }
  return +orig;
};
var createInitialTypes = () => {
  const result = new Map(
    Object.entries({
      bool: createType({
        name: "bool",
        serialize: (buffer, data) => {
          if (!(typeof data === "boolean" || typeof data === "number" && (data === 1 || data === 0))) {
            throw new Error("Expected boolean or number equal to 1 or 0");
          }
          buffer.push(data ? 1 : 0);
        },
        deserialize: (buffer) => {
          return !!buffer.get();
        }
      }),
      uint8: createType({
        name: "uint8",
        serialize: (buffer, data) => {
          buffer.push(checkRange(data, data & 255));
        },
        deserialize: (buffer) => {
          return buffer.get();
        }
      }),
      int8: createType({
        name: "int8",
        serialize: (buffer, data) => {
          buffer.push(checkRange(data, data << 24 >> 24));
        },
        deserialize: (buffer) => {
          return buffer.get() << 24 >> 24;
        }
      }),
      uint16: createType({
        name: "uint16",
        serialize: (buffer, data) => {
          buffer.pushUint16(checkRange(data, data & 65535));
        },
        deserialize: (buffer) => {
          return buffer.getUint16();
        }
      }),
      int16: createType({
        name: "int16",
        serialize: (buffer, data) => {
          buffer.pushUint16(checkRange(data, data << 16 >> 16));
        },
        deserialize: (buffer) => {
          return buffer.getUint16() << 16 >> 16;
        }
      }),
      uint32: createType({
        name: "uint32",
        serialize: (buffer, data) => {
          buffer.pushUint32(checkRange(data, data >>> 0));
        },
        deserialize: (buffer) => {
          return buffer.getUint32();
        }
      }),
      uint64: createType({
        name: "uint64",
        serialize: (buffer, data) => {
          buffer.pushArray(decimalToBinary(8, "" + data));
        },
        deserialize: (buffer) => {
          return binaryToDecimal(buffer.getUint8Array(8));
        }
      }),
      int64: createType({
        name: "int64",
        serialize: (buffer, data) => {
          buffer.pushArray(signedDecimalToBinary(8, "" + data));
        },
        deserialize: (buffer) => {
          return signedBinaryToDecimal(buffer.getUint8Array(8));
        }
      }),
      int32: createType({
        name: "int32",
        serialize: (buffer, data) => {
          buffer.pushUint32(checkRange(data, data | 0));
        },
        deserialize: (buffer) => {
          return buffer.getUint32() | 0;
        }
      }),
      varuint32: createType({
        name: "varuint32",
        serialize: (buffer, data) => {
          buffer.pushVaruint32(checkRange(data, data >>> 0));
        },
        deserialize: (buffer) => {
          return buffer.getVaruint32();
        }
      }),
      varint32: createType({
        name: "varint32",
        serialize: (buffer, data) => {
          buffer.pushVarint32(checkRange(data, data | 0));
        },
        deserialize: (buffer) => {
          return buffer.getVarint32();
        }
      }),
      uint128: createType({
        name: "uint128",
        serialize: (buffer, data) => {
          buffer.pushArray(decimalToBinary(16, "" + data));
        },
        deserialize: (buffer) => {
          return binaryToDecimal(buffer.getUint8Array(16));
        }
      }),
      int128: createType({
        name: "int128",
        serialize: (buffer, data) => {
          buffer.pushArray(signedDecimalToBinary(16, "" + data));
        },
        deserialize: (buffer) => {
          return signedBinaryToDecimal(buffer.getUint8Array(16));
        }
      }),
      float32: createType({
        name: "float32",
        serialize: (buffer, data) => {
          buffer.pushFloat32(data);
        },
        deserialize: (buffer) => {
          return buffer.getFloat32();
        }
      }),
      float64: createType({
        name: "float64",
        serialize: (buffer, data) => {
          buffer.pushFloat64(data);
        },
        deserialize: (buffer) => {
          return buffer.getFloat64();
        }
      }),
      float128: createType({
        name: "float128",
        serialize: (buffer, data) => {
          buffer.pushUint8ArrayChecked(hexToUint8Array(data), 16);
        },
        deserialize: (buffer) => {
          return arrayToHex2(buffer.getUint8Array(16));
        }
      }),
      bytes: createType({
        name: "bytes",
        serialize: (buffer, data) => {
          if (data instanceof Uint8Array || Array.isArray(data)) {
            buffer.pushBytes(data);
          } else {
            buffer.pushBytes(hexToUint8Array(data));
          }
        },
        deserialize: (buffer, state) => {
          if (state && state.options.bytesAsUint8Array) {
            return buffer.getBytes();
          } else {
            return arrayToHex2(buffer.getBytes());
          }
        }
      }),
      string: createType({
        name: "string",
        serialize: (buffer, data) => {
          buffer.pushString(data);
        },
        deserialize: (buffer) => {
          return buffer.getString();
        }
      }),
      name: createType({
        name: "name",
        serialize: (buffer, data) => {
          buffer.pushName(data);
        },
        deserialize: (buffer) => {
          return buffer.getName();
        }
      }),
      time_point: createType({
        name: "time_point",
        serialize: (buffer, data) => {
          buffer.pushNumberAsUint64(dateToTimePoint(data));
        },
        deserialize: (buffer) => {
          return timePointToDate(buffer.getUint64AsNumber());
        }
      }),
      time_point_sec: createType({
        name: "time_point_sec",
        serialize: (buffer, data) => {
          buffer.pushUint32(dateToTimePointSec(data));
        },
        deserialize: (buffer) => {
          return timePointSecToDate(buffer.getUint32());
        }
      }),
      block_timestamp_type: createType({
        name: "block_timestamp_type",
        serialize: (buffer, data) => {
          buffer.pushUint32(dateToBlockTimestamp(data));
        },
        deserialize: (buffer) => {
          return blockTimestampToDate(buffer.getUint32());
        }
      }),
      symbol_code: createType({
        name: "symbol_code",
        serialize: (buffer, data) => {
          buffer.pushSymbolCode(data);
        },
        deserialize: (buffer) => {
          return buffer.getSymbolCode();
        }
      }),
      symbol: createType({
        name: "symbol",
        serialize: (buffer, data) => {
          buffer.pushSymbol(stringToSymbol(data));
        },
        deserialize: (buffer) => {
          return symbolToString(buffer.getSymbol());
        }
      }),
      asset: createType({
        name: "asset",
        serialize: (buffer, data) => {
          buffer.pushAsset(data);
        },
        deserialize: (buffer) => {
          return buffer.getAsset();
        }
      }),
      checksum160: createType({
        name: "checksum160",
        serialize: (buffer, data) => {
          buffer.pushUint8ArrayChecked(hexToUint8Array(data), 20);
        },
        deserialize: (buffer) => {
          return arrayToHex2(buffer.getUint8Array(20));
        }
      }),
      checksum256: createType({
        name: "checksum256",
        serialize: (buffer, data) => {
          buffer.pushUint8ArrayChecked(hexToUint8Array(data), 32);
        },
        deserialize: (buffer) => {
          return arrayToHex2(buffer.getUint8Array(32));
        }
      }),
      checksum512: createType({
        name: "checksum512",
        serialize: (buffer, data) => {
          buffer.pushUint8ArrayChecked(hexToUint8Array(data), 64);
        },
        deserialize: (buffer) => {
          return arrayToHex2(buffer.getUint8Array(64));
        }
      }),
      public_key: createType({
        name: "public_key",
        serialize: (buffer, data) => {
          buffer.pushPublicKey(data);
        },
        deserialize: (buffer) => {
          return buffer.getPublicKey();
        }
      }),
      private_key: createType({
        name: "private_key",
        serialize: (buffer, data) => {
          buffer.pushPrivateKey(data);
        },
        deserialize: (buffer) => {
          return buffer.getPrivateKey();
        }
      }),
      signature: createType({
        name: "signature",
        serialize: (buffer, data) => {
          buffer.pushSignature(data);
        },
        deserialize: (buffer) => {
          return buffer.getSignature();
        }
      })
    })
  );
  result.set(
    "extended_asset",
    createType({
      name: "extended_asset",
      baseName: "",
      fields: [
        { name: "quantity", typeName: "asset", type: result.get("asset") },
        { name: "contract", typeName: "name", type: result.get("name") }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  return result;
};
var createAbiTypes = () => {
  const initialTypes = createInitialTypes();
  initialTypes.set(
    "extensions_entry",
    createType({
      name: "extensions_entry",
      baseName: "",
      fields: [
        { name: "tag", typeName: "uint16", type: void 0 },
        { name: "value", typeName: "bytes", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "type_def",
    createType({
      name: "type_def",
      baseName: "",
      fields: [
        { name: "new_type_name", typeName: "string", type: void 0 },
        { name: "type", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "field_def",
    createType({
      name: "field_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "string", type: void 0 },
        { name: "type", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "struct_def",
    createType({
      name: "struct_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "string", type: void 0 },
        { name: "base", typeName: "string", type: void 0 },
        { name: "fields", typeName: "field_def[]", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "action_def",
    createType({
      name: "action_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        { name: "type", typeName: "string", type: void 0 },
        { name: "ricardian_contract", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "table_def",
    createType({
      name: "table_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        { name: "index_type", typeName: "string", type: void 0 },
        { name: "key_names", typeName: "string[]", type: void 0 },
        { name: "key_types", typeName: "string[]", type: void 0 },
        { name: "type", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "clause_pair",
    createType({
      name: "clause_pair",
      baseName: "",
      fields: [
        { name: "id", typeName: "string", type: void 0 },
        { name: "body", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "error_message",
    createType({
      name: "error_message",
      baseName: "",
      fields: [
        { name: "error_code", typeName: "uint64", type: void 0 },
        { name: "error_msg", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "variant_def",
    createType({
      name: "variant_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "string", type: void 0 },
        { name: "types", typeName: "string[]", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "action_result",
    createType({
      name: "action_result",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        { name: "result_type", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "primary_key_index_def",
    createType({
      name: "primary_key_index_def",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        { name: "type", typeName: "string", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "secondary_index_def",
    createType({
      name: "secondary_index_def",
      baseName: "",
      fields: [{ name: "type", typeName: "string", type: void 0 }],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "secondary_indices",
    createType({
      name: "secondary_indices",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        {
          name: "secondary_index_def",
          typeName: "secondary_index_def",
          type: void 0
        }
      ],
      serialize: serializeObject,
      deserialize: deserializeObject
    })
  );
  initialTypes.set(
    "kv_table_entry_def",
    createType({
      name: "kv_table_entry_def",
      baseName: "",
      fields: [
        { name: "type", typeName: "string", type: void 0 },
        {
          name: "primary_index",
          typeName: "primary_key_index_def",
          type: void 0
        },
        {
          name: "secondary_indices",
          typeName: "secondary_indices",
          type: void 0
        }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "kv_table",
    createType({
      name: "kv_table",
      baseName: "",
      fields: [
        { name: "name", typeName: "name", type: void 0 },
        {
          name: "kv_table_entry_def",
          typeName: "kv_table_entry_def",
          type: void 0
        }
      ],
      serialize: serializeObject,
      deserialize: deserializeObject
    })
  );
  initialTypes.set(
    "abi_def",
    createType({
      name: "abi_def",
      baseName: "",
      fields: [
        { name: "version", typeName: "string", type: void 0 },
        { name: "types", typeName: "type_def[]", type: void 0 },
        { name: "structs", typeName: "struct_def[]", type: void 0 },
        { name: "actions", typeName: "action_def[]", type: void 0 },
        { name: "tables", typeName: "table_def[]", type: void 0 },
        {
          name: "ricardian_clauses",
          typeName: "clause_pair[]",
          type: void 0
        },
        {
          name: "error_messages",
          typeName: "error_message[]",
          type: void 0
        },
        {
          name: "abi_extensions",
          typeName: "extensions_entry[]",
          type: void 0
        },
        { name: "variants", typeName: "variant_def[]$", type: void 0 },
        {
          name: "action_results",
          typeName: "action_result[]$",
          type: void 0
        },
        { name: "kv_tables", typeName: "kv_table$", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  return initialTypes;
};
var createTransactionExtensionTypes = () => {
  const initialTypes = createInitialTypes();
  initialTypes.set(
    "resource_payer",
    createType({
      name: "resource_payer",
      baseName: "",
      fields: [
        { name: "payer", typeName: "name", type: void 0 },
        { name: "max_net_bytes", typeName: "uint64", type: void 0 },
        { name: "max_cpu_us", typeName: "uint64", type: void 0 },
        { name: "max_memory_bytes", typeName: "uint64", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  return initialTypes;
};
var createTransactionTypes = () => {
  const initialTypes = createInitialTypes();
  initialTypes.set(
    "permission_level",
    createType({
      name: "permission_level",
      baseName: "",
      fields: [
        { name: "actor", typeName: "name", type: void 0 },
        { name: "permission", typeName: "name", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "action",
    createType({
      name: "action",
      baseName: "",
      fields: [
        { name: "account", typeName: "name", type: void 0 },
        { name: "name", typeName: "name", type: void 0 },
        {
          name: "authorization",
          typeName: "permission_level[]",
          type: void 0
        },
        { name: "data", typeName: "bytes", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "extension",
    createType({
      name: "extension",
      baseName: "",
      fields: [
        { name: "type", typeName: "uint16", type: void 0 },
        { name: "data", typeName: "bytes", type: void 0 }
      ],
      serialize: serializePair,
      deserialize: deserializePair
    })
  );
  initialTypes.set(
    "transaction_header",
    createType({
      name: "transaction_header",
      baseName: "",
      fields: [
        { name: "expiration", typeName: "time_point_sec", type: void 0 },
        { name: "ref_block_num", typeName: "uint16", type: void 0 },
        { name: "ref_block_prefix", typeName: "uint32", type: void 0 },
        { name: "max_net_usage_words", typeName: "varuint32", type: void 0 },
        { name: "max_cpu_usage_ms", typeName: "uint8", type: void 0 },
        { name: "delay_sec", typeName: "varuint32", type: void 0 }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  initialTypes.set(
    "transaction",
    createType({
      name: "transaction",
      baseName: "transaction_header",
      fields: [
        { name: "context_free_actions", typeName: "action[]", type: void 0 },
        { name: "actions", typeName: "action[]", type: void 0 },
        {
          name: "transaction_extensions",
          typeName: "extension",
          type: void 0
        }
      ],
      serialize: serializeStruct,
      deserialize: deserializeStruct
    })
  );
  return initialTypes;
};
var getType = (types, name) => {
  const type = types.get(name);
  if (type && type.aliasOfName) {
    return getType(types, type.aliasOfName);
  }
  if (type) {
    return type;
  }
  if (name.endsWith("[]")) {
    return createType({
      name,
      arrayOf: getType(types, name.substr(0, name.length - 2)),
      serialize: serializeArray,
      deserialize: deserializeArray
    });
  }
  if (name.endsWith("?")) {
    return createType({
      name,
      optionalOf: getType(types, name.substr(0, name.length - 1)),
      serialize: serializeOptional,
      deserialize: deserializeOptional
    });
  }
  if (name.endsWith("$")) {
    return createType({
      name,
      extensionOf: getType(types, name.substr(0, name.length - 1)),
      serialize: serializeExtension,
      deserialize: deserializeExtension
    });
  }
  throw new Error("Unknown type: " + name);
};
var getTypesFromAbi = (initialTypes, abi) => {
  const types = new Map(initialTypes);
  if (abi && abi.types) {
    for (const { new_type_name, type } of abi.types) {
      types.set(
        new_type_name,
        createType({ name: new_type_name, aliasOfName: type })
      );
    }
  }
  if (abi && abi.structs) {
    for (const { name, base, fields } of abi.structs) {
      types.set(
        name,
        createType({
          name,
          baseName: base,
          fields: fields.map(({ name: n, type }) => ({
            name: n,
            typeName: type,
            type: void 0
          })),
          serialize: serializeStruct,
          deserialize: deserializeStruct
        })
      );
    }
  }
  if (abi && abi.variants) {
    for (const { name, types: t } of abi.variants) {
      types.set(
        name,
        createType({
          name,
          fields: t.map((s) => ({ name: s, typeName: s, type: void 0 })),
          serialize: serializeVariant,
          deserialize: deserializeVariant
        })
      );
    }
  }
  for (const [_, type] of types) {
    if (type.baseName) {
      type.base = getType(types, type.baseName);
    }
    for (const field of type.fields) {
      field.type = getType(types, field.typeName);
    }
  }
  return types;
};
var reverseHex = (h) => {
  return h.substr(6, 2) + h.substr(4, 2) + h.substr(2, 2) + h.substr(0, 2);
};
var transactionHeader = (refBlock, expireSeconds) => {
  const timestamp = refBlock.header ? refBlock.header.timestamp : refBlock.timestamp;
  const prefix = parseInt(reverseHex(refBlock.id.substr(16, 8)), 16);
  return {
    expiration: timePointSecToDate(
      dateToTimePointSec(timestamp) + expireSeconds
    ),
    ref_block_num: refBlock.block_num & 65535,
    ref_block_prefix: prefix
  };
};
var serializeActionData = (contract, account, name, data) => {
  const action = contract.actions.get(name);
  if (!action) {
    throw new Error(`Unknown action ${name} in contract ${account}`);
  }
  const buffer = new SerialBuffer();
  action.serialize(buffer, data);
  return arrayToHex2(buffer.asUint8Array());
};
var serializeAction = (contract, account, name, authorization, data) => {
  return {
    account,
    name,
    authorization,
    data: serializeActionData(contract, account, name, data)
  };
};
var deserializeActionData = (contract, account, name, data) => {
  const action = contract.actions.get(name);
  if (typeof data === "string") {
    data = hexToUint8Array(data);
  }
  if (!action) {
    throw new Error(`Unknown action ${name} in contract ${account}`);
  }
  const buffer = new SerialBuffer();
  buffer.pushArray(data);
  return action.deserialize(buffer);
};
var deserializeAction = (contract, account, name, authorization, data) => {
  return {
    account,
    name,
    authorization,
    data: deserializeActionData(contract, account, name, data)
  };
};
var serializeAnyvar = (buffer, anyvar) => {
  let def;
  let value;
  if (anyvar === null) {
    [def, value] = [anyvarDefs.null_t, anyvar];
  } else if (typeof anyvar === "string") {
    [def, value] = [anyvarDefs.string, anyvar];
  } else if (typeof anyvar === "number") {
    [def, value] = [anyvarDefs.int32, anyvar];
  } else if (anyvar instanceof Uint8Array) {
    [def, value] = [anyvarDefs.bytes, anyvar];
  } else if (Array.isArray(anyvar)) {
    [def, value] = [anyvarDefs.any_array, anyvar];
  } else if (Object.keys(anyvar).length === 2 && anyvar.hasOwnProperty("type") && anyvar.hasOwnProperty("value")) {
    [def, value] = [
      anyvarDefs[anyvar.type],
      anyvar.value
    ];
  } else {
    [def, value] = [anyvarDefs.any_object, anyvar];
  }
  buffer.pushVaruint32(def.index);
  def.type.serialize(buffer, value);
};
var deserializeAnyvar = (buffer, state) => {
  const defIndex = buffer.getVaruint32();
  if (defIndex >= anyvarDefsByIndex.length) {
    throw new Error("Tried to deserialize unknown anyvar type");
  }
  const def = anyvarDefsByIndex[defIndex];
  const value = def.type.deserialize(buffer, state);
  if (state && state.options.useShortForm || def.useShortForm) {
    return value;
  } else {
    return { type: def.type.name, value };
  }
};
var deserializeAnyvarShort = (buffer) => {
  return deserializeAnyvar(
    buffer,
    new SerializerState({ useShortForm: true })
  );
};
var serializeAnyObject = (buffer, obj) => {
  const entries = Object.entries(obj);
  buffer.pushVaruint32(entries.length);
  for (const [key, value] of entries) {
    buffer.pushString(key);
    serializeAnyvar(buffer, value);
  }
};
var deserializeAnyObject = (buffer, state) => {
  const len = buffer.getVaruint32();
  const result = {};
  for (let i = 0; i < len; ++i) {
    let key = buffer.getString();
    if (key in result) {
      let j = 1;
      while (key + "_" + j in result) {
        ++j;
      }
      key = key + "_" + j;
    }
    result[key] = deserializeAnyvar(buffer, state);
  }
  return result;
};
var serializeAnyArray = (buffer, arr) => {
  buffer.pushVaruint32(arr.length);
  for (const x of arr) {
    serializeAnyvar(buffer, x);
  }
};
var deserializeAnyArray = (buffer, state) => {
  const len = buffer.getVaruint32();
  const result = [];
  for (let i = 0; i < len; ++i) {
    result.push(deserializeAnyvar(buffer, state));
  }
  return result;
};
var addAdditionalTypes = () => {
  const initialTypes = createInitialTypes();
  initialTypes.set(
    "null_t",
    createType({
      name: "null_t",
      serialize: (_, __) => {
      },
      deserialize: (_, __) => {
      }
    })
  );
  initialTypes.set(
    "any_object",
    createType({
      name: "any_object",
      serialize: serializeAnyObject,
      deserialize: deserializeAnyObject
    })
  );
  initialTypes.set(
    "any_array",
    createType({
      name: "any_array",
      serialize: serializeAnyArray,
      deserialize: deserializeAnyArray
    })
  );
  return initialTypes;
};
var additionalTypes = addAdditionalTypes();
var anyvarDefs = {
  null_t: { index: 0, useShortForm: true, type: additionalTypes.get("null_t") },
  int64: { index: 1, useShortForm: false, type: additionalTypes.get("int64") },
  uint64: {
    index: 2,
    useShortForm: false,
    type: additionalTypes.get("uint64")
  },
  int32: { index: 3, useShortForm: true, type: additionalTypes.get("int32") },
  uint32: {
    index: 4,
    useShortForm: false,
    type: additionalTypes.get("uint32")
  },
  int16: { index: 5, useShortForm: false, type: additionalTypes.get("int16") },
  uint16: {
    index: 6,
    useShortForm: false,
    type: additionalTypes.get("uint16")
  },
  int8: { index: 7, useShortForm: false, type: additionalTypes.get("int8") },
  uint8: { index: 8, useShortForm: false, type: additionalTypes.get("uint8") },
  time_point: {
    index: 9,
    useShortForm: false,
    type: additionalTypes.get("time_point")
  },
  checksum256: {
    index: 10,
    useShortForm: false,
    type: additionalTypes.get("checksum256")
  },
  float64: {
    index: 11,
    useShortForm: false,
    type: additionalTypes.get("float64")
  },
  string: {
    index: 12,
    useShortForm: true,
    type: additionalTypes.get("string")
  },
  any_object: {
    index: 13,
    useShortForm: true,
    type: additionalTypes.get("any_object")
  },
  any_array: {
    index: 14,
    useShortForm: true,
    type: additionalTypes.get("any_array")
  },
  bytes: { index: 15, useShortForm: false, type: additionalTypes.get("bytes") },
  symbol: {
    index: 16,
    useShortForm: false,
    type: additionalTypes.get("symbol")
  },
  symbol_code: {
    index: 17,
    useShortForm: false,
    type: additionalTypes.get("symbol_code")
  },
  asset: { index: 18, useShortForm: false, type: additionalTypes.get("asset") }
};
var anyvarDefsByIndex = [
  anyvarDefs.null_t,
  anyvarDefs.int64,
  anyvarDefs.uint64,
  anyvarDefs.int32,
  anyvarDefs.uint32,
  anyvarDefs.int16,
  anyvarDefs.uint16,
  anyvarDefs.int8,
  anyvarDefs.uint8,
  anyvarDefs.time_point,
  anyvarDefs.checksum256,
  anyvarDefs.float64,
  anyvarDefs.string,
  anyvarDefs.any_object,
  anyvarDefs.any_array,
  anyvarDefs.bytes,
  anyvarDefs.symbol,
  anyvarDefs.symbol_code,
  anyvarDefs.asset
];
var serializeQuery = (buffer, query) => {
  let method;
  let arg;
  let filter;
  if (typeof query === "string") {
    method = query;
  } else if (Array.isArray(query) && query.length === 2) {
    [method, filter] = query;
  } else if (Array.isArray(query) && query.length === 3) {
    [method, arg, filter] = query;
  } else {
    [method, arg, filter] = [query.method, query.arg, query.filter];
  }
  buffer.pushString(method);
  if (arg === void 0) {
    buffer.push(0);
  } else {
    buffer.push(1);
    serializeAnyvar(buffer, arg);
  }
  if (filter === void 0) {
    buffer.push(0);
  } else {
    buffer.pushVaruint32(filter.length);
    for (const q of filter) {
      serializeQuery(buffer, q);
    }
  }
};
function b64tob64u(a) {
  a = a.replace(/\=/g, "");
  a = a.replace(/\+/g, "-");
  a = a.replace(/\//g, "_");
  return a;
}
function createBaseResolvedTransaction() {
  return {
    expiration: new Date().toISOString().slice(0, -1),
    ref_block_num: 0,
    ref_block_prefix: 0,
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [],
    transaction_extensions: []
  };
}

// src/cryptography/key.ts
var key_exports = {};
__export(key_exports, {
  PrivateKey: () => PrivateKey,
  PublicKey: () => PublicKey,
  Signature: () => Signature,
  constructElliptic: () => constructElliptic,
  generateKeyPair: () => generateKeyPair,
  k1Ec: () => k1Ec,
  r1Ec: () => r1Ec
});

// src/cryptography/publicKey.ts
var decodeWaPublicKey = (key) => {
  if (key.type !== 2 /* wa */) {
    throw new Error("Not WA Public Key (starts with PUB_WA_)");
  }
  const ser = new SerialBuffer({ array: key.data });
  const data = ser.getUint8Array(33);
  const userPresence = ser.get();
  const rpid = ser.getString();
  return {
    data,
    userPresence,
    rpid
  };
};
var PublicKey = class {
  constructor(key) {
    this.key = key;
    this.ec = constructElliptic(key.type);
  }
  static fromString(publicKeyStr) {
    const key = stringToPublicKey(publicKeyStr);
    return new PublicKey(key);
  }
  static fromElliptic(publicKey, keyType) {
    const x = publicKey.getPublic().getX().toArray("be", 32);
    const y = publicKey.getPublic().getY().toArray("be", 32);
    return new PublicKey({
      type: keyType,
      data: new Uint8Array([y[31] & 1 ? 3 : 2].concat(x))
    });
  }
  static equal(pk1, pk2) {
    return pk1.key.type === pk2.key.type && pk1.key.data.length === pk2.key.data.length && pk1.key.data.every((_, i) => _ === pk2.key.data[i]) && pk1.ec === pk2.ec;
  }
  toString() {
    return publicKeyToString(this.key);
  }
  toLegacyString(prefix) {
    return publicKeyToLegacyString(this.key, prefix);
  }
  toElliptic() {
    return this.ec.keyPair({
      pub: Buffer.from(this.key.data.slice(0, 33))
    });
  }
  getType() {
    return this.key.type;
  }
  isValid() {
    try {
      const ellipticPublicKey = this.toElliptic();
      const validationObj = ellipticPublicKey.validate();
      return validationObj.result;
    } catch {
      return false;
    }
  }
};

// src/cryptography/signature.ts
import BN from "bn.js";

// src/api/hash.ts
import * as hash from "hash.js";
var sha2563 = (data) => {
  return hash.sha256().update(data).digest("hex");
};
var sha256Array = (data) => {
  return hash.sha256().update(data).digest();
};

// src/cryptography/signature.ts
import base64url from "base64url";
var decodeWaSignature = (key) => {
  if (key.type !== 2 /* wa */) {
    throw new Error("Not WA Signature (starts with SIG_WA)");
  }
  const ser = new SerialBuffer({ array: key.data });
  const signature = new Signature({
    type: 1 /* r1 */,
    data: ser.getUint8Array(65)
  });
  const authenticatorData = ser.getBytes().slice();
  const clientDataJSONBytes = ser.getBytes().slice();
  const whatItReallySigned = new SerialBuffer();
  whatItReallySigned.pushArray(authenticatorData);
  whatItReallySigned.pushArray(sha256Array(clientDataJSONBytes));
  const digest = new Uint8Array(
    sha256Array(whatItReallySigned.asUint8Array().slice())
  );
  let userPresence = 0 /* none */;
  if (authenticatorData[32] & 1) {
    userPresence = 1 /* present */;
  }
  if (authenticatorData[32] & 4) {
    userPresence = 2 /* verified */;
  }
  const clientDataJSON = JSON.parse(
    Buffer.from(clientDataJSONBytes).toString("utf8")
  );
  const rpid = clientDataJSON.origin.replace("https://", "");
  return {
    signature,
    authenticatorData,
    clientDataJSON,
    userPresence,
    rpid,
    digest
  };
};
var Signature = class {
  constructor(signature) {
    this.signature = signature;
    this.ec = constructElliptic(signature.type);
  }
  static fromString(sig) {
    const signature = stringToSignature(sig);
    return new Signature(signature);
  }
  static fromElliptic(ellipticSig, keyType) {
    if (!ellipticSig.recoveryParam) {
      ellipticSig.recoveryParam = 0;
    }
    const r = ellipticSig.r.toArray("be", 32);
    const s = ellipticSig.s.toArray("be", 32);
    let eosioRecoveryParam;
    if (keyType === 0 /* k1 */ || keyType === 1 /* r1 */) {
      eosioRecoveryParam = ellipticSig.recoveryParam + 27;
      if (ellipticSig.recoveryParam <= 3) {
        eosioRecoveryParam += 4;
      }
    } else if (keyType === 2 /* wa */) {
      eosioRecoveryParam = ellipticSig.recoveryParam;
    }
    const sigData = new Uint8Array([eosioRecoveryParam].concat(r, s));
    return new Signature({
      type: keyType,
      data: sigData
    });
  }
  toElliptic() {
    const lengthOfR = 32;
    const lengthOfS = 32;
    const r = new BN(this.signature.data.slice(1, lengthOfR + 1));
    const s = new BN(
      this.signature.data.slice(lengthOfR + 1, lengthOfR + lengthOfS + 1)
    );
    let ellipticRecoveryBitField;
    if (this.signature.type === 0 /* k1 */ || this.signature.type === 1 /* r1 */) {
      ellipticRecoveryBitField = this.signature.data[0] - 27;
      if (ellipticRecoveryBitField > 3) {
        ellipticRecoveryBitField -= 4;
      }
    } else if (this.signature.type === 2 /* wa */) {
      ellipticRecoveryBitField = this.signature.data[0];
    } else {
      ellipticRecoveryBitField = 0;
    }
    const recoveryParam = ellipticRecoveryBitField & 3;
    return { r, s, recoveryParam };
  }
  toString() {
    return signatureToString(this.signature);
  }
  toBinary() {
    return this.signature.data;
  }
  getType() {
    return this.signature.type;
  }
  getEc() {
    return this.ec;
  }
  verify(data, publicKey, shouldHash = true, encoding = "utf8") {
    if (this.getType() !== publicKey.getType()) {
      return false;
    }
    if (shouldHash) {
      if (typeof data === "string") {
        data = Buffer.from(data, encoding);
      }
      data = this.ec.hash().update(data).digest();
    }
    const keyType = publicKey.getType();
    const ellipticSignature = this.toElliptic();
    const ellipticPublicKey = publicKey.toElliptic();
    if (keyType === 2 /* wa */) {
      const decodedWaKey = decodeWaPublicKey(publicKey.key);
      const decodedWaSignature = decodeWaSignature(this.signature);
      const { rpid, userPresence, authenticatorData, digest } = decodedWaSignature;
      const { type, challenge, origin } = decodedWaSignature.clientDataJSON;
      if (type !== "webauthn.get") {
        console.log("Invalid Signature Type");
        return false;
      }
      const decodedChallenge = base64url.decode(challenge);
      const verifyDigest = Buffer.from(data).toString(encoding);
      if (decodedChallenge !== verifyDigest) {
        console.log("Invalid Challenge Decoded");
        return false;
      }
      if (authenticatorData.length < 37) {
        console.log("Invalid Authenticator Data");
        return false;
      }
      if (!origin.startsWith("https://")) {
        console.log("Invalid Origin");
        return false;
      }
      if (rpid !== decodedWaKey.rpid) {
        console.log("Invalid Rpid");
        return false;
      }
      const rpidHash = sha256Array(rpid);
      if (!rpidHash.every((_, i) => _ === authenticatorData[i])) {
        return false;
      }
      if (userPresence < decodedWaKey.userPresence) {
        console.log("Invalid User Presence");
        return false;
      }
      data = digest;
    }
    return this.ec.verify(data, ellipticSignature, ellipticPublicKey, encoding);
  }
  recover(data, shouldHash = true, encoding = "utf8") {
    if (shouldHash) {
      if (typeof data === "string") {
        data = Buffer.from(data, encoding);
      }
      data = this.ec.hash().update(data).digest();
    }
    const ellipticSignature = this.toElliptic();
    if (this.signature.type === 2 /* wa */) {
      const { signature, digest, userPresence, rpid, clientDataJSON } = decodeWaSignature(this.signature);
      const recoveredR1Key = signature.recover(digest, false);
      const decodedChallenge = base64url.decode(clientDataJSON.challenge);
      const verifyDigest = Buffer.from(data).toString(encoding);
      if (decodedChallenge !== verifyDigest) {
        throw new Error("Invalid recovery: digest signed does not match data");
      }
      const buffer = new SerialBuffer();
      buffer.pushArray(recoveredR1Key.key.data);
      buffer.push(userPresence);
      buffer.pushString(rpid);
      return new PublicKey({
        type: 2 /* wa */,
        data: buffer.asUint8Array()
      });
    } else {
      const recoveredPublicKey = this.ec.recoverPubKey(
        data,
        ellipticSignature,
        ellipticSignature.recoveryParam,
        encoding
      );
      const ellipticKPub = this.ec.keyFromPublic(recoveredPublicKey);
      return PublicKey.fromElliptic(ellipticKPub, this.getType());
    }
  }
};

// src/cryptography/privateKey.ts
var PrivateKey = class {
  constructor(key) {
    this.key = key;
    this.ec = constructElliptic(key.type);
  }
  static fromElliptic(privKey, keyType) {
    return new PrivateKey({
      type: keyType,
      data: privKey.getPrivate().toArrayLike(Buffer, "be", 32)
    });
  }
  static fromString(keyString) {
    const privateKey = stringToPrivateKey(keyString);
    return new PrivateKey(privateKey);
  }
  toElliptic() {
    return this.ec.keyFromPrivate(this.key.data);
  }
  toLegacyString() {
    return privateKeyToLegacyString(this.key);
  }
  toString() {
    return privateKeyToString(this.key);
  }
  getType() {
    return this.key.type;
  }
  getPublicKey() {
    const ellipticPrivateKey = this.toElliptic();
    return PublicKey.fromElliptic(ellipticPrivateKey, this.getType());
  }
  sign(data, shouldHash = true, encoding = "utf8") {
    if (shouldHash) {
      if (typeof data === "string") {
        data = Buffer.from(data, encoding);
      }
      data = this.ec.hash().update(data).digest();
    }
    let tries = 0;
    let signature;
    const isCanonical = (sigData) => !(sigData[1] & 128) && !(sigData[1] === 0 && !(sigData[2] & 128)) && !(sigData[33] & 128) && !(sigData[33] === 0 && !(sigData[34] & 128));
    const constructSignature = (options) => {
      const ellipticPrivateKey = this.toElliptic();
      const ellipticSignature = ellipticPrivateKey.sign(data, options);
      return Signature.fromElliptic(ellipticSignature, this.getType());
    };
    if (this.key.type === 0 /* k1 */) {
      do {
        signature = constructSignature({ canonical: true, pers: [++tries] });
      } while (!isCanonical(signature.toBinary()));
    } else {
      signature = constructSignature({ canonical: true });
    }
    return signature;
  }
  isValid() {
    try {
      const ellipticPrivateKey = this.toElliptic();
      const validationObj = ellipticPrivateKey.validate();
      return validationObj.result;
    } catch {
      return false;
    }
  }
};

// src/cryptography/key.ts
import { ec as EC } from "elliptic";
var k1Ec = new EC("secp256k1");
var r1Ec = new EC("p256");
var constructElliptic = (type) => {
  if (type === 0 /* k1 */) {
    return k1Ec;
  }
  return r1Ec;
};
var generateKeyPair = (type, options = {}) => {
  if (!options.secureEnv) {
    throw new Error(
      "Key generation is completely INSECURE in production environments in the browser. If you are absolutely certain this does NOT describe your environment, set `secureEnv` in your options to `true`.  If this does describe your environment and you set `secureEnv` to `true`, YOU DO SO AT YOUR OWN RISK AND THE RISK OF YOUR USERS."
    );
  }
  let ec;
  if (type === 0 /* k1 */) {
    ec = k1Ec;
  } else {
    ec = r1Ec;
  }
  const ellipticKeyPair = ec.genKeyPair(options.ecOptions);
  const publicKey = PublicKey.fromElliptic(ellipticKeyPair, type);
  const privateKey = PrivateKey.fromElliptic(ellipticKeyPair, type);
  return { publicKey, privateKey };
};

// src/cryptography/jsSignatureProvider.ts
var digestFromSerializedData = (chainId, serializedTransaction, serializedContextFreeData, e = k1Ec) => {
  const signBuf = Buffer.concat([
    Buffer.from(chainId, "hex"),
    Buffer.from(serializedTransaction),
    Buffer.from(
      serializedContextFreeData ? new Uint8Array(e.hash().update(serializedContextFreeData).digest()) : new Uint8Array(32)
    )
  ]);
  return e.hash().update(signBuf).digest();
};
var JsSignatureProvider = class {
  constructor(privateKeys) {
    this.keys = /* @__PURE__ */ new Map();
    this.availableKeys = [];
    for (const k of privateKeys) {
      const priv = PrivateKey.fromString(k);
      const privElliptic = priv.toElliptic();
      const pubStr = priv.getPublicKey().toString();
      this.keys.set(pubStr, privElliptic);
      this.availableKeys.push(pubStr);
    }
  }
  async getAvailableKeys() {
    return this.availableKeys;
  }
  async sign({
    chainId,
    requiredKeys,
    serializedTransaction,
    serializedContextFreeData
  }) {
    const digest = digestFromSerializedData(
      chainId,
      serializedTransaction,
      serializedContextFreeData,
      k1Ec
    );
    const signatures = [];
    for (const key of requiredKeys) {
      const publicKey = PublicKey.fromString(key);
      const ellipticPrivateKey = this.keys.get(convertLegacyPublicKey(key));
      if (ellipticPrivateKey) {
        const privateKey = PrivateKey.fromElliptic(
          ellipticPrivateKey,
          publicKey.getType()
        );
        const signature = privateKey.sign(digest, false);
        signatures.push(signature.toString());
      }
    }
    return { signatures, serializedTransaction, serializedContextFreeData };
  }
};

// src/api/index.ts
var Api = class {
  constructor(args) {
    this.contracts = /* @__PURE__ */ new Map();
    this.cachedAbis = /* @__PURE__ */ new Map();
    this.transactionExtensions = [
      {
        id: 1,
        type: "resource_payer",
        keys: ["payer", "max_net_bytes", "max_cpu_us", "max_memory_bytes"]
      }
    ];
    this.rpc = args.rpc;
    this.authorityProvider = args.authorityProvider || args.rpc;
    this.abiProvider = args.abiProvider || args.rpc;
    if (args.signatureProvider) {
      this.signatureProvider = args.signatureProvider;
    }
    this.abiTypes = getTypesFromAbi(createAbiTypes());
    this.transactionTypes = getTypesFromAbi(createTransactionTypes());
    this.crypto = args.crypto || typeof window !== "undefined" && window && window.crypto || global && global.crypto;
    this.recoverPersonalSignature = args.recoverPersonalSignature;
  }
  getCrypto() {
    if (!this.crypto) {
      throw new Error(
        `No 'crypto' module found. On nodejs, do const { Crypto } = require('@peculiar/webcrypto'); const crypto = new Crypto; new Api({ rpc, crypto });`
      );
    }
    return this.crypto;
  }
  getRecoverPersonalSignature() {
    if (!this.recoverPersonalSignature) {
      throw new Error(
        `No 'recoverPersonalSignature' function found. Do const { recoverPersonalSignature } = require('eth-sig-util'); new Api({ rpc, recoverPersonalSignature });`
      );
    }
    return this.recoverPersonalSignature;
  }
  rawAbiToJson(rawAbi) {
    const buffer = new SerialBuffer({
      array: rawAbi
    });
    if (!supportedAbiVersion(buffer.getString())) {
      throw new Error("Unsupported abi version");
    }
    buffer.restartRead();
    return this.abiTypes.get("abi_def").deserialize(buffer);
  }
  jsonToRawAbi(jsonAbi) {
    const buffer = new SerialBuffer();
    this.abiTypes.get("abi_def").serialize(buffer, jsonAbi);
    if (!supportedAbiVersion(buffer.getString())) {
      throw new Error("Unsupported abi version");
    }
    return buffer.asUint8Array();
  }
  async getCachedAbi(accountName, reload = false) {
    console.log("get abi for", accountName);
    if (!reload && this.cachedAbis.get(accountName)) {
      return this.cachedAbis.get(accountName);
    }
    let cachedAbi;
    try {
      const rawAbi = (await this.abiProvider.getRawAbi(accountName)).abi;
      const abi = this.rawAbiToJson(rawAbi);
      cachedAbi = { rawAbi, abi };
    } catch (e) {
      e.message = `fetching abi for ${accountName}: ${e.message}`;
      throw e;
    }
    if (!cachedAbi) {
      throw new Error(`Missing abi for ${accountName}`);
    }
    this.cachedAbis.set(accountName, cachedAbi);
    return cachedAbi;
  }
  async getAbi(accountName, reload = false) {
    return (await this.getCachedAbi(accountName, reload)).abi;
  }
  async getTransactionAbis(transaction, reload = false) {
    const actions = (transaction.context_free_actions || []).concat(
      transaction.actions
    );
    const accounts = actions.map(
      (action) => action.account
    );
    const uniqueAccounts = new Set(accounts);
    const actionPromises = Array.from(uniqueAccounts).map(
      async (account) => {
        const { rawAbi } = await this.getCachedAbi(account, reload);
        return {
          accountName: account,
          abi: rawAbi
        };
      }
    );
    return Promise.all(actionPromises);
  }
  async getContract(accountName, reload = false) {
    if (!reload && this.contracts.get(accountName)) {
      return this.contracts.get(accountName);
    }
    const abi = await this.getAbi(accountName, reload);
    const types = getTypesFromAbi(createInitialTypes(), abi);
    const actions = /* @__PURE__ */ new Map();
    for (const { name, type } of abi.actions) {
      actions.set(name, getType(types, type));
    }
    const result = { types, actions };
    this.contracts.set(accountName, result);
    return result;
  }
  serialize(buffer, type, value) {
    this.transactionTypes.get(type).serialize(buffer, value);
  }
  deserialize(buffer, type) {
    return this.transactionTypes.get(type).deserialize(buffer);
  }
  serializeTransaction(transaction) {
    const buffer = new SerialBuffer();
    this.serialize(buffer, "transaction", {
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      transaction_extensions: [],
      ...transaction
    });
    return buffer.asUint8Array();
  }
  serializeContextFreeData(contextFreeData) {
    if (!contextFreeData || !contextFreeData.length) {
      return void 0;
    }
    const buffer = new SerialBuffer();
    buffer.pushVaruint32(contextFreeData.length);
    for (const data of contextFreeData) {
      buffer.pushBytes(data);
    }
    return buffer.asUint8Array();
  }
  deserializeTransaction(transaction) {
    const buffer = new SerialBuffer();
    buffer.pushArray(transaction);
    return this.deserialize(buffer, "transaction");
  }
  serializeTransactionExtensions(transaction) {
    let transaction_extensions = [];
    if (transaction.resource_payer) {
      const extensionBuffer = new SerialBuffer();
      const types = getTypesFromAbi(createTransactionExtensionTypes());
      types.get("resource_payer").serialize(extensionBuffer, transaction.resource_payer);
      transaction_extensions = [
        ...transaction_extensions,
        [1, arrayToHex2(extensionBuffer.asUint8Array())]
      ];
    }
    return transaction_extensions;
  }
  deserializeTransactionExtensions(data) {
    const transaction = {};
    data.forEach((extensionData) => {
      const transactionExtension = this.transactionExtensions.find(
        (extension) => extension.id === extensionData[0]
      );
      if (transactionExtension === void 0) {
        throw new Error(
          `Transaction Extension could not be determined: ${extensionData}`
        );
      }
      const types = getTypesFromAbi(createTransactionExtensionTypes());
      const extensionBuffer = new SerialBuffer();
      extensionBuffer.pushArray(hexToUint8Array(extensionData[1]));
      const deserializedObj = types.get(transactionExtension.type).deserialize(extensionBuffer);
      if (extensionData[0] === 1) {
        deserializedObj.max_net_bytes = Number(deserializedObj.max_net_bytes);
        deserializedObj.max_cpu_us = Number(deserializedObj.max_cpu_us);
        deserializedObj.max_memory_bytes = Number(
          deserializedObj.max_memory_bytes
        );
        transaction.resource_payer = deserializedObj;
      }
    });
    return transaction;
  }
  deleteTransactionExtensionObjects(transaction) {
    delete transaction.resource_payer;
    return transaction;
  }
  async serializeActions(actions) {
    return await Promise.all(
      actions.map(async (action) => {
        const { account, name, authorization, data } = action;
        const contract = await this.getContract(account);
        if (typeof data !== "object") {
          return action;
        }
        return serializeAction(
          contract,
          account,
          name,
          authorization,
          data
        );
      })
    );
  }
  async deserializeActions(actions) {
    return await Promise.all(
      actions.map(async ({ account, name, authorization, data }) => {
        const contract = await this.getContract(account);
        return deserializeAction(
          contract,
          account,
          name,
          authorization,
          data
        );
      })
    );
  }
  async deserializeActionsSync(actions = []) {
    let deserializedActions = [];
    for (const { account, name, authorization, data } of actions) {
      const contract = await this.getContract(account);
      deserializedActions.push(
        deserializeAction(contract, account, name, authorization, data)
      );
    }
    return deserializedActions;
  }
  async deserializeActionsSyncWithAbi(actions = []) {
    let dsActions = [];
    for (const action of actions) {
      console.log("action", action);
      try {
        const { account, name, authorization, data } = action;
        const contract = await this.getContract(account);
        const dsAction = deserializeAction(
          contract,
          account,
          name,
          authorization,
          data
        );
        if (dsAction.account === "eosio" && dsAction.name === "setabi") {
          const rawAbi = hexToUint8Array(dsAction.data.abi);
          console.log(dsAction.data.account);
          dsAction.data.abi = await this.rawAbiToJson(rawAbi);
          this.cachedAbis.set(dsAction.data.account, {
            rawAbi,
            abi: dsAction.data.abi
          });
        }
        dsActions.push(dsAction);
      } catch (e) {
        console.log(e);
        dsActions.push(action);
      }
    }
    return dsActions;
  }
  async serializeTransactionWithActions(transaction) {
    transaction.context_free_actions = await this.serializeActions(
      transaction.context_free_actions || []
    );
    transaction.actions = await this.serializeActions(transaction.actions);
    const serializedTransaction = this.serializeTransaction(transaction);
    const serializedContextFreeData = this.serializeContextFreeData(
      transaction.context_free_data
    );
    return {
      serializedTransaction,
      serializedContextFreeData
    };
  }
  async deserializeTransactionWithActions(transaction) {
    if (typeof transaction === "string") {
      transaction = hexToUint8Array(transaction);
    }
    const deserializedTransaction = this.deserializeTransaction(transaction);
    const deserializedCFActions = await this.deserializeActionsSync(
      deserializedTransaction.context_free_actions
    );
    const deserializedActions = await this.deserializeActionsSync(
      deserializedTransaction.actions
    );
    return {
      ...deserializedTransaction,
      context_free_actions: deserializedCFActions,
      actions: deserializedActions
    };
  }
  deflateSerializedArray(serializedArray) {
    return deflate(serializedArray, { level: 9 });
  }
  inflateSerializedArray(compressedSerializedArray) {
    return inflate(compressedSerializedArray);
  }
  async transact(transaction, {
    broadcast = true,
    sign = true,
    readOnlyTrx,
    returnFailureTraces,
    requiredKeys,
    compression,
    blocksBehind,
    useLastIrreversible,
    expireSeconds,
    transactionHeader: transactionHeader2
  } = {}) {
    const info = await this.rpc.get_info();
    if (!transactionHeader2) {
      if (typeof blocksBehind === "number" && useLastIrreversible) {
        throw new Error("Use either blocksBehind or useLastIrreversible");
      } else if (typeof blocksBehind !== "number" && !useLastIrreversible) {
        throw new Error("Must provide one blocksBehind or useLastIrreversible");
      } else if (!expireSeconds) {
        throw new Error("Must provide expireSeconds");
      } else {
        transactionHeader2 = await this.generateTapos(
          info,
          transaction,
          blocksBehind,
          useLastIrreversible,
          expireSeconds
        );
      }
      if (!this.hasRequiredTaposFields(transactionHeader2)) {
        throw new Error(
          "Required configuration or TAPOS fields are not present"
        );
      }
    }
    const abis = await this.getTransactionAbis(transaction);
    transaction = {
      ...transactionHeader2,
      transaction_extensions: await this.serializeTransactionExtensions(
        transaction
      ),
      context_free_actions: await this.serializeActions(
        transaction.context_free_actions || []
      ),
      actions: await this.serializeActions(transaction.actions)
    };
    transaction = this.deleteTransactionExtensionObjects(transaction);
    const serializedTransaction = this.serializeTransaction(transaction);
    const serializedContextFreeData = this.serializeContextFreeData(
      transaction.context_free_data
    );
    let pushTransactionArgs = {
      serializedTransaction,
      serializedContextFreeData,
      signatures: []
    };
    if (sign) {
      if (!this.signatureProvider) {
        throw new Error("No signature provider available");
      }
      if (!requiredKeys) {
        const availableKeys = await this.signatureProvider.getAvailableKeys();
        requiredKeys = await this.authorityProvider.getRequiredKeys({
          transaction,
          availableKeys
        });
      }
      pushTransactionArgs = await this.signatureProvider.sign({
        chainId: info.chain_id,
        requiredKeys,
        serializedTransaction,
        serializedContextFreeData,
        abis
      });
    }
    if (broadcast) {
      if (compression) {
        return this.pushCompressedSignedTransaction(
          pushTransactionArgs,
          readOnlyTrx,
          returnFailureTraces
        );
      }
      return this.pushSignedTransaction(
        pushTransactionArgs,
        readOnlyTrx,
        returnFailureTraces
      );
    }
    return {
      ...pushTransactionArgs,
      transactionHeader: transactionHeader2
    };
  }
  async transactWithDelay(transaction, params = {}, delay) {
    async function wait(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
    const success = await this.transact(transaction, params);
    await wait(delay);
    return success;
  }
  async query(account, short, query, { sign, requiredKeys, authorization = [] }) {
    const info = await this.rpc.get_info();
    const refBlock = await this.tryRefBlockFromGetInfo(info);
    const queryBuffer = new SerialBuffer();
    serializeQuery(queryBuffer, query);
    const transaction = {
      ...transactionHeader(refBlock, 60 * 30),
      context_free_actions: [],
      actions: [
        {
          account,
          name: "queryit",
          authorization,
          data: arrayToHex2(queryBuffer.asUint8Array())
        }
      ]
    };
    const serializedTransaction = this.serializeTransaction(transaction);
    let signatures = [];
    if (sign) {
      if (!this.signatureProvider) {
        throw new Error("No signature provider available");
      }
      const abis = await this.getTransactionAbis(transaction);
      if (!requiredKeys) {
        const availableKeys = await this.signatureProvider.getAvailableKeys();
        requiredKeys = await this.authorityProvider.getRequiredKeys({
          transaction,
          availableKeys
        });
      }
      const signResponse = await this.signatureProvider.sign({
        chainId: info.chain_id,
        requiredKeys,
        serializedTransaction,
        serializedContextFreeData: void 0,
        abis
      });
      signatures = signResponse.signatures;
    }
    const response = await this.rpc.send_transaction({
      signatures,
      compression: 0,
      serializedTransaction
    });
    const returnBuffer = new SerialBuffer({
      array: hexToUint8Array(
        response.processed.action_traces[0][1].return_value
      )
    });
    if (short) {
      return deserializeAnyvarShort(returnBuffer);
    } else {
      return deserializeAnyvar(returnBuffer);
    }
  }
  async pushSignedTransaction({
    signatures,
    serializedTransaction,
    serializedContextFreeData
  }, readOnlyTrx = false, returnFailureTraces = false) {
    if (readOnlyTrx) {
      return this.rpc.push_ro_transaction(
        {
          signatures,
          serializedTransaction,
          serializedContextFreeData
        },
        returnFailureTraces
      );
    }
    return this.rpc.push_transaction({
      signatures,
      serializedTransaction,
      serializedContextFreeData
    });
  }
  async pushCompressedSignedTransaction({
    signatures,
    serializedTransaction,
    serializedContextFreeData
  }, readOnlyTrx = false, returnFailureTraces = false) {
    const compressedSerializedTransaction = this.deflateSerializedArray(
      serializedTransaction
    );
    const compressedSerializedContextFreeData = this.deflateSerializedArray(
      serializedContextFreeData || new Uint8Array(0)
    );
    if (readOnlyTrx) {
      return this.rpc.push_ro_transaction(
        {
          signatures,
          compression: 1,
          serializedTransaction: compressedSerializedTransaction,
          serializedContextFreeData: compressedSerializedContextFreeData
        },
        returnFailureTraces
      );
    }
    return this.rpc.push_transaction({
      signatures,
      compression: 1,
      serializedTransaction: compressedSerializedTransaction,
      serializedContextFreeData: compressedSerializedContextFreeData
    });
  }
  async generateTapos(info, transaction, blocksBehind = 3, useLastIrreversible, expireSeconds) {
    if (!info) {
      info = await this.rpc.get_info();
    }
    if (useLastIrreversible) {
      const block = await this.tryRefBlockFromGetInfo(info);
      return { ...transactionHeader(block, expireSeconds), ...transaction };
    }
    const taposBlockNumber = info.head_block_num - blocksBehind;
    const refBlock = taposBlockNumber <= info.last_irreversible_block_num ? await this.tryGetBlockInfo(taposBlockNumber) : await this.tryGetBlockHeaderState(taposBlockNumber);
    return {
      ...transactionHeader(refBlock, expireSeconds),
      ...transaction
    };
  }
  hasRequiredTaposFields({
    expiration,
    ref_block_num,
    ref_block_prefix
  }) {
    return !!(expiration && typeof ref_block_num === "number" && typeof ref_block_prefix === "number");
  }
  async tryGetBlockHeaderState(taposBlockNumber) {
    try {
      return await this.rpc.get_block_header_state(taposBlockNumber);
    } catch (error) {
      return await this.tryGetBlockInfo(taposBlockNumber);
    }
  }
  async tryGetBlockInfo(blockNumber) {
    try {
      return await this.rpc.get_block_info(blockNumber);
    } catch (error) {
      return await this.rpc.get_block(blockNumber);
    }
  }
  async tryRefBlockFromGetInfo(info) {
    if (info.hasOwnProperty("last_irreversible_block_id") && info.hasOwnProperty("last_irreversible_block_num") && info.hasOwnProperty("last_irreversible_block_time")) {
      return {
        block_num: info.last_irreversible_block_num,
        id: info.last_irreversible_block_id,
        timestamp: info.last_irreversible_block_time
      };
    } else {
      const block = await this.tryGetBlockInfo(
        info.last_irreversible_block_num
      );
      return {
        block_num: block.block_num,
        id: block.id,
        timestamp: block.timestamp
      };
    }
  }
  with(accountName) {
    return new ActionBuilder(this, accountName);
  }
  buildTransaction(cb) {
    const tx = new TransactionBuilder(this);
    if (cb) {
      return cb(tx);
    }
    return tx;
  }
  async getAccountKeys(actor, permission) {
    try {
      const { permissions } = await this.rpc.get_account(actor);
      const relevantPermission = permissions.find(
        ({ perm_name }) => perm_name === permission
      );
      if (relevantPermission) {
        return relevantPermission.required_auth.keys.map(
          ({ key }) => PublicKey.fromString(key).toString()
        );
      }
    } catch (e) {
      console.log(e);
    }
    return [];
  }
  async sha256Digest(array) {
    const buffer = array instanceof Uint8Array ? array.buffer.slice(
      array.byteOffset,
      array.byteOffset + array.byteLength
    ) : array;
    return new Uint8Array(
      await this.getCrypto().subtle.digest("SHA-256", buffer)
    );
  }
  async matchRsaKeyToSignature({
    action,
    credentials
  }) {
    const { signature, nonce, trx } = action.data;
    for (const cred of credentials) {
      const rsaKey = cred.key.key[1];
      const exponentBase64 = b64tob64u(
        Buffer.from(rsaKey.exponent, "hex").toString("base64")
      );
      const modulusBase64 = b64tob64u(
        Buffer.from(rsaKey.modulus, "hex").toString("base64")
      );
      const clientJson = JSON.parse(signature.client_json);
      const signedDigest = new Uint8Array(
        base64url2.toBuffer(clientJson.challenge)
      );
      const signBuf = new SerialBuffer();
      const serializedTransaction = this.serializeTransaction(trx);
      signBuf.pushArray(serializedTransaction);
      signBuf.pushNumberAsUint64(nonce);
      const actualDigest = await this.sha256Digest(
        signBuf.asUint8Array().slice()
      );
      if (arrayToHex2(signedDigest) !== arrayToHex2(actualDigest)) {
        continue;
      }
      const publicKey = await this.getCrypto().subtle.importKey(
        "jwk",
        {
          kty: "RSA",
          e: exponentBase64,
          n: modulusBase64,
          alg: "RS256",
          ext: false
        },
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: {
            name: "SHA-256"
          }
        },
        false,
        ["verify"]
      );
      const authData = hexToUint8Array(signature.auth_data);
      const clientJsonHash = hexToUint8Array(sha2563(signature.client_json));
      const resultingHash = new Uint8Array([...authData, ...clientJsonHash]);
      const verified = await this.getCrypto().subtle.verify(
        "RSASSA-PKCS1-v1_5",
        publicKey,
        hexToUint8Array(signature.signature),
        resultingHash
      );
      if (verified) {
        return true;
      }
    }
    return false;
  }
  async matchEthKeyToSignature({
    action,
    credentials
  }) {
    const { signature, nonce, trx } = action.data;
    for (const cred of credentials) {
      const ethKey = "0x" + cred.key.key[1];
      const signBuf = new SerialBuffer();
      const serializedTransaction = this.serializeTransaction(trx);
      signBuf.pushArray(serializedTransaction);
      signBuf.pushNumberAsUint64(nonce);
      const actualDigestArray = await this.sha256Digest(
        signBuf.asUint8Array().slice()
      );
      const actualDigest = arrayToHex2(actualDigestArray);
      const ethSignature = "0x" + signature.signature;
      const signedWithKey = this.getRecoverPersonalSignature()({
        data: actualDigest,
        sig: ethSignature
      });
      if (signedWithKey === ethKey) {
        return true;
      }
    }
    return false;
  }
  async checkIfKeysMatchWaAction({
    actor,
    permission,
    action
  }) {
    if (!action.authorization.every(
      (_) => _.actor === actor && _.permission === "webauth"
    )) {
      console.log("WA RSA/ETH Outer Authorization mismatch");
      return false;
    }
    const { account, key, trx } = action.data;
    if (!trx.actions.every(
      (action2) => action2.authorization.every((_) => _.actor === actor && _.permission === permission)
    )) {
      console.log("WA RSA/ETH Inner Authorization mismatch");
      return false;
    }
    if (account !== actor) {
      console.log("Account mismatch");
      return false;
    }
    const keyType = key.key[0];
    const creds = await this.rpc.fetchCredentials(actor);
    const credentials = creds.filter((cred) => cred.key.key[0] === keyType);
    if (keyType === "eth_public_key") {
      return this.matchEthKeyToSignature({ action, credentials });
    } else if (keyType === "rsa_public_key") {
      return this.matchRsaKeyToSignature({ action, credentials });
    } else {
      console.log(`Key type ${keyType} not supported`);
      return false;
    }
  }
  async checkIfKeysMatchTransaction({
    actor,
    permission,
    transaction,
    signatures,
    chainId
  }) {
    transaction = JSON.parse(JSON.stringify(transaction));
    signatures = JSON.parse(JSON.stringify(signatures));
    try {
      if (transaction.actions.length === 1 && transaction.actions[0].account === "webauthn" && transaction.actions[0].name === "exec") {
        const matches = await this.checkIfKeysMatchWaAction({
          actor,
          permission,
          action: transaction.actions[0]
        });
        return matches;
      } else {
        for (const action of transaction.actions) {
          if (!action.authorization.every(
            (_) => _.actor === actor && _.permission === permission
          )) {
            console.log("WA R1 Authorization mismatch");
            return false;
          }
        }
        chainId = chainId || (await this.rpc.get_info()).chain_id;
        const { serializedTransaction, serializedContextFreeData } = await this.serializeTransactionWithActions(transaction);
        const keys = await this.getAccountKeys(actor, permission);
        const verified = signatures.every((stringSignature) => {
          const signature = Signature.fromString(stringSignature);
          const digest = digestFromSerializedData(
            chainId,
            serializedTransaction,
            serializedContextFreeData,
            signature.getEc()
          );
          return keys.some(
            (key) => signature.verify(digest, PublicKey.fromString(key), false)
          );
        });
        return verified;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
};
var TransactionBuilder = class {
  constructor(api) {
    this.actions = [];
    this.contextFreeGroups = [];
    this.api = api;
  }
  with(accountName) {
    const actionBuilder = new ActionBuilder(this.api, accountName);
    this.actions.push(actionBuilder);
    return actionBuilder;
  }
  associateContextFree(contextFreeGroup) {
    this.contextFreeGroups.push(contextFreeGroup);
    return this;
  }
  async send(config) {
    const contextFreeDataSet = [];
    const contextFreeActions = [];
    const actions = this.actions.map(
      (actionBuilder) => actionBuilder.serializedData
    );
    await Promise.all(
      this.contextFreeGroups.map(
        async (contextFreeCallback) => {
          const { action, contextFreeAction, contextFreeData } = contextFreeCallback({
            cfd: contextFreeDataSet.length,
            cfa: contextFreeActions.length
          });
          if (action) {
            actions.push(action);
          }
          if (contextFreeAction) {
            contextFreeActions.push(contextFreeAction);
          }
          if (contextFreeData) {
            contextFreeDataSet.push(contextFreeData);
          }
        }
      )
    );
    this.contextFreeGroups = [];
    this.actions = [];
    return await this.api.transact(
      {
        context_free_data: contextFreeDataSet,
        context_free_actions: contextFreeActions,
        actions
      },
      config
    );
  }
};
var ActionBuilder = class {
  constructor(api, accountName) {
    this.api = api;
    this.accountName = accountName;
  }
  as(actorName = []) {
    let authorization = [];
    if (actorName && typeof actorName === "string") {
      authorization = [{ actor: actorName, permission: "active" }];
    } else {
      authorization = actorName;
    }
    return new ActionSerializer(
      this,
      this.api,
      this.accountName,
      authorization
    );
  }
};
var ActionSerializer = class {
  constructor(parent, api, accountName, authorization) {
    const jsonAbi = api.cachedAbis.get(accountName);
    if (!jsonAbi) {
      throw new Error(
        "ABI must be cached before using ActionBuilder, run api.getAbi()"
      );
    }
    const types = getTypesFromAbi(createInitialTypes(), jsonAbi.abi);
    const actions = /* @__PURE__ */ new Map();
    for (const { name, type } of jsonAbi.abi.actions) {
      actions.set(name, getType(types, type));
    }
    actions.forEach((type, name) => {
      Object.assign(this, {
        [name]: (...args) => {
          const data = {};
          args.forEach((arg, index) => {
            const field = type.fields[index];
            data[field.name] = arg;
          });
          const serializedData = serializeAction(
            { types, actions },
            accountName,
            name,
            authorization,
            data
          );
          parent.serializedData = serializedData;
          return serializedData;
        }
      });
    });
  }
};

// src/api/types.ts
var types_exports2 = {};

// src/index.ts
var src_default = {
  Api,
  ApiInterfaces: types_exports2,
  JsonRpc,
  Numeric: numeric_exports,
  RpcInterfaces: types_exports,
  RpcError,
  Serialize: serialize_exports,
  JsSignatureProvider,
  Key: key_exports,
  sha256: sha2563
};
export {
  Api,
  types_exports2 as ApiInterfaces,
  JsSignatureProvider,
  JsonRpc,
  key_exports as Key,
  numeric_exports as Numeric,
  RpcError,
  types_exports as RpcInterfaces,
  serialize_exports as Serialize,
  src_default as default,
  digestFromSerializedData,
  sha2563 as sha256
};
