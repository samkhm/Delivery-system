export const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
    } catch (error) {
        return null;
    }
};

export const getUserFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    return decodeToken(token);
};

export const getUserRole = () => {
    const user = getUserFromToken();

    return user?.role || null;
};

export const isRider = () => {
    return getUserRole() === "rider";
};

export const isDispatcher = () => {
    return getUserRole() === "dispatcher";
};

export const isRetailer = () => {
    return getUserRole() === "retailer";
};

export const getUserId = () => {
    const user = getUserFromToken();
    return user?.id || null;
};

export const getFirstName = () => {
    const user = getUserFromToken();

    return user?.first_name || null;
};

export const getLastName = () => {
    const user = getUserFromToken();

    return user?.last_name || null;
};