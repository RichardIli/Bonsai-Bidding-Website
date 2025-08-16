document.addEventListener('DOMContentLoaded', function () {
    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('nav a, .drawer a[data-target]');
    const mainContent = document.getElementById('mainContent');
    const sections = mainContent.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = this.dataset.target;

            // Close the drawer if it's open
            const drawer = document.getElementById('drawer');
            const drawerBackdrop = document.getElementById('drawerBackdrop');
            drawer.classList.add('translate-x-full');
            drawerBackdrop.classList.add('hidden');

            sections.forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(target).classList.remove('hidden');
        });
    });

    // --- Drawer Logic ---
    const hamburgerButton = document.getElementById('hamburgerButton');
    const closeDrawerButton = document.getElementById('closeDrawerButton');
    const drawer = document.getElementById('drawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    // Open the drawer
    hamburgerButton.addEventListener('click', function () {
        drawer.classList.remove('translate-x-full');
        drawerBackdrop.classList.remove('hidden');
    });

    // Close the drawer
    closeDrawerButton.addEventListener('click', function () {
        drawer.classList.add('translate-x-full');
        drawerBackdrop.classList.add('hidden');
    });

    // Close the drawer when clicking the backdrop
    drawerBackdrop.addEventListener('click', function () {
        drawer.classList.add('translate-x-full');
        drawerBackdrop.classList.add('hidden');
    });

    // --- Account Dropdown Logic (Desktop) ---
    const accountButton = document.getElementById('accountButton');
    const accountDropdown = document.getElementById('accountDropdown');

    // Open/close dropdown on click
    accountButton.addEventListener('click', function () {
        accountDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (!accountButton.contains(event.target) && !accountDropdown.contains(event.target)) {
            accountDropdown.classList.add('hidden');
        }
    });

    // --- Account Dropdown Logic (Mobile Drawer) ---
    const accountButtonMobile = document.getElementById('accountButtonMobile');
    const accountDropdownMobile = document.getElementById('accountDropdownMobile');

    accountButtonMobile.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevents the drawer from closing
        accountDropdownMobile.classList.toggle('hidden');
    });

    // --- Sample Data & Dynamic Content Generation ---
    // Featured Bids Section
    function createBidCard(item) {
        return `
                    <div class="inline-block w-64 mr-4 bg-white rounded-lg shadow-md p-4">
                        <img src="${item.image}" alt="${item.name}" class="mb-2 rounded-md">
                        <h3 class="text-xl font-semibold text-green-600">${item.name}</h3>
                        <p class="text-gray-700">${item.description}</p>
                        <p class="text-green-800 font-bold">Current Bid: ${item.currentBid}</p>
                        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2">Place
                            Bid</button>
                    </div>
                `;
    }

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

    const featuredBidsContainer = document.getElementById("featuredBidsContainer");
    bidItems.forEach(item => {
        featuredBidsContainer.innerHTML += createBidCard(item);
    });

    // Function to create item card
    function createItemCard(item) {
        return `
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <img src="${item.image}" alt="${item.name}" class="mb-2 rounded-md">
                        <h3 class="text-xl font-semibold text-green-600">${item.name}</h3>
                        <p class="text-gray-700">${item.description}</p>
                         <p class="text-gray-700">Uploaded by: ${item.uploader}</p>
                        <p class="text-green-800 font-bold">Current Bid: ${item.currentBid}</p>
                        <p class="text-gray-600">Bidding Ends: ${item.biddingEnd}</p>
                        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2">View
                            Item</button>
                    </div>
                `;
    }

    const items = [
        {
            itemId: "1",
            image: "https://via.placeholder.com/300x200",
            name: "Awesome Gadget",
            description: "A very awesome gadget.",
            startingBid: "$50",
            uploadDate: "2024-01-15",
            uploader: "User123",
            currentBid: "$75",
            biddingEnd: "2024-01-22"
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
            biddingEnd: "2024-01-20"
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
            biddingEnd: "2024-01-18"
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
            biddingEnd: "2024-01-17"
        }
    ];

    const itemsGridContainer = document.getElementById("itemsGrid");
    items.forEach(item => {
        itemsGridContainer.innerHTML += createItemCard(item);
    });

    // Browse Section
    const searchInput = document.getElementById('searchInput');
    const initialState = document.getElementById('initialState');
    const loadingState = document.getElementById('loadingState');
    const itemsState = document.getElementById('itemsState');

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

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

        setTimeout(() => {
            const searchItems = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            itemsState.innerHTML = '';
            searchItems.forEach(item => {
                itemsState.innerHTML += createItemCard(item);
            });
            loadingState.classList.add('hidden');
            itemsState.classList.remove('hidden');
        }, 1000);
    };

    searchInput.addEventListener('input', debounce(handleSearch, 2000));

    // My Bids Section
    function createMyBidCard(bid) {
        const isBiddingOpen = new Date(bid.biddingEnd) > new Date();
        const hasWon = !isBiddingOpen && parseFloat(bid.yourBid.replace('$', '')) > parseFloat(bid.currentBid.replace('$', ''));
        let statusText = "";
        if (isBiddingOpen) {
            statusText = "Bidding in Progress";
        } else if (hasWon) {
            statusText = "You Won!";
        } else {
            statusText = "You Lost";
        }
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
    }

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
});