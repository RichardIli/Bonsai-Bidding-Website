document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let allItems = []; // Stores the full list of items fetched from the API
    let filteredItems = []; // Stores items for the current view (e.g., search results)

    // --- Helper Functions ---

    /**
     * Creates the HTML string for a single bidding card.
     * @param {object} item - The item object from the API response.
     * @param {string} item.image - The URL of the item's image.
     * @param {string} item.name - The name of the item.
     * @param {string} item.description - A description of the item.
     * @param {number} item.currentBid - The current bid amount.
     * @param {string} item.biddingEnd - The date string for when bidding ends.
     * @returns {string} The HTML string for a bid card.
     */
    const createBidCard = (item) => {
        const timeRemaining = calculateTimeRemaining(item.biddingEnd);
        return `
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-105">
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover"
                     onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/000000?text=Image+Not+Found';">
                <div class="p-4">
                    <h3 class="text-xl font-semibold text-green-800 mb-2">${item.name}</h3>
                    <p class="text-gray-600 text-sm truncate">${item.description}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-2xl font-bold text-green-600">$${item.currentBid}</span>
                        <div class="text-sm text-right">
                            <span class="block font-medium text-gray-500">Time Left:</span>
                            <span class="block text-green-500 font-bold">${timeRemaining}</span>
                        </div>
                    </div>
                    <button class="mt-4 w-full bg-green-500 text-white py-2 rounded-xl font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Place a Bid</button>
                </div>
            </div>
        `;
    };

    /**
     * Creates the HTML string for a general item card.
     * @param {object} item - The item object.
     * @param {string} item.itemId - The unique ID of the item.
     * @param {string} item.image - The URL of the item's image.
     * @param {string} item.name - The name of the item.
     * @param {string} item.description - The description of the item.
     * @param {number} item.startingBid - The starting bid amount.
     * @param {number} item.currentBid - The current bid amount.
     * @param {string} item.uploadDate - The date the item was uploaded.
     * @param {string} item.uploader - The name of the uploader.
     * @returns {string} The HTML string for an item card.
     */
    const createItemCard = (item) => {
        return `
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-105">
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover"
                     onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/000000?text=Image+Not+Found';">
                <div class="p-4">
                    <h3 class="text-xl font-semibold text-green-800 mb-2">${item.name}</h3>
                    <p class="text-gray-600 text-sm">${item.description}</p>
                    <p class="text-sm text-gray-500 mt-2">Starting Bid: $${item.startingBid}</p>
                    <p class="text-sm text-gray-500">Current Bid: $${item.currentBid}</p>
                </div>
            </div>
        `;
    };

    /**
     * Creates the HTML string for a "My Bids" card.
     * @param {object} bid - The bid object.
     * @param {string} bid.image - The URL of the item's image.
     * @param {string} bid.name - The name of the item.
     * @param {number} bid.myBid - The user's bid amount.
     * @param {number} bid.currentBid - The current highest bid amount.
     * @param {string} bid.biddingEnd - The date string for when bidding ends.
     * @returns {string} The HTML string for a "My Bids" card.
     */
    const createMyBidCard = (bid) => {
        const isWinning = bid.myBid >= bid.currentBid;
        const statusText = isWinning ? "Winning" : "Outbid";
        const statusColor = isWinning ? "text-green-500" : "text-red-500";
        return `
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden p-4">
                <img src="${bid.image}" alt="${bid.name}" class="w-full h-32 object-cover rounded-xl mb-4"
                     onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/000000?text=Image+Not+Found';">
                <h4 class="text-lg font-semibold text-green-800 truncate">${bid.name}</h4>
                <p class="text-sm text-gray-600">My Bid: <span class="font-bold">$${bid.myBid}</span></p>
                <p class="text-sm text-gray-600">Current Bid: <span class="font-bold">$${bid.currentBid}</span></p>
                <p class="text-sm font-medium mt-2 ${statusColor}">Status: ${statusText}</p>
            </div>
        `;
    };


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
     * Fetches items from the API and renders them to the page.
     */
    const fetchAndRenderItems = async () => {
        const itemsGrid = document.getElementById('itemsGrid');
        const loadingState = document.getElementById('loadingState');
        const noResults = document.getElementById('noResults');

        // Check if the elements exist on the current page before proceeding
        if (!itemsGrid || !loadingState || !noResults) {
            return;
        }

        loadingState.classList.remove('hidden');
        itemsGrid.innerHTML = '';
        noResults.classList.add('hidden');

        try {
            const response = await fetch('https://gemini-flash-back-end.vercel.app/api/bonsaiList');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allItems = data;
            filteredItems = allItems;
            renderItems(filteredItems);
        } catch (error) {
            console.error("Failed to fetch bonsai data:", error);
            // Optionally, display an error message to the user
            itemsGrid.innerHTML = '<p class="text-center text-red-500">Failed to load items. Please try again later.</p>';
        } finally {
            loadingState.classList.add('hidden');
        }
    };


    /**
     * Renders a list of items to the items grid.
     * @param {array} itemsToRender - The array of items to display.
     */
    const renderItems = (itemsToRender) => {
        const itemsGrid = document.getElementById('itemsGrid');
        const noResults = document.getElementById('noResults');

        // Check if elements exist before rendering
        if (!itemsGrid || !noResults) {
            return;
        }

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

    const renderMyBids = () => {
        // In a real app, this data would be fetched from a user-specific API endpoint.
        // For this example, we'll use a hardcoded list to demonstrate the UI.
        const myBids = [{
            image: "https://placehold.co/300x200/007137/ffffff?text=My+Bonsai",
            name: "Japanese White Pine",
            myBid: 120,
            currentBid: 125,
            biddingEnd: "2024-12-01T10:00:00Z"
        }, {
            image: "https://placehold.co/300x200/007137/ffffff?text=My+Maple",
            name: "Acer Palmatum",
            myBid: 150,
            currentBid: 150,
            biddingEnd: "2024-11-20T10:00:00Z"
        }, {
            image: "https://placehold.co/300x200/007137/ffffff?text=My+Juniper",
            name: "Shimpaku Juniper",
            myBid: 210,
            currentBid: 200,
            biddingEnd: "2024-05-15T12:00:00Z"
        },];

        const bidsInProgressContainer = document.getElementById("bidsInProgress");
        const bidsEndedContainer = document.getElementById("bidsEnded");

        // Add a null check to prevent errors on pages without these elements
        if (!bidsInProgressContainer || !bidsEndedContainer) {
            return;
        }

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
     * Handles the search logic, filtering items based on the search query.
     * @param {string} query - The search query string.
     */
    const handleSearch = (query) => {
        const searchLoadingState = document.getElementById('searchLoadingState');
        // Add a null check
        if (!searchLoadingState) {
            return;
        }

        searchLoadingState.classList.remove('hidden');

        const trimmedQuery = query.trim().toLowerCase();
        if (trimmedQuery === '') {
            filteredItems = allItems;
        } else {
            filteredItems = allItems.filter(item => {
                return item.name.toLowerCase().includes(trimmedQuery) ||
                    item.description.toLowerCase().includes(trimmedQuery);
            });
        }

        renderItems(filteredItems);
        searchLoadingState.classList.add('hidden');
    };

    /**
     * Sets up the navigation to show/hide different sections of the page.
     */
    const setupNavigation = () => {
        const sections = document.querySelectorAll('main section');
        const navLinks = document.querySelectorAll('header nav a, #mobileDrawer a');

        const showSection = (id) => {
            sections.forEach(section => {
                section.classList.add('hidden');
            });
            const targetSection = document.getElementById(id);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('href');

                // Check if the link is an internal anchor link
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    showSection(targetId.substring(1));
                    // Also close mobile drawer if open
                    const mobileDrawer = document.getElementById('mobileDrawer');
                    if (mobileDrawer && !mobileDrawer.classList.contains('-translate-x-full')) {
                        mobileDrawer.classList.add('-translate-x-full');
                    }
                }
                // For all other links (like /login), the default action will be allowed.
            });
        });

        // Set the initial visible section
        showSection('browse');
    };

    const setupDrawer = () => {
        const hamburgerButton = document.getElementById('hamburgerButton');
        const closeDrawerButton = document.getElementById('closeDrawer');
        const mobileDrawer = document.getElementById('mobileDrawer');

        // Add null checks for each element before adding event listeners
        if (hamburgerButton && mobileDrawer) {
            hamburgerButton.addEventListener('click', () => {
                mobileDrawer.classList.remove('translate-x-full');
            });
        }

        if (closeDrawerButton && mobileDrawer) {
            closeDrawerButton.addEventListener('click', () => {
                mobileDrawer.classList.add('translate-x-full');
            });
        }
    };

    const setupAccountDropdowns = () => {
        // Desktop dropdown
        const desktopDropdown = document.querySelector('.relative.group');
        if (desktopDropdown) {
            desktopDropdown.addEventListener('mouseover', () => {
                const dropdownMenu = desktopDropdown.querySelector('div');
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('hidden');
                }
            });
            desktopDropdown.addEventListener('mouseout', () => {
                const dropdownMenu = desktopDropdown.querySelector('div');
                if (dropdownMenu) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }

        // Mobile dropdown
        const mobileAccountDropdown = document.getElementById('mobileAccountDropdown');
        const mobileAccountMenu = document.getElementById('mobileAccountMenu');

        if (mobileAccountDropdown && mobileAccountMenu) {
            mobileAccountDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                mobileAccountMenu.classList.toggle('hidden');
            });
        }
    };

    const setupSearch = () => {
        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                handleSearch(searchBar.value);
            });
        }

        if (searchBar) {
            searchBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSearch(searchBar.value);
                }
            });
        }
    };

    const togglePasswordVisibility = () => {
        // Toggle Password Visibility
        const togglePasswordButton = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        const eyeIcon = togglePasswordButton.querySelector('.eye-icon');
        const eyeSlashIcon = togglePasswordButton.querySelector('.eye-slash-icon');

        if (togglePasswordButton && passwordInput && eyeIcon && eyeSlashIcon) {
            togglePasswordButton.addEventListener('click', () => {
                // Toggle the type attribute
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);

                // Toggle the icons
                eyeIcon.classList.toggle('hidden');
                eyeSlashIcon.classList.toggle('hidden');
            });
        }
    }

    // --- Main Initialization Function ---
    const init = () => {
        setupNavigation();
        setupDrawer();
        setupAccountDropdowns();
        setupSearch();

        // Add a check to only run these functions if the necessary HTML elements exist.
        if (document.getElementById('itemsGrid')) {
            fetchAndRenderItems();
            renderMyBids();
        }

        // This function is for the login page, so it should only run there.
        if (document.getElementById('loginForm')) {
            togglePasswordVisibility();
        }
    };

    init();
});