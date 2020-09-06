const numbers = '0123456789'
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const chars = numbers + letters;

export default (length = 8) => {
  let res = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    res += chars.substring(idx, idx + 1);
  }
  return res;
}
