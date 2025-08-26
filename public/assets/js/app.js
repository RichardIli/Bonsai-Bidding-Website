// app.js

// Import functions from the new modules
import { fetchBonsaiItems } from './api.js';
import { renderItems, renderMyBids, showItemDetails, closeModal, togglePasswordVisibility } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let allItems = []; // Stores the full list of items fetched from the API
    let filteredItems = []; // Stores items for the current view (e.g., search results)
    let myBids = []; // Stores the user's bids

    // --- Core Application Logic ---

    const handleSearch = (query) => {
        const searchLoadingState = document.getElementById('searchLoadingState');
        if (!searchLoadingState) return;

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
        setupViewButtons();
        searchLoadingState.classList.add('hidden');
    };

    const handlePlaceBid = (itemId) => {
        const itemToBidOn = allItems.find(item => item.itemId == itemId);
        if (!itemToBidOn) {
            console.error("Item not found in allItems array.");
            return;
        }

        const bidInput = document.getElementById('bidAmount');
        const newBidAmount = parseFloat(bidInput.value);

        if (isNaN(newBidAmount) || newBidAmount <= itemToBidOn.currentBid) {
            alert(`Please enter a bid amount greater than the current bid of $${itemToBidOn.currentBid}.`);
            return;
        }

        itemToBidOn.currentBid = newBidAmount;

        const existingBidIndex = myBids.findIndex(bid => bid.itemId == itemId);

        if (existingBidIndex !== -1) {
            myBids[existingBidIndex].myBid = newBidAmount;
            myBids[existingBidIndex].currentBid = newBidAmount;
        } else {
            myBids.push({
                itemId: itemToBidOn.itemId,
                image: itemToBidOn.image,
                name: itemToBidOn.name,
                myBid: newBidAmount,
                currentBid: newBidAmount,
                biddingEnd: itemToBidOn.biddingEnd
            });
        }

        renderItems(filteredItems);
        renderMyBids(myBids);
        closeModal();
        alert(`Your bid of $${newBidAmount} has been placed on ${itemToBidOn.name}.`);
    };

    // --- Setup Event Listeners ---

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
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    showSection(targetId.substring(1));
                    const mobileDrawer = document.getElementById('mobileDrawer');
                    if (mobileDrawer && !mobileDrawer.classList.contains('translate-x-full')) {
                        mobileDrawer.classList.add('translate-x-full');
                    }
                }
            });
        });
        showSection('browse');
    };

    const setupDrawer = () => {
        const hamburgerButton = document.getElementById('hamburgerButton');
        const closeDrawerButton = document.getElementById('closeDrawer');
        const mobileDrawer = document.getElementById('mobileDrawer');

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
        const desktopDropdownButton = document.getElementById('desktopAccountDropdown');
        const desktopDropdownMenu = document.getElementById('desktopAccountMenu');
        const mobileAccountDropdown = document.getElementById('mobileAccountDropdown');
        const mobileAccountMenu = document.getElementById('mobileAccountMenu');

        const closeAllDropdowns = () => {
            if (desktopDropdownMenu) {
                desktopDropdownMenu.classList.add('hidden');
            }
            if (mobileAccountMenu) {
                mobileAccountMenu.classList.add('hidden');
            }
        };

        document.addEventListener('click', (e) => {
            const target = e.target;
            const isDesktopDropdown = desktopDropdownButton && desktopDropdownButton.contains(target);
            const isMobileDropdown = mobileAccountDropdown && mobileAccountDropdown.contains(target);
            const isInsideMenu = (desktopDropdownMenu && desktopDropdownMenu.contains(target)) || (mobileAccountMenu && mobileAccountMenu.contains(target));

            if (!isDesktopDropdown && !isMobileDropdown && !isInsideMenu) {
                closeAllDropdowns();
            }
        });

        if (desktopDropdownButton && desktopDropdownMenu) {
            desktopDropdownButton.addEventListener('click', (e) => {
                e.preventDefault();
                desktopDropdownMenu.classList.toggle('hidden');
                if (!desktopDropdownMenu.classList.contains('hidden')) {
                    mobileAccountMenu.classList.add('hidden');
                }
            });
            desktopDropdownMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeAllDropdowns));
        }

        if (mobileAccountDropdown && mobileAccountMenu) {
            mobileAccountDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                mobileAccountMenu.classList.toggle('hidden');
                if (!mobileAccountMenu.classList.contains('hidden')) {
                    desktopDropdownMenu.classList.add('hidden');
                }
            });
            mobileAccountMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeAllDropdowns));
        }
    };

    const setupSearch = () => {
        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');
        if (searchButton) {
            searchButton.addEventListener('click', () => handleSearch(searchBar.value));
        }
        if (searchBar) {
            searchBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch(searchBar.value);
            });
        }
    };

    const setupViewButtons = () => {
        const viewItemButtons = document.querySelectorAll('.view-item-btn');
        viewItemButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                let item = allItems.find(i => i.itemId == itemId) || myBids.find(i => i.itemId == itemId);
                if (item) {
                    showItemDetails(item);
                    const placeBidButton = document.getElementById('placeBidBtn');
                    if (placeBidButton) {
                        placeBidButton.addEventListener('click', () => handlePlaceBid(item.itemId));
                    }
                }
            });
        });
    };

    const setupModalListeners = () => {
        const modal = document.getElementById('itemModal');
        const closeModalButton = document.getElementById('closeModal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    };
    
    // --- Main Initialization Function ---
    const init = async () => {
        // Run general UI setups for all pages
        setupNavigation();
        setupDrawer();
        setupAccountDropdowns();
        setupSearch();
        setupModalListeners();
        togglePasswordVisibility(); 

        // Check if on the homepage (where items are displayed)
        if (document.getElementById('itemsGrid')) {
            const data = await fetchBonsaiItems();
            allItems = data;
            filteredItems = allItems;
            renderItems(filteredItems);
            renderMyBids(myBids);
            setupViewButtons(); // Setup listeners after rendering
        }
    };

    init();
});