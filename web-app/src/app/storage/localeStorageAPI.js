import SecureLS from "secure-ls";

const createStore = () => {
    return new SecureLS();
};

const store = createStore();

export const createStoreSlice = (key, initialValue) => {
    store.set(key, initialValue);
    return initialValue;
}

export const getStoreSlice = (key) => {
    return store.get(key);
}

export const checkForStore = (key) => {
    console.log(store.getAllKeys());
    return store.getAllKeys().includes(key);
};

export const getStore = () => {
    return store;
}