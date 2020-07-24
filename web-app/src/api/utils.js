export const buildTokenAuthHeader = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };
};

export const buildTokenAuthHeaderJSON = () => {
    return {
        headers: {
            "Content-Type": "application/json",
        }
    };
}