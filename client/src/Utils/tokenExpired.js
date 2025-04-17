export async function checkTokenExpired(res,) {
    if (res && res.message === 'tokens missing') {
        setUser(null);
    }
}
