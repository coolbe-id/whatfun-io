// --- Firebase & Cloudinary & ImgBB Configurations ---
const firebaseConfig = {
    apiKey: "AIzaSyAeotajhNxY8fbnlduQYgw2Onm5lhzQ6sg", // Ganti dengan API Key Firebase Anda
    authDomain: "whatfun-800ed.firebaseapp.com",
    projectId: "whatfun-800ed",
    storageBucket: "whatfun-800ed.firebasestorage.app",
    messagingSenderId: "741248738326",
    appId: "1:741248738326:web:10e6aa3b15f30306038137",
    measurementId: "G-85QV6JFQ1W"
};

const IMGBB_API_KEY = "55493d9be803843bb42e5bae856bc4ff"; // Ganti dengan API Key ImgBB Anda
const CLOUDINARY_CLOUD_NAME = "dl6iyeqrc"; // Ganti dengan Cloud Name Cloudinary Anda
const CLOUDINARY_UPLOAD_PRESET_VIDEO = "upload_video_user"; // Ganti dengan Upload Preset Cloudinary Anda

// --- Firebase Initialization ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
// Global Elements
const mainHeader = document.getElementById('mainHeader');
const bottomNav = document.getElementById('bottomNav');
const authStatusElement = document.getElementById('auth-status');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessageElement = document.getElementById('error-message');
const pageContents = document.querySelectorAll('.page-content');
const sidebarPc = document.querySelector('.sidebar-pc');

// Profile Elements
const profilePicHeader = document.getElementById('profilePic');
const profilePicSidebar = document.getElementById('profilePicSidebar');
const anonymousProfileSidebar = document.getElementById('anonymousProfileSidebar');

// Create Post Section Elements
const createPostSection = document.getElementById('createPostSection');
const openCreatePostModal = document.getElementById('openCreatePostModal');
const openPhotoUploadBtn = document.getElementById('openPhotoUpload');
const openVideoUploadBtn = document.getElementById('openVideoUpload');
const openTextUploadBtn = document.getElementById('openTextUpload');
const openCreatePostMobileBtn = document.getElementById('openCreatePostMobile');

// Upload Modal Elements
const uploadModal = document.getElementById('uploadModal');
const modalBackButton = document.getElementById('modalBackButton');
const modalTitle = document.getElementById('modalTitle');
const finalUploadButton = document.getElementById('finalUploadButton');
const postTitleInput = document.getElementById('postTitleInput');
const postDescriptionInput = document.getElementById('postDescriptionInput');
const mediaFileInput = document.getElementById('mediaFileInput');
const previewArea = document.getElementById('previewArea');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const noMediaText = document.getElementById('noMediaText');
const selectMediaButton = document.getElementById('selectMediaButton');
const hashtagInput = document.getElementById('hashtagInput');
const postTypeHiddenInput = document.getElementById('postTypeHiddenInput');

// Page Content Elements
const homePage = document.getElementById('homePage');
const explorePage = document.getElementById('explorePage');
const donatePage = document.getElementById('donatePage');
const settingsPage = document.getElementById('settingsPage');
const videoViewPage = document.getElementById('videoViewPage'); // Added video view page
const contentContainer = document.getElementById('content-container');
const exploreContentContainer = document.getElementById('explore-content-container');
// New: Container for the scrollable video feed
const videoFeedContainer = document.getElementById('videoFeedContainer');

// Navigation Elements
const navItems = document.querySelectorAll('.nav-item');
const pcSearchBar = document.getElementById('pcSearchBar');
const exploreSearchBar = document.getElementById('exploreSearchBar');
const exploreSearchBtn = document.getElementById('exploreSearchBtn');

// Settings Page Elements
const darkModeToggle = document.getElementById('darkModeToggle');

let currentUserId = null;
let selectedFile = null;
let currentPostType = '';
let profilePicRandomIndex = Math.floor(Math.random() * 100) + 1;

// Objek untuk menyimpan unsubscribers dari listener komentar
const commentUnsubscribers = {};
// Array untuk menyimpan semua post video yang terdeteksi untuk halaman view
let allVideoPosts = [];
let currentVideoPlayingInFeed = null; // To keep track of the currently playing video in the feed

// --- Utility Functions ---
function showLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'block';
}

function hideLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
}

function showMessage(element, message, isError = false) {
    if (!element) {
        console.warn("Status/Error message element not found.");
        return;
    }
    element.innerText = message;
    element.style.display = 'block';
    element.className = isError ? 'error-message' : 'status-message';
    setTimeout(() => {
        element.style.display = 'none';
    }, 4000); // Tampilkan selama 4 detik
}

function resetUploadModal() {
    if (postTitleInput) postTitleInput.value = '';
    if (postDescriptionInput) postDescriptionInput.value = '';
    if (mediaFileInput) mediaFileInput.value = '';
    selectedFile = null;
    if (imagePreview) imagePreview.style.display = 'none';
    if (imagePreview) imagePreview.src = '';
    if (videoPreview) videoPreview.style.display = 'none';
    if (videoPreview) videoPreview.src = '';
    if (noMediaText) noMediaText.style.display = 'block';
    if (selectMediaButton) selectMediaButton.classList.remove('hidden-element');
    if (hashtagInput) hashtagInput.value = '';
    if (finalUploadButton) finalUploadButton.disabled = true;
    currentPostType = '';
    if (postTypeHiddenInput) postTypeHiddenInput.value = '';
}

function openUploadModal(type) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk membuat post.", true);
        return;
    }
    resetUploadModal();
    if (uploadModal) uploadModal.style.display = 'flex';
    currentPostType = type;
    if (postTypeHiddenInput) postTypeHiddenInput.value = type;

    // Sembunyikan header, bottom nav, dan sidebar saat modal upload terbuka
    if (mainHeader) {
        mainHeader.classList.add('hidden-element');
    }
    if (bottomNav) {
        bottomNav.classList.add('hidden-element');
    }
    if (sidebarPc) {
        sidebarPc.classList.add('hidden-element');
    }

    if (modalTitle) {
        if (type === 'text') {
            modalTitle.innerText = "Buat Post Teks";
            if (selectMediaButton) selectMediaButton.classList.add('hidden-element');
            if (noMediaText) noMediaText.innerText = "Tidak ada media untuk post teks.";
            if (finalUploadButton) finalUploadButton.disabled = false;
            if (mediaFileInput) mediaFileInput.removeAttribute('accept');
        } else if (type === 'image') {
            modalTitle.innerText = "Upload Foto";
            if (selectMediaButton) selectMediaButton.classList.remove('hidden-element');
            if (mediaFileInput) mediaFileInput.setAttribute('accept', 'image/*');
            if (noMediaText) noMediaText.innerText = "Pilih gambar untuk pratinjau";
            if (finalUploadButton) finalUploadButton.disabled = true;
        } else if (type === 'video') {
            modalTitle.innerText = "Upload Video";
            if (selectMediaButton) selectMediaButton.classList.remove('hidden-element');
            if (mediaFileInput) mediaFileInput.setAttribute('accept', 'video/*');
            if (noMediaText) noMediaText.innerText = "Pilih video untuk pratinjau";
            if (finalUploadButton) finalUploadButton.disabled = true;
        }
    }
}

// --- Profile Picture Logic ---
function updateProfilePics() {
    const randomSeed = profilePicRandomIndex++;
    const imageUrl = `https://picsum.photos/50/50?random=${randomSeed}`;
    const sidebarImageUrl = `https://picsum.photos/80/80?random=${randomSeed}`;

    if (profilePicHeader) profilePicHeader.src = imageUrl;
    if (profilePicSidebar) profilePicSidebar.src = sidebarImageUrl;
}

updateProfilePics();


// --- Firebase Authentication (Anonymous) ---
auth.signInAnonymously()
    .then(() => {
        console.log("Authenticated anonymously!");
        showMessage(authStatusElement, 'Status: Selamat datang, pengguna anonim!');
    })
    .catch((error) => {
        console.error("Error during anonymous authentication:", error);
        showMessage(authStatusElement, `Error Autentikasi: ${error.message}`, true);
    });

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Current User UID:", currentUserId);
    } else {
        currentUserId = null;
        console.log("No user is signed in.");
    }
});

// --- Navigation Logic ---
async function showPage(pageId, pagePath = null) {
    // Cleanup existing comment listeners
    cleanupCommentListeners();
    // Pause any playing video when navigating away
    if (currentVideoPlayingInFeed) {
        currentVideoPlayingInFeed.pause();
        currentVideoPlayingInFeed = null;
    }


    pageContents.forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden-element');
    });
    const currentPageElement = document.getElementById(pageId);
    if (currentPageElement) {
        currentPageElement.classList.remove('hidden-element');
        currentPageElement.classList.add('active');

        // Load dynamic content if pagePath is provided and element is empty
        if (pagePath && currentPageElement.innerHTML.trim() === '') {
            try {
                showLoading();
                const response = await fetch(pagePath);
                if (!response.ok) throw new Error(`Could not load ${pagePath}`);
                const htmlContent = await response.text();
                currentPageElement.innerHTML = htmlContent;
                // Re-attach event listeners for newly loaded content
                attachDynamicPageListeners(pageId);
            } catch (error) {
                console.error(`Error loading page content from ${pagePath}:`, error);
                showMessage(errorMessageElement, `Gagal memuat halaman: ${error.message}`, true);
                currentPageElement.innerHTML = `<p class="error-message">Gagal memuat konten. Coba lagi nanti.</p>`;
            } finally {
                hideLoading();
            }
        }
    }

    navItems.forEach(item => {
        item.classList.remove('active');
        // Handle pages like 'donatePage' that might have sub-pages
        if (item.dataset.page === pageId.replace('Page', '') ||
            (pageId.startsWith('donate') && item.dataset.page === 'donate')) {
            item.classList.add('active');
        }
    });

    if (pageId === 'explorePage') {
        loadExplorePosts();
    } else if (pageId === 'homePage') {
        // Ensure home page posts are refreshed or listeners are active
        // (already handled by the main onSnapshot in the contentContainer)
    }

    const isPC = window.innerWidth > 1024;
    const isTablet = window.innerWidth >= 769 && window.innerWidth <= 1024;

    if (createPostSection) {
        if (pageId === 'homePage') {
            createPostSection.classList.remove('hidden-element');
        } else {
            createPostSection.classList.add('hidden-element');
        }
    }

    if (mainHeader) {
        mainHeader.classList.remove('hidden-element', 'header-hidden-on-mobile-other-pages');
        // MODIFIED: Hide header on videoViewPage as well
        if (!isPC && !isTablet && pageId !== 'homePage' && pageId !== 'videoViewPage') {
            mainHeader.classList.add('header-hidden-on-mobile-other-pages');
        } else if (pageId === 'videoViewPage') { // Ensure hidden on videoViewPage regardless of device
            mainHeader.classList.add('hidden-element');
        }
    }

    if (bottomNav) {
        // MODIFIED: Hide bottom nav on videoViewPage
        if (isPC || isTablet || pageId === 'videoViewPage') {
            bottomNav.classList.add('hidden-element');
        } else {
            bottomNav.classList.remove('hidden-element');
        }
    }

    if (sidebarPc) {
        // MODIFIED: Hide sidebar on videoViewPage
        if (isPC || isTablet && pageId !== 'videoViewPage') { // Keep sidebar for PC/Tablet unless it's videoViewPage
            sidebarPc.classList.remove('hidden-element');
        } else {
            sidebarPc.classList.add('hidden-element');
        }
    }
}

// Function to attach event listeners to dynamically loaded content
function attachDynamicPageListeners(pageId) {
    if (pageId === 'donateCoffeePage') {
        const coffeeDonateBtn = document.getElementById('proceedCoffeeDonate');
        const coffeeAmountButtons = document.querySelectorAll('#donateCoffeePage .amount-button');
        const coffeeCustomAmountInput = document.getElementById('coffeeCustomAmount');

        coffeeAmountButtons.forEach(button => {
            button.addEventListener('click', () => {
                coffeeCustomAmountInput.value = button.dataset.amount;
            });
        });

        if (coffeeDonateBtn) {
            coffeeDonateBtn.addEventListener('click', traktirNgopi);
        }
    } else if (pageId === 'donateCustomPage') {
        const customDonateBtn = document.getElementById('proceedCustomDonate');
        if (customDonateBtn) {
            customDonateBtn.addEventListener('click', donasiKustom);
        }
    }
    // Add other page-specific listeners here if needed (e.g., help center accordion)
}


// Event Listeners for Navigation (bottom nav & sidebar)
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if (page) {
            showPage(page + 'Page');
        }
    });
});

// Event listeners for setting page buttons that load new content
document.addEventListener('click', (e) => {
    const target = e.target.closest('.setting-button, .donate-button'); // Listen for both types of buttons
    if (target && target.dataset.pageId && target.dataset.pagePath) {
        e.preventDefault();
        showPage(target.dataset.pageId, target.dataset.pagePath);
    }
});


// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    showPage('homePage');
    const isDarkMode = localStorage.getItem('darkModeEnabled') === 'true';
    if (darkModeToggle) {
        darkModeToggle.checked = isDarkMode;
    }
    setDarkMode(isDarkMode);
});

// Responsiveness on window resize
window.addEventListener('resize', () => {
    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
        showPage(activePage.id);
    }
});

// --- Event Listeners for Create Post Section ---
if (openCreatePostModal) openCreatePostModal.addEventListener('click', () => openUploadModal('text'));
if (openPhotoUploadBtn) openPhotoUploadBtn.addEventListener('click', () => openUploadModal('image'));
if (openVideoUploadBtn) openVideoUploadBtn.addEventListener('click', () => openUploadModal('video'));
if (openTextUploadBtn) openTextUploadBtn.addEventListener('click', () => openUploadModal('text'));
if (openCreatePostMobileBtn) openCreatePostMobileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openUploadModal('text');
});


// --- Upload Modal Event Listeners ---
if (modalBackButton) modalBackButton.addEventListener('click', () => {
    if (uploadModal) uploadModal.style.display = 'none';
    resetUploadModal();

    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
        showPage(activePage.id);
    }
});

if (selectMediaButton) selectMediaButton.addEventListener('click', () => {
    if (mediaFileInput) mediaFileInput.click();
});

if (mediaFileInput) mediaFileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        if (noMediaText) noMediaText.style.display = 'none';

        const fileType = selectedFile.type;
        const fileURL = URL.createObjectURL(selectedFile);

        if (fileType.startsWith('image/')) {
            if (imagePreview) {
                imagePreview.src = fileURL;
                imagePreview.style.display = 'block';
            }
            if (videoPreview) videoPreview.style.display = 'none';
            currentPostType = 'image';
            if (postTypeHiddenInput) postTypeHiddenInput.value = 'image';
            if (finalUploadButton) finalUploadButton.disabled = false;
        } else if (fileType.startsWith('video/')) {
            if (videoPreview) {
                videoPreview.src = fileURL;
                videoPreview.style.display = 'block';
            }
            if (imagePreview) imagePreview.style.display = 'none';
            currentPostType = 'video';
            if (postTypeHiddenInput) postTypeHiddenInput.value = 'video';
            if (finalUploadButton) finalUploadButton.disabled = false;
        } else {
            showMessage(errorMessageElement, "Format file tidak didukung (hanya gambar/video).", true);
            selectedFile = null;
            if (imagePreview) imagePreview.style.display = 'none';
            if (videoPreview) videoPreview.style.display = 'none';
            if (noMediaText) noMediaText.style.display = 'block';
            if (finalUploadButton) {
                if (currentPostType === 'text') {
                    finalUploadButton.disabled = false;
                } else {
                    finalUploadButton.disabled = true;
                }
            }
        }
    }
});


if (finalUploadButton) finalUploadButton.addEventListener('click', async () => {
    const title = postTitleInput ? postTitleInput.value.trim() : '';
    const description = postDescriptionInput ? postDescriptionInput.value.trim() : '';
    const hashtags = hashtagInput ? hashtagInput.value.split(' ').map(tag => tag.trim()).filter(tag => tag.startsWith('#') && tag.length > 1) : [];

    if (currentPostType === 'text' && !description && !title) {
        showMessage(errorMessageElement, "Judul atau deskripsi post teks tidak boleh kosong!", true);
        return;
    }
    if ((currentPostType === 'image' || currentPostType === 'video') && !selectedFile) {
        showMessage(errorMessageElement, "Anda harus memilih file media!", true);
        return;
    }

    showLoading();
    let mediaUrl = null;

    try {
        if (currentPostType === 'image' && selectedFile) {
            mediaUrl = await uploadToImgBB(selectedFile);
            if (!mediaUrl) throw new Error("Gagal mengunggah gambar ke ImgBB.");
            console.log("ImgBB URL:", mediaUrl);
        } else if (currentPostType === 'video' && selectedFile) {
            mediaUrl = await uploadToCloudinary(selectedFile);
            if (!mediaUrl) throw new Error("Gagal mengunggah video ke Cloudinary.");
            console.log("Cloudinary URL:", mediaUrl);
        }

        const postData = {
            userId: currentUserId,
            type: currentPostType,
            title: title,
            description: description,
            hashtags: hashtags,
            votes: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (mediaUrl) {
            postData.url = mediaUrl;
        }

        await db.collection("posts").add(postData);
        showMessage(authStatusElement, "Post berhasil diunggah!");
        if (uploadModal) uploadModal.style.display = 'none';
        resetUploadModal();

        const activePage = document.querySelector('.page-content.active');
        if (activePage) {
            showPage(activePage.id);
        }

    } catch (error) {
        console.error("Error saat upload post:", error);
        showMessage(errorMessageElement, `Gagal upload post: ${error.message}`, true);
    } finally {
        hideLoading();
    }
});


// --- Upload Photo to ImgBB ---
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            console.error("Gagal mengunggah foto ke ImgBB:", data.error.message);
            throw new Error(`ImgBB upload failed: ${data.error.message}`);
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat mengunggah ke ImgBB:", error);
        throw error;
    }
}

// --- Upload Video to Cloudinary ---
async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_VIDEO);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.secure_url) {
                resolve(data.secure_url);
            } else {
                console.error("Cloudinary upload failed:", data.error);
                reject(new Error(data.error?.message || "Gagal mengunggah video ke Cloudinary."));
            }
        })
        .catch(error => {
            console.error("Error saat mengunggah ke Cloudinary:", error);
            reject(new Error(`Terjadi kesalahan jaringan/lainnya saat upload video: ${error.message}`));
        });
    });
}


// --- Display Posts from Firestore (for Home Page) ---
if (contentContainer) {
    db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        if (!contentContainer) return;
        contentContainer.innerHTML = '';
        allVideoPosts.length = 0; // Clear previous videos

        if (snapshot.empty) {
            contentContainer.innerHTML = '<p class="status-message">Belum ada post. Mari buat yang pertama!</p>';
            return;
        }
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;
            const postCardElement = createPostCard(post, postId);
            contentContainer.appendChild(postCardElement);
            renderComments(postId);
            if (post.type === 'video') {
                allVideoPosts.push({ id: postId, ...post });
            }
        });
        const searchTerm = pcSearchBar ? pcSearchBar.value.trim().toLowerCase() : '';
        filterHomePagePosts(searchTerm);
        setupVideoObservers(); // Setup observers after new posts are added
    }, (error) => {
        console.error("Error fetching posts for home page:", error);
        showMessage(errorMessageElement, `Gagal memuat post beranda: ${error.message}`, true);
    });
}


// --- Explore Page Logic ---
const allExplorePosts = [];
let explorePostsLoaded = false;

async function loadExplorePosts(searchTerm = '') {
    if (!exploreContentContainer) return;

    explorePostsLoaded = false;

    showLoading();
    try {
        const snapshot = await db.collection("posts").orderBy("createdAt", "desc").get();
        allExplorePosts.length = 0;
        allVideoPosts.length = 0; // Clear previous videos

        snapshot.forEach(doc => {
            const postData = { id: doc.id, ...doc.data() };
            allExplorePosts.push(postData);
            if (postData.type === 'video') {
                allVideoPosts.push(postData);
            }
        });
        explorePostsLoaded = true;
        renderExplorePosts(allExplorePosts, searchTerm);
    } catch (error) {
        console.error("Error fetching explore posts:", error);
        showMessage(errorMessageElement, `Gagal memuat rekomendasi: ${error.message}`, true);
    } finally {
        hideLoading();
    }
}

function renderExplorePosts(posts, searchTerm = '') {
    if (!exploreContentContainer) return;

    exploreContentContainer.innerHTML = '';
    let filteredPosts = posts;

    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredPosts = posts.filter(post =>
            (post.title && post.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (post.description && post.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
        );
    }

    if (filteredPosts.length === 0) {
        exploreContentContainer.innerHTML = '<p class="status-message">Tidak ada hasil ditemukan.</p>';
        return;
    }

    filteredPosts.forEach(post => {
        const postCardElement = createPostCard(post, post.id);
        exploreContentContainer.appendChild(postCardElement);
        renderComments(post.id);
    });
    setupVideoObservers(); // Setup observers after new posts are added
}

// Search bar event listener for Explore page
if (exploreSearchBtn) exploreSearchBtn.addEventListener('click', () => {
    const searchTerm = exploreSearchBar ? exploreSearchBar.value.trim() : '';
    loadExplorePosts(searchTerm);
});

if (exploreSearchBar) exploreSearchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = exploreSearchBar.value.trim();
        loadExplorePosts(searchTerm);
    }
});

// PC Header Search Bar (simple filter for home posts)
if (pcSearchBar) pcSearchBar.addEventListener('input', () => {
    const searchTerm = pcSearchBar.value.trim().toLowerCase();
    filterHomePagePosts(searchTerm);
});


function filterHomePagePosts(searchTerm) {
    if (!contentContainer) return;
    const allCards = contentContainer.querySelectorAll('.post-card');
    let anyVisible = false;

    allCards.forEach(card => {
        const postTitle = card.querySelector('h3')?.innerText.toLowerCase() || '';
        const postDescription = card.querySelector('p')?.innerText.toLowerCase() || '';
        const postHashtags = card.querySelector('.hashtags')?.innerText.toLowerCase() || '';

        if (searchTerm === '' ||
            postTitle.includes(searchTerm) ||
            postDescription.includes(searchTerm) ||
            postHashtags.includes(searchTerm)) {
            card.style.display = 'block';
            anyVisible = true;
        } else {
            card.style.display = 'none';
        }
    });

    const existingMessage = contentContainer.querySelector('.status-message.temp-search');
    if (!anyVisible && searchTerm !== '') {
        if (!existingMessage) {
            const messageDiv = document.createElement('p');
            messageDiv.classList.add('status-message', 'temp-search');
            messageDiv.innerText = 'Tidak ada hasil ditemukan di beranda.';
            contentContainer.appendChild(messageDiv);
        }
    } else if (existingMessage) {
        existingMessage.remove();
    }
}

// --- Video Autoplay/Pause on Scroll Logic ---
function setupVideoObservers() {
    const videoElements = document.querySelectorAll('.post-card video'); // Target videos only in general post cards

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.8 // 80% of the video must be visible
    };

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.muted = false; // Set to false for unmuted autoplay
                video.play().catch(error => {
                    console.warn("Autoplay (unmuted) prevented:", error);
                    video.muted = true;
                    video.play().catch(e => console.warn("Muted autoplay also prevented:", e));
                });
                currentVideoPlayingInFeed = video; // Keep track of the playing video
            } else {
                video.pause();
                video.currentTime = 0; // Reset video to start
                if (currentVideoPlayingInFeed === video) {
                    currentVideoPlayingInFeed = null;
                }
            }
        });
    }, observerOptions);

    videoElements.forEach(video => {
        video.setAttribute('preload', 'metadata');
        video.setAttribute('controls', 'true'); // Keep controls, but rely on CSS to hide them
        videoObserver.observe(video);
    });
}


// --- Dynamic Post Card Creation (Reusable) ---
function createPostCard(post, postId) {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');
    postCard.dataset.postId = postId;

    let mediaContent = '';
    if (post.url) {
        if (post.type === "image") {
            mediaContent = `<img src="${post.url}" alt="${post.title || 'Post Image'}">`;
        } else if (post.type === "video") {
            mediaContent = `
                <div class="video-player-container">
                    <video preload="metadata" src="${post.url}#t=1" controls></video>
                </div>
            `;
        }
    }

    const postText = post.description || '';
    const timestamp = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : 'Baru saja';
    const hashtagsHtml = post.hashtags && post.hashtags.length > 0
        ? `<div class="hashtags">${post.hashtags.map(tag => `<span>${tag}</span>`).join(' ')}</div>`
        : '';

    postCard.innerHTML = `
        ${post.title ? `<h3>${post.title}</h3>` : ''}
        ${mediaContent}
        <p>${postText.replace(/\n/g, '<br>')}</p>
        ${hashtagsHtml}
        <small>Diposting oleh: ${post.userId ? post.userId.substring(0, 8) : 'Anonim'}... pada ${timestamp}</small>
        <div class="vote-buttons">
            <button onclick="handleVote('${postId}', 'up')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.093l-8 8H7v8h10v-8h3z"/>
                </svg>
                Upvote (${post.votes || 0})
            </button>
            <button onclick="handleVote('${postId}', 'down')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 19.907l8-8H17V4H7v8H4z"/>
                </svg>
                Downvote
            </button>
        </div>
        <div class="comments-section">
            <h3>Komentar:</h3>
            <div class="comment-input-bar">
                <input type="text" id="commentInput-${postId}" placeholder="Tambahkan komentar...">
                <button onclick="addComment('${postId}')">Kirim</button>
            </div>
            <div class="comment-list" id="commentList-${postId}"></div>
        </div>
    `;
    return postCard;
}

// MODIFIED: `togglePlayPause` function is removed as custom play/pause buttons are removed.


// --- Dedicated Video Post View Page Logic ---
// MODIFIED: This function now populates the scrollable video feed
window.openVideoView = async function(initialPostId = null) {
    showLoading();
    try {
        // Load videoViewPage.html content if not already loaded
        const videoViewPageElement = document.getElementById('videoViewPage');
        if (videoViewPageElement.innerHTML.trim() === '') {
            const response = await fetch('videoViewPage.html'); // Pastikan path ini benar
            if (!response.ok) throw new Error('Could not load videoViewPage.html');
            videoViewPageElement.innerHTML = await response.text();
        }

        showPage('videoViewPage'); // Show the video view page

        // Ensure allVideoPosts is populated (it should be from home/explore page loads)
        if (allVideoPosts.length === 0) {
            const snapshot = await db.collection("posts").where("type", "==", "video").orderBy("createdAt", "desc").get();
            snapshot.forEach(doc => allVideoPosts.push({ id: doc.id, ...doc.data() }));
        }

        if (allVideoPosts.length === 0) {
            showMessage(errorMessageElement, "Tidak ada postingan video untuk ditampilkan.", true);
            hideLoading();
            return;
        }

        // Find the index of the initial video to start from
        let startIndex = 0;
        if (initialPostId) {
            const foundIndex = allVideoPosts.findIndex(post => post.id === initialPostId);
            if (foundIndex !== -1) {
                startIndex = foundIndex;
            }
        }

        if (videoFeedContainer) {
            videoFeedContainer.innerHTML = ''; // Clear previous items

            // Render all video posts into the scrollable feed
            allVideoPosts.forEach(videoPost => {
                const videoFeedItem = document.createElement('div');
                videoFeedItem.classList.add('video-feed-item');
                videoFeedItem.dataset.postId = videoPost.id;

                const timestamp = videoPost.createdAt ? new Date(videoPost.createdAt.toDate()).toLocaleString() : 'Baru saja';
                const hashtagsHtml = videoPost.hashtags && videoPost.hashtags.length > 0
                    ? `<div class="hashtags">${videoPost.hashtags.map(tag => `<span>${tag}</span>`).join(' ')}</div>`
                    : '';

                videoFeedItem.innerHTML = `
                    <div class="video-player-container full-height-video">
                        <video preload="auto" src="${videoPost.url}" controls></video>
                    </div>
                    <div class="video-details-overlay">
                        <h3>${videoPost.title || 'Untitled Video'}</h3>
                        <p>${videoPost.description || ''}</p>
                        ${hashtagsHtml}
                        <small>Diposting oleh: ${videoPost.userId ? videoPost.userId.substring(0, 8) : 'Anonim'}... pada ${timestamp}</small>
                    </div>
                    <div class="video-actions">
                        <button onclick="handleVote('${videoPost.id}', 'up')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.093l-8 8H7v8h10v-8h3z"/>
                            </svg>
                            ${videoPost.votes || 0}
                        </button>
                        <button onclick="openVideoCommentsModal('${videoPost.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 3h-2V1H5v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 7h8v2H8zm0 4h8v2H8zm0 4h5v2H8z"/>
                            </svg>
                            Komentar
                        </button>
                    </div>
                `;
                videoFeedContainer.appendChild(videoFeedItem);
            });

            // Scroll to the initial video
            const initialVideoElement = videoFeedContainer.querySelector(`[data-post-id="${allVideoPosts[startIndex].id}"]`);
            if (initialVideoElement) {
                initialVideoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Set up intersection observer for the video feed
        setupVideoFeedObserver();

        // Ensure main header and bottom nav are hidden on this page
        if (mainHeader) mainHeader.classList.add('hidden-element');
        if (bottomNav) bottomNav.classList.add('hidden-element');
        if (sidebarPc) sidebarPc.classList.add('hidden-element');

    } catch (error) {
        console.error("Error opening video view:", error);
        showMessage(errorMessageElement, `Gagal membuka tampilan video: ${error.message}`, true);
    } finally {
        hideLoading();
    }
};

// NEW: Intersection Observer for scrollable video feed
function setupVideoFeedObserver() {
    const videoFeedItems = document.querySelectorAll('#videoFeedContainer .video-feed-item');

    const observerOptions = {
        root: videoFeedContainer, // Observe relative to the videoFeedContainer
        rootMargin: '0px',
        threshold: 0.75 // A video is considered "in view" if 75% is visible
    };

    const feedObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');

            if (entry.isIntersecting) {
                // Pause any previously playing video
                if (currentVideoPlayingInFeed && currentVideoPlayingInFeed !== video) {
                    currentVideoPlayingInFeed.pause();
                    currentVideoPlayingInFeed.currentTime = 0; // Reset
                }

                // Attempt to play the current video (unmuted)
                video.muted = false;
                video.play().then(() => {
                    currentVideoPlayingInFeed = video;
                }).catch(error => {
                    console.warn("Autoplay (unmuted) prevented in feed:", error);
                    video.muted = true;
                    video.play().catch(e => console.warn("Muted autoplay also prevented in feed:", e));
                    currentVideoPlayingInFeed = video; // Still track it as the "active" one
                });
            } else {
                // Pause video when it goes out of view
                video.pause();
                video.currentTime = 0; // Reset video to start
                if (currentVideoPlayingInFeed === video) {
                    currentVideoPlayingInFeed = null;
                }
            }
        });
    }, observerOptions);

    videoFeedItems.forEach(item => {
        const video = item.querySelector('video');
        video.setAttribute('preload', 'auto'); // Ensure videos are preloaded aggressively
        feedObserver.observe(item);
    });
}


// NEW: Modal for comments on video view page (optional, but good UX)
const videoCommentsModal = document.getElementById('videoCommentsModal');
const videoCommentsContent = document.getElementById('videoCommentsContent');
const closeVideoCommentsModalBtn = document.getElementById('closeVideoCommentsModal');

if (closeVideoCommentsModalBtn) {
    closeVideoCommentsModalBtn.addEventListener('click', () => {
        videoCommentsModal.style.display = 'none';
        // Cleanup any comment listeners if necessary
    });
}

window.openVideoCommentsModal = function(postId) {
    if (!videoCommentsModal || !videoCommentsContent) return;

    // You might want to clear previous content or show a loader
    videoCommentsContent.innerHTML = `
        <h3>Komentar Post Video:</h3>
        <div class="comment-input-bar">
            <input type="text" id="modalCommentInput-${postId}" placeholder="Tambahkan komentar...">
            <button onclick="addComment('${postId}', 'modalCommentInput-${postId}')">Kirim</button>
        </div>
        <div class="comment-list" id="modalCommentList-${postId}"></div>
    `;

    renderComments(postId, `modalCommentList-${postId}`); // Reuse renderComments for the modal

    videoCommentsModal.style.display = 'block';
};

// MODIFIED: addComment now accepts an optional input ID
window.addComment = async function(postId, inputElementId = null) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk berkomentar.", true);
        return;
    }
    const commentInput = inputElementId ? document.getElementById(inputElementId) : document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();

    if (!commentText) {
        showMessage(errorMessageElement, "Komentar tidak boleh kosong!", true);
        return;
    }

    try {
        const postRef = db.collection("posts").doc(postId);
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) {
                throw "Post tidak ditemukan!";
            }
            const currentComments = postDoc.data().comments || [];
            const newComment = {
                userId: currentUserId,
                text: commentText,
                votes: 0,
                createdAt: firebase.firestore.Timestamp.now()
            };
            const updatedComments = [...currentComments, newComment];
            transaction.update(postRef, { comments: updatedComments });
        });

        commentInput.value = '';
        showMessage(authStatusElement, "Komentar berhasil ditambahkan!");
    } catch (error) {
        console.error("Error menambahkan komentar:", error);
        showMessage(errorMessageElement, `Gagal menambahkan komentar: ${error.message}`, true);
    }
}

// MODIFIED: renderComments now accepts an optional list ID
function renderComments(postId, commentListId = null) {
    const commentListDiv = commentListId ? document.getElementById(commentListId) : document.getElementById(`commentList-${postId}`);
    if (!commentListDiv) {
        console.warn(`commentListDiv for postId ${postId} and ID ${commentListId} not found.`);
        return;
    }

    // Ensure we only have one listener per comment list
    if (commentUnsubscribers[commentListId || postId]) {
        commentUnsubscribers[commentListId || postId]();
        delete commentUnsubscribers[commentListId || postId];
    }

    const unsubscribe = db.collection("posts").doc(postId).onSnapshot((doc) => {
        if (doc.exists) {
            const post = doc.data();
            const comments = post.comments || [];
            commentListDiv.innerHTML = '';

            if (comments.length === 0) {
                commentListDiv.innerHTML = '<p class="no-comments">Belum ada komentar.</p>';
                return;
            }

            comments.sort((a, b) => {
                const timeA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : 0;
                const timeB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : 0;
                return timeB - timeA;
            });

            comments.forEach((comment) => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                const timestamp = comment.createdAt && typeof comment.createdAt.toDate === 'function' ? new Date(comment.createdAt.toDate()).toLocaleString() : 'Baru saja';
                const commentUniqueId = `${comment.createdAt.toMillis()}-${comment.userId}`;

                commentDiv.innerHTML = `
                    <div class="comment-content">
                        <p><strong>${comment.userId ? comment.userId.substring(0, 8) : 'Anonim'}...</strong>: ${comment.text}</p>
                        <small>${timestamp}</small>
                    </div>
                    <div class="comment-votes">
                        <button onclick="handleCommentVote('${postId}', '${commentUniqueId}', 'up')">▲</button>
                        <span>${comment.votes || 0}</span>
                        <button onclick="handleCommentVote('${postId}', '${commentUniqueId}', 'down')">▼</button>
                    </div>
                `;
                commentListDiv.appendChild(commentDiv);
            });
        }
    }, (error) => {
        console.error(`Error fetching comments for post ${postId}:`, error);
    });

    commentUnsubscribers[commentListId || postId] = unsubscribe;
}


function cleanupCommentListeners() {
    for (const key in commentUnsubscribers) {
        if (commentUnsubscribers.hasOwnProperty(key)) {
            commentUnsubscribers[key]();
            delete commentUnsubscribers[key];
        }
    }
}

window.handleCommentVote = async function(postId, commentIdentifier, type) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk vote komentar.", true);
        return;
    }

    const [commentTimestampStr, commentUserId] = commentIdentifier.split('-');
    const commentTimestamp = parseInt(commentTimestampStr);

    const postRef = db.collection("posts").doc(postId);
    try {
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) {
                throw "Post tidak ditemukan!";
            }

            let comments = postDoc.data().comments || [];
            let foundIndex = -1;

            for (let i = 0; i < comments.length; i++) {
                const comment = comments[i];
                const commentTime = comment.createdAt && typeof comment.createdAt.toMillis === 'function' ? comment.createdAt.toMillis() : 0;
                if (commentTime === commentTimestamp && comment.userId === commentUserId) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex === -1) {
                throw "Komentar tidak ditemukan atau identifikasi salah!";
            }

            let commentToUpdate = { ...comments[foundIndex] };
            let newCommentVotes = commentToUpdate.votes || 0;

            if (type === 'up') {
                newCommentVotes++;
            } else if (type === 'down') {
                newCommentVotes--;
            }

            commentToUpdate.votes = newCommentVotes;
            comments[foundIndex] = commentToUpdate;

            transaction.update(postRef, { comments: comments });
        });
        console.log("Vote komentar berhasil!");
    } catch (error) {
        console.error("Error saat voting komentar:", error);
        showMessage(errorMessageElement, `Gagal vote komentar: ${error.message}`, true);
    }
}

// --- New Donation & Info Page Functions ---
window.traktirNgopi = function() {
    const amountInput = document.getElementById('coffeeCustomAmount');
    let amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < 10000) {
        showMessage(errorMessageElement, "Jumlah donasi kopi minimal Rp 10.000!", true);
        return;
    }

    showMessage(authStatusElement, `Terima kasih! Anda mentraktir kopi sebesar Rp ${amount.toLocaleString('id-ID')} (simulasi).`);
    // TODO: Integrate with a real payment gateway (e.g., Midtrans, Xendit, Stripe, PayPal)
    // This is where you'd redirect to a payment page or initiate a payment API call.
    console.log(`Simulating coffee donation of Rp ${amount}`);
    amountInput.value = ''; // Clear input after "donation"
};

window.donasiKustom = function() {
    const amountInput = document.getElementById('customAmount');
    const donorNameInput = document.getElementById('donorName');
    const donorMessageInput = document.getElementById('donorMessage');

    let amount = parseFloat(amountInput.value);
    const donorName = donorNameInput.value.trim();
    const donorMessage = donorMessageInput.value.trim();

    if (isNaN(amount) || amount <= 0) {
        showMessage(errorMessageElement, "Jumlah donasi harus lebih dari 0!", true);
        return;
    }

    showMessage(authStatusElement, `Terima kasih! Anda berdonasi Rp ${amount.toLocaleString('id-ID')} (simulasi).`);
    // TODO: Integrate with a real payment gateway
    console.log(`Simulating custom donation of Rp ${amount} from ${donorName} with message: "${donorMessage}"`);

    // Clear inputs after "donation"
    amountInput.value = '';
    donorNameInput.value = '';
    donorMessageInput.value = '';
};


// --- Dark Mode Toggle ---
const localStorageKey = 'darkModeEnabled';

function setDarkMode(isEnabled) {
    if (isEnabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem(localStorageKey, isEnabled);
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (event) => {
        setDarkMode(event.target.checked);
    });
}
