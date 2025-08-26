// api.js

/**
 * Fetches the list of bonsai items from the API.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of item objects.
 */
export const fetchBonsaiItems = async () => {
    try {
        const response = await fetch('https://gemini-flash-back-end.vercel.app/api/bonsaiList');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch bonsai data:", error);
        return []; // Return an empty array on failure
    }
};