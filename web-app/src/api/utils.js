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

export const buildPOSTWithJWTConfig = (data, token) => {
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    };
}