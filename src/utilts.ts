interface Thenable<T> {
    then(res: T)
    catch(error: unknown)
}

export async function thenable(x: Promise<unknown>) {
    return await new Promise((res, rej) => {
        x.then(res).catch(rej)
    })
}

export function checkEnvVar(key, value) {
    if(!value) {
        throw new Error(`${key} env var is not defined.`)
    }
}