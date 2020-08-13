/**
 * Waits given millis
 * 
 * @example
 *  await wait(15) // just wait
 *  await wait(60).then(() => console.log('hello world')) // wait and then do something
 */
module.exports = millis => {
    return new Promise(resolve => setTimeout(resolve, millis))
}