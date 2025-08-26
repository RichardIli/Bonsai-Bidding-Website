// ui.js

/**
 * Calculates the time remaining until a given end date.
 * @param {string} endDateString - The end date as a string.
 * @returns {string} A human-readable string of the time remaining.
 */
const calculateTimeRemaining = (endDateString) => {
    const now = new Date();
    const end = new Date(endDateString);
    const diff = end - now;

    if (diff <= 0) {
        return "Bidding Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

/**
 * Creates the HTML string for a single bidding card.
 * @param {object} item - The item object from the API response.
 * @returns {string} The HTML string for a bid card.
 */
export const createBidCard = (item) => {
    const timeRemaining = calculateTimeRemaining(item.biddingEnd);
    const timeRemainingTextColor = timeRemaining === "Bidding Ended" ? "text-red-500" : "text-green-500";
    return `
        <div class="bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-105">
            <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover"
                 onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/000000?text=Image+Not+Found';">
            <div class="p-4">
                <h3 class="text-xl font-semibold text-green-800 mb-2 truncate">${item.name}</h3>
                <p class="text-gray-600 text-sm truncate">${item.description}</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-2xl font-bold text-green-600">$${item.currentBid}</span>
                    <div class="text-sm text-right">
                        <span class="block font-medium text-gray-500">Time Left:</span>
                        <span class="block ${timeRemainingTextColor} font-bold">${timeRemaining}</span>
                    </div>
                </div>
                <button class="view-item-btn mt-4 w-full bg-green-500 text-white py-2 rounded-xl font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" data-item-id="${item.itemId}">View</button>
            </div>
        </div>
    `;
};

/**
 * Creates the HTML string for a "My Bids" card.
 * @param {object} bid - The bid object.
 * @returns {string} The HTML string for a "My Bids" card.
 */
export const createMyBidCard = (bid) => {
    const isWinning = bid.myBid >= bid.currentBid;
    const statusText = new Date(bid.biddingEnd) > new Date() ? (isWinning ? "Winning" : "Outbid") : "Ended";
    const statusColor = isWinning ? "text-green-500" : "text-red-500";
    const timeRemaining = calculateTimeRemaining(bid.biddingEnd);
    const timeRemainingTextColor = timeRemaining === "Bidding Ended" ? "text-red-500" : "text-green-500";

    return `
        <div class="bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-105">
            <img src="${bid.image}" alt="${bid.name}" class="w-full h-48 object-cover"
                 onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/000000?text=Image+Not+Found';">
            <div class="p-4">
                <h3 class="text-xl font-semibold text-green-800 mb-2 truncate">${bid.name}</h3>
                <p class="text-gray-600 text-sm">My Bid: <span class="font-bold">$${bid.myBid}</span></p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-2xl font-bold text-green-600">$${bid.currentBid}</span>
                    <div class="text-sm text-right">
                        <span class="block font-medium text-gray-500">Status: <span class="font-bold ${statusColor}">${statusText}</span></span>
                        <span class="block ${timeRemainingTextColor} font-bold">${timeRemaining}</span>
                    </div>
                </div>
                <button class="view-item-btn mt-4 w-full bg-green-500 text-white py-2 rounded-xl font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" data-item-id="${bid.itemId}">View</button>
            </div>
        </div>
    `;
};


/**
 * Renders a list of items to the items grid.
 * @param {array} itemsToRender - The array of items to display.
 */
export const renderItems = (itemsToRender) => {
    const itemsGrid = document.getElementById('itemsGrid');
    const noResults = document.getElementById('noResults');

    if (!itemsGrid || !noResults) return;

    itemsGrid.innerHTML = '';
    if (itemsToRender.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        itemsToRender.forEach(item => {
            itemsGrid.innerHTML += createBidCard(item);
        });
        noResults.classList.add('hidden');
    }
};

export const renderMyBids = (myBids) => {
    const bidsInProgressContainer = document.getElementById("bidsInProgress");
    const bidsEndedContainer = document.getElementById("bidsEnded");

    if (!bidsInProgressContainer || !bidsEndedContainer) return;

    bidsInProgressContainer.innerHTML = '';
    bidsEndedContainer.innerHTML = '';

    myBids.forEach(bid => {
        const isBiddingOpen = new Date(bid.biddingEnd) > new Date();
        if (isBiddingOpen) {
            bidsInProgressContainer.innerHTML += createMyBidCard(bid);
        } else {
            bidsEndedContainer.innerHTML += createMyBidCard(bid);
        }
    });
};

/**
 * Shows a modal with the detailed information of a selected item.
 * @param {object} item - The item object to display.
 */
export const showItemDetails = (item) => {
    const modal = document.getElementById('itemModal');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalContent) return;

    const timeRemaining = calculateTimeRemaining(item.biddingEnd);
    const timeRemainingTextColor = timeRemaining === "Bidding Ended" ? "text-red-500" : "text-green-500";
    
    modalContent.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-full h-64 object-cover rounded-2xl mb-6"
             onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/000000?text=Image+Not+Found';">
        <h3 class="text-3xl font-bold text-green-800 mb-2">${item.name}</h3>
        <p class="text-gray-600 text-lg leading-relaxed mb-4">${item.description}</p>
        <div class="flex justify-between items-center text-lg font-semibold text-gray-700 mb-6">
            <span>Current Bid: <span class="text-green-600 font-bold">$${item.currentBid}</span></span>
            <span>Time Left: <span class="${timeRemainingTextColor} font-bold">${timeRemaining}</span></span>
        </div>
        ${timeRemaining !== "Bidding Ended" ? `
        <div class="mb-4">
            <label for="bidAmount" class="block text-gray-700 text-sm font-bold mb-2">Place Your Bid:</label>
            <input type="number" id="bidAmount" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" min="${item.currentBid + 1}" placeholder="Enter bid amount...">
        </div>
        <button id="placeBidBtn" data-item-id="${item.itemId}" class="w-full bg-green-500 text-white py-3 rounded-full font-bold text-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">Place a Bid</button>
        ` : `
        <button class="w-full bg-gray-400 text-white py-3 rounded-full font-bold text-lg cursor-not-allowed">Bidding Ended</button>
        `}
    `;
    modal.classList.remove('hidden');
};

/**
 * Closes the item details modal.
 */
export const closeModal = () => {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

/**
 * Toggles the visibility of the password input field.
 */
export const togglePasswordVisibility = () => {
    // Check if the necessary elements exist before proceeding
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Return if the elements are not found (i.e., we are not on the login page)
    if (!togglePasswordButton || !passwordInput) {
        return;
    }

    const eyeIcon = togglePasswordButton.querySelector('.eye-icon');
    const eyeSlashIcon = togglePasswordButton.querySelector('.eye-slash-icon');

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('hidden');
        eyeSlashIcon.classList.toggle('hidden');
    });
};