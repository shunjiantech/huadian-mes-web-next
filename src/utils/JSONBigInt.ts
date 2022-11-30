import jsonBigInt from 'json-bigint'

const JSONBigInt = jsonBigInt({ useNativeBigInt: true })

JSON.parse = JSONBigInt.parse
JSON.stringify = JSONBigInt.stringify
