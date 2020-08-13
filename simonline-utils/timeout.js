/**
 * Promised setTimeout
 * 
 * @example
 *  await timeout(60, () => console.log('hello world'))
 */
module.exports = (millis, callback) => {
    return new Promise(resolve => setTimeout(resolve, millis)).then(callback)
}