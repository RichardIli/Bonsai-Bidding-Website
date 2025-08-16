document.addEventListener('DOMContentLoaded', () => {
    // --- Data Sources (kept at the top for easy access) ---
    const bidItems = [
        {
            image: "https://via.placeholder.com/300x200",
            name: "Item 1",
            description: "Description of Item 1",
            currentBid: "$100"
        },
        {
            image: "https://via.placeholder.com/300x200",
            name: "Item 2",
            description: "Description of Item 2",
            currentBid: "$150"
        },
        {
            image: "https://via.placeholder.com/300x200",
            name: "Item 3",
            description: "Description of Item 3",
            currentBid: "$200"
        }
    ];

    const allItems = [
        {
            itemId: "1",
            image: "https://via.placeholder.com/300x200",
            name: "Awesome Gadget",
            description: "A very awesome gadget.",
            startingBid: "$50",
            uploadDate: "2024-01-15",
            uploader: "User123",
            currentBid: "$75",
            biddingEnd: "2026-01-22"
        },
        {
            itemId: "2",
            image: "https://via.placeholder.com/300x200",
            name: "Cool Thing",
            description: "A very cool thing.",
            startingBid: "$75",
            uploadDate: "2024-01-10",
            uploader: "User456",
            currentBid: "$100",
            biddingEnd: "2024-12-20"
        },
        {
            itemId: "3",
            image: "https://via.placeholder.com/300x200",
            name: "Another Item",
            description: "Another interesting item.",
            startingBid: "$100",
            uploadDate: "2024-01-05",
            uploader: "User789",
            currentBid: "$150",
            biddingEnd: "2023-01-18"
        },
        {
            itemId: "4",
            image: "https://via.placeholder.com/300x200",
            name: "Yet Another Item",
            description: "Yet another interesting item.",
            startingBid: "$125",
            uploadDate: "2024-01-01",
            uploader: "User101",
            currentBid: "$200",
            biddingEnd: "2023-01-17"
        }
    ];

    const myBids = [
        {
            itemId: "1",
            image: "https://via.placeholder.com/300x200",
            name: "Awesome Gadget",
            description: "A very awesome gadget.",
            yourBid: "$80",
            currentBid: "$75",
            biddingEnd: "2026-01-22"
        },
        {
            itemId: "2",
            image: "https://via.placeholder.com/300x200",
            name: "Cool Thing",
            description: "A very cool thing.",
            yourBid: "$110",
            currentBid: "$100",
            biddingEnd: "2024-12-20"
        },
        {
            itemId: "3",
            image: "https://via.placeholder.com/300x200",
            name: "Another Item",
            description: "Another interesting item.",
            yourBid: "$140",
            currentBid: "$150",
            biddingEnd: "2023-01-18"
        },
        {
            itemId: "4",
            image: "https://via.placeholder.com/300x200",
            name: "Yet Another Item",
            description: "Yet another interesting item.",
            yourBid: "$210",
            currentBid: "$200",
            biddingEnd: "2023-01-17"
        }
    ];

    // --- Template Functions ---
    const createBidCard = (item) => `
        <div class="inline-block w-64 mr-4 bg-white rounded-lg shadow-md p-4">
            <img src="${item.image}" alt="${item.name}" class="mb-2 rounded-md">
            <h3 class="text-xl font-semibold text-green-600">${item.name}</h3>
            <p class="text-gray-700">${item.description}</p>
            <p class="text-green-800 font-bold">Current Bid: ${item.currentBid}</p>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2">Place Bid</button>
        </div>
    `;

    const createItemCard = (item) => `
        <div class="bg-white rounded-lg shadow-md p-4">
            <img src="${item.image}" alt="${item.name}" class="mb-2 rounded-md">
            <h3 class="text-xl font-semibold text-green-600">${item.name}</h3>
            <p class="text-gray-700">${item.description}</p>
            <p class="text-gray-700">Uploaded by: ${item.uploader}</p>
            <p class="text-green-800 font-bold">Current Bid: ${item.currentBid}</p>
            <p class="text-gray-600">Bidding Ends: ${item.biddingEnd}</p>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2">View Item</button>
        </div>
    `;

    const createMyBidCard = (bid) => {
        const isBiddingOpen = new Date(bid.biddingEnd) > new Date();
        const hasWon = !isBiddingOpen && parseFloat(bid.yourBid.replace('$', '')) > parseFloat(bid.currentBid.replace('$', ''));
        let statusText = isBiddingOpen ? "Bidding in Progress" : (hasWon ? "You Won!" : "You Lost");

        return `
            <div class="bg-white rounded-lg shadow-md p-4">
                <img src="${bid.image}" alt="${bid.name}" class="mb-2 rounded-md">
                <h3 class="text-xl font-semibold text-green-600">${bid.name}</h3>
                <p class="text-gray-700">${bid.description}</p>
                <p class="text-gray-700">Your Bid: ${bid.yourBid}</p>
                <p class="text-green-800 font-bold">Current Bid: ${bid.currentBid}</p>
                <p class="text-gray-600">Bidding Ends: ${bid.biddingEnd}</p>
                <p class="font-semibold ${isBiddingOpen ? 'text-blue-500' : (hasWon ? 'text-green-500' : 'text-red-500')}">${statusText}</p>
            </div>
        `;
    };

    // --- Utility Function ---
    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // --- Setup Functions ---
    const setupNavigation = () => {
        const navLinks = document.querySelectorAll('nav a, .drawer a[data-target]');
        const sections = document.getElementById('mainContent').querySelectorAll('section');
        const drawer = document.getElementById('drawer');
        const drawerBackdrop = document.getElementById('drawerBackdrop');

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const target = link.dataset.target;
                
                drawer.classList.add('translate-x-full');
                drawerBackdrop.classList.add('hidden');

                sections.forEach(section => section.classList.add('hidden'));
                document.getElementById(target).classList.remove('hidden');
            });
        });
    };

    const setupDrawer = () => {
        const hamburgerButton = document.getElementById('hamburgerButton');
        const closeDrawerButton = document.getElementById('closeDrawerButton');
        const drawer = document.getElementById('drawer');
        const drawerBackdrop = document.getElementById('drawerBackdrop');

        const openDrawer = () => {
            drawer.classList.remove('translate-x-full');
            drawerBackdrop.classList.remove('hidden');
        };

        const closeDrawer = () => {
            drawer.classList.add('translate-x-full');
            drawerBackdrop.classList.add('hidden');
        };

        hamburgerButton.addEventListener('click', openDrawer);
        closeDrawerButton.addEventListener('click', closeDrawer);
        drawerBackdrop.addEventListener('click', closeDrawer);
    };

    const setupAccountDropdowns = () => {
        // Desktop dropdown
        const accountButton = document.getElementById('accountButton');
        const accountDropdown = document.getElementById('accountDropdown');
        if (accountButton && accountDropdown) {
            accountButton.addEventListener('click', () => {
                accountDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', (event) => {
                if (!accountButton.contains(event.target) && !accountDropdown.contains(event.target)) {
                    accountDropdown.classList.add('hidden');
                }
            });
        }

        // Mobile dropdown
        const accountButtonMobile = document.getElementById('accountButtonMobile');
        const accountDropdownMobile = document.getElementById('accountDropdownMobile');
        if (accountButtonMobile && accountDropdownMobile) {
            accountButtonMobile.addEventListener('click', (event) => {
                event.stopPropagation();
                accountDropdownMobile.classList.toggle('hidden');
            });
        }
    };

    const setupSearch = () => {
        const searchInput = document.getElementById('searchInput');
        const initialState = document.getElementById('initialState');
        const loadingState = document.getElementById('loadingState');
        const itemsState = document.getElementById('itemsState');
        
        const handleSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm === '') {
                initialState.classList.remove('hidden');
                loadingState.classList.add('hidden');
                itemsState.classList.add('hidden');
                return;
            }
            initialState.classList.add('hidden');
            loadingState.classList.remove('hidden');
            itemsState.classList.add('hidden');

            // Simulate API call
            setTimeout(() => {
                const searchItems = allItems.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                itemsState.innerHTML = searchItems.map(createItemCard).join('');
                
                loadingState.classList.add('hidden');
                itemsState.classList.remove('hidden');
            }, 1000);
        };

        searchInput.addEventListener('input', debounce(handleSearch, 2000));
    };

    const renderFeaturedBids = () => {
        const featuredBidsContainer = document.getElementById("featuredBidsContainer");
        featuredBidsContainer.innerHTML = bidItems.map(createBidCard).join('');
    };

    const renderAllItems = () => {
        const itemsGridContainer = document.getElementById("itemsGrid");
        itemsGridContainer.innerHTML = allItems.map(createItemCard).join('');
    };
    
    const renderMyBids = () => {
        const bidsInProgressContainer = document.getElementById("bidsInProgress");
        const bidsEndedContainer = document.getElementById("bidsEnded");
        
        myBids.forEach(bid => {
            const isBiddingOpen = new Date(bid.biddingEnd) > new Date();
            if (isBiddingOpen) {
                bidsInProgressContainer.innerHTML += createMyBidCard(bid);
            } else {
                bidsEndedContainer.innerHTML += createMyBidCard(bid);
            }
        });
    };

    // --- Main Initialization Function ---
    const init = () => {
        setupNavigation();
        setupDrawer();
        setupAccountDropdowns();
        setupSearch();
        renderFeaturedBids();
        renderAllItems();
        renderMyBids();
    };

    init();
});