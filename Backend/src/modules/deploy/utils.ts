function encodeWeights(weights) {
  let data = '0x';
  for (const { token, weight } of weights) {
    data += token.slice(2).padStart(40, '0'); // 20 bytes
    data += weight.toString(16).padStart(8, '0'); // 4 bytes
  }
  return data;
}

module.exports = { encodeWeights };
