export async function checkTokenExpired(res, setUser) {
    if (res && res.message === 'tokens missing') {
        setUser(null);
    }
}
