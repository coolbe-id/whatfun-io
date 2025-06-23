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
const splashScreen = document.getElementById('splashScreen'); // Get the splash screen element

// Profile Elements
const profilePicHeader = document.getElementById('profilePic');
const profilePicSidebar = document.getElementById('profilePicSidebar');
// const anonymousProfileSidebar = document.getElementById('anonymousProfileSidebar'); // Tidak digunakan langsung

// Create Post Section Elements (for Home Page)
const createPostSection = document.getElementById('createPostSection');
const openCreatePostModal = document.getElementById('openCreatePostModal');
const openPhotoUploadBtn = document.getElementById('openPhotoUpload');
const openVideoUploadBtn = document.getElementById('openVideoUpload');
const openTextUploadBtn = document.getElementById('openTextUpload');
const openCreatePostMobileBtn = document.getElementById('openCreatePostMobile');

// Upload Modal Elements (for creating posts anywhere)
const uploadModal = document.getElementById('uploadModal');
const modalBackButton = document.getElementById('modalBackButton');
const modalTitle = document.getElementById('modalTitle');
const finalUploadButton = document.getElementById('finalUploadButton');
const postTitleInput = document.getElementById('postTitleInput');
const postDescriptionInput = document.getElementById('postDescriptionInput');
const mediaFileInput = document.getElementById('mediaFileInput');
const previewArea = document.getElementById('previewArea'); // For image/video preview in modal
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const noMediaText = document.getElementById('noMediaText');
const selectMediaButton = document.getElementById('selectMediaButton');
const hashtagInput = document.getElementById('hashtagInput');
const postTypeHiddenInput = document.getElementById('postTypeHiddenInput');

// NEW: Upload Loading Screen Elements
const uploadLoadingScreen = document.getElementById('uploadLoadingScreen');
const uploadProgressText = document.getElementById('uploadProgressText');


// Page Content Elements
const homePage = document.getElementById('homePage');
const explorePage = document.getElementById('explorePage');
const settingsPage = document.getElementById('settingsPage');
const videoViewPage = document.getElementById('videoViewPage');
const contentContainer = document.getElementById('content-container'); // Home page feed
const exploreContentContainer = document.getElementById('explore-content-container'); // Explore page feed
const videoFeedContainer = document.getElementById('reelsContainer'); // Video View Page feed

// --- GROUP ELEMENTS ---
const groupsPage = document.getElementById('groupsPage');
const groupList = document.getElementById('groupList'); // Main container for all groups on groupsPage
const createGroupPage = document.getElementById('createGroupPage');
const createGroupForm = document.getElementById('create-group-form'); // The form itself
const groupNameInput = document.getElementById('groupName');
const groupDescriptionInput = document.getElementById('groupDescription');
const groupCategoryInput = document.getElementById('groupCategory');
const groupBannerInput = document.getElementById('groupBanner');
const groupBannerPreview = document.getElementById('groupBannerPreview'); // The <img> for banner preview
const createGroupSubmitBtn = createGroupForm ? createGroupForm.querySelector('button[type="submit"]') : null;

const groupDetailPage = document.getElementById('groupDetailPage');
const detailGroupBanner = document.getElementById('detailGroupBanner');
const detailGroupName = document.getElementById('detailGroupName');
const detailGroupDescription = document.getElementById('detailGroupDescription');
const detailGroupTimer = document.getElementById('detailGroupTimer');
const voteUpButton = document.getElementById('voteUpButton');
const voteDownButton = document.getElementById('voteDownButton');
// For Group Detail Page posting:
const openGroupPostModalPlaceholder = document.getElementById('openGroupPostModal'); // Placeholder input area
const openGroupPhotoUpload = document.getElementById('openGroupPhotoUpload');
const openGroupVideoUpload = document.getElementById('openGroupVideoUpload');
const postGroupContentButton = document.getElementById('postGroupContentButton'); // If this is a direct post button for text
const groupPostList = document.getElementById('groupPostList');

// Navigation Elements
const navItems = document.querySelectorAll('.nav-item');
const pcSearchBar = document.getElementById('pcSearchBar');
const exploreSearchBar = document.getElementById('exploreSearchBar');
const exploreSearchBtn = document.getElementById('exploreSearchBtn');

// Settings Page Elements
const darkModeToggle = document.getElementById('darkModeToggle');

// --- Global Variables ---
let currentUserId = null;
let selectedFile = null; // For general post media
let currentPostType = '';
let profilePicRandomIndex = Math.floor(Math.random() * 100) + 1;
let selectedGroupBannerFile = null; // For group banner upload
let currentGroupId = null; // To keep track of the currently viewed group

// Objek untuk menyimpan unsubscribers dari listener komentar
const commentUnsubscribers = {};
// Array untuk menyimpan semua post video yang terdeteksi untuk halaman view
let allVideoPosts = [];
let currentVideoPlayingInFeed = null; // To keep track of the currently playing video in the feed

// Group vote timers and listeners
const groupVoteTimers = {};
const groupUnsubscribers = {}; // To manage group detail page listener


// --- Utility Functions ---

/**
 * Menampilkan indikator loading utama.
 */
function showLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'block';
}

/**
 * Menyembunyikan indikator loading utama.
 */
function hideLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
}

/**
 * Menampilkan pesan status atau error.
 * @param {HTMLElement} element - Elemen DOM tempat pesan akan ditampilkan.
 * @param {string} message - Teks pesan.
 * @param {boolean} isError - True jika pesan adalah error, false untuk status.
 */
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

/**
 * Mengatur ulang semua input dan tampilan di modal unggah.
 */
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
    modalTitle.innerText = "Buat Post Baru"; // Reset title
    if (postTypeHiddenInput) postTypeHiddenInput.removeAttribute('data-group-id'); // Clear group context
}

/**
 * Membuka modal unggah berdasarkan tipe (image, video, text).
 * @param {string} type - Tipe unggahan ('image', 'video', 'text').
 */
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
    if (mainHeader) mainHeader.classList.add('hidden-element');
    if (bottomNav) bottomNav.classList.add('hidden-element');
    if (sidebarPc) sidebarPc.classList.add('hidden-element');

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

/**
 * Memperbarui gambar profil anonim.
 */
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
/**
 * Menampilkan halaman berdasarkan ID, opsional memuat konten dari path eksternal.
 * @param {string} pageId - ID elemen div halaman yang akan ditampilkan.
 * @param {string} pagePath - (Opsional) Path ke file HTML eksternal untuk konten halaman.
 * @param {string} loadDataId - (Opsional) ID data yang akan dimuat (misal: group ID).
 * @returns {Promise<void>} Resolves when the page is shown and content is loaded.
 */
async function showPage(pageId, pagePath = null, loadDataId = null) {
    // Cleanup existing comment listeners
    cleanupCommentListeners();
    // Pause any playing video when navigating away
    if (currentVideoPlayingInFeed) {
        currentVideoPlayingInFeed.pause();
        currentVideoPlayingInFeed = null;
    }
    // Cleanup group listener if navigating away from group detail
    if (currentGroupId && groupUnsubscribers[currentGroupId]) {
        groupUnsubscribers[currentGroupId]();
        delete groupUnsubscribers[currentGroupId];
        currentGroupId = null; // Reset current group ID
    }
    // Clear any active group vote timers
    for (const id in groupVoteTimers) {
        clearInterval(groupVoteTimers[id]);
        delete groupVoteTimers[id];
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
        if (item.dataset.page === pageId.replace('Page', '').replace('createGroup', 'groups').replace('groupDetail', 'groups')) {
            item.classList.add('active');
        }
    });

    if (pageId === 'explorePage') {
        await loadExplorePosts();
    } else if (pageId === 'homePage') {
        // Posts already loaded by onSnapshot. Ensure filters are clear if re-entering.
        if (pcSearchBar) pcSearchBar.value = '';
        filterHomePagePosts('');
        // No explicit load needed here as the onSnapshot for 'posts' handles it.
        // We'll hide the splash screen once this initial data setup is done.
    } else if (pageId === 'groupsPage') {
        await loadGroupsContent(); // Load the main groups list (popular/your groups)
    } else if (pageId === 'groupDetailPage' && loadDataId) {
        currentGroupId = loadDataId; // Set the current group ID
        await loadGroupDetail(loadDataId); // Load the specific group's details
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

    // Header visibility logic
    if (mainHeader) {
        mainHeader.classList.remove('hidden-element', 'header-hidden-on-mobile-other-pages');
        if (!isPC && !isTablet && pageId !== 'homePage' && pageId !== 'videoViewPage') {
            // For small screens on non-home, non-video pages, hide header
            mainHeader.classList.add('header-hidden-on-mobile-other-pages');
        } else if (pageId === 'videoViewPage' || pageId === 'groupDetailPage' || pageId === 'createGroupPage') {
            // Explicitly hide header on specific full-screen pages
            mainHeader.classList.add('hidden-element');
        }
    }

    // Bottom Navigation visibility logic
    if (bottomNav) {
        if (isPC || isTablet || pageId === 'videoViewPage' || pageId === 'groupDetailPage' || pageId === 'createGroupPage') {
            // Hide bottom nav on PC/Tablet or on specific full-screen pages
            bottomNav.classList.add('hidden-element');
        } else {
            // Show bottom nav on mobile for main navigation pages
            bottomNav.classList.remove('hidden-element');
        }
    }

    // Sidebar visibility logic
    if (sidebarPc) {
        if ((isPC || isTablet) && pageId !== 'videoViewPage' && pageId !== 'groupDetailPage' && pageId !== 'createGroupPage') {
            sidebarPc.classList.remove('hidden-element');
        } else {
            sidebarPc.classList.add('hidden-element');
        }
    }
}

/**
 * Melampirkan event listener ke konten yang dimuat secara dinamis (misal: halaman pengaturan).
 * @param {string} pageId - ID halaman yang baru dimuat.
 */
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
    // Tambahkan listener spesifik halaman lainnya di sini jika diperlukan
}


// Event Listeners for Navigation (bottom nav & sidebar)
navItems.forEach(item => {
    item.addEventListener('click', async (e) => { // Made async to await showPage
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if (page) {
            await showPage(page + 'Page'); // Await the page showing
        }
    });
});

// Event listeners for setting page buttons that load new content
document.addEventListener('click', async (e) => { // Made async to await showPage
    const target = e.target.closest('.setting-button, .donate-button, .group-button');
    if (target) {
        e.preventDefault();
        if (target.dataset.pageId && target.dataset.pagePath) {
            await showPage(target.dataset.pageId, target.dataset.pagePath);
        } else if (target.id === 'createGroupButton' || target.classList.contains('group-button')) {
            await showPage('createGroupPage');
        }
    }
});


// Initial page load (triggered when DOM is fully loaded)
document.addEventListener('DOMContentLoaded', async () => { // Make this async
    await showPage('homePage'); // Default page to show, await its completion

    // Only hide splash screen AFTER the home page content (and its initial data load) is ready.
    if (splashScreen) {
        splashScreen.classList.add('hidden'); // Add the class to hide it via CSS
    }

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
        showPage(activePage.id, null, currentGroupId);
    }
});


// --- Event Listeners for Create Post Section (Home Page) ---
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

    // Show header, bottom nav, and sidebar again
    if (mainHeader) mainHeader.classList.remove('hidden-element');
    if (bottomNav) bottomNav.classList.remove('hidden-element');
    if (sidebarPc) sidebarPc.classList.remove('hidden-element');

    // Re-evaluate page visibility based on current state
    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
        showPage(activePage.id, null, currentGroupId);
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
                // If post type was text, keep button enabled, otherwise disable
                if (currentPostType === 'text') {
                    finalUploadButton.disabled = false;
                } else {
                    finalUploadButton.disabled = true;
                }
            }
        }
    }
});

// This is the universal final upload button for posts
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

    // --- Show the new upload loading screen ---
    if (uploadLoadingScreen) {
        uploadLoadingScreen.classList.add('active');
        if (uploadProgressText) uploadProgressText.innerText = 'Memulai unggahan...';
    }
    // --- Hide the general loading indicator (if you still use it elsewhere) ---
    hideLoading();
    // --- Hide the upload modal ---
    if (uploadModal) uploadModal.style.display = 'none';


    let mediaUrl = null;
    let targetGroupId = postTypeHiddenInput.dataset.groupId || null; // Get group ID from hidden input if set

    try {
        if (currentPostType === 'image' && selectedFile) {
            mediaUrl = await uploadToImgBB(selectedFile); // ImgBB doesn't provide progress
            if (!mediaUrl) throw new Error("Gagal mengunggah gambar ke ImgBB.");
            console.log("ImgBB URL:", mediaUrl);
            if (uploadProgressText) uploadProgressText.innerText = 'Gambar berhasil diunggah...'; // Update text
        } else if (currentPostType === 'video' && selectedFile) {
            // Pass the progress text element to Cloudinary upload
            mediaUrl = await uploadToCloudinary(selectedFile, uploadProgressText);
            if (!mediaUrl) throw new Error("Gagal mengunggah video ke Cloudinary.");
            console.log("Cloudinary URL:", mediaUrl);
        } else {
            if (uploadProgressText) uploadProgressText.innerText = 'Menyimpan post...'; // For text posts
        }

        const postData = {
            userId: currentUserId,
            type: currentPostType,
            title: title,
            description: description,
            hashtags: hashtags,
            votes: 0, // Initialize votes to 0
            votedBy: {}, // Store userId to track who voted
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (mediaUrl) {
            postData.url = mediaUrl;
        }

        // Determine which collection to save the post to
        let collectionRef;
        if (targetGroupId) { // If a group ID is present
            collectionRef = db.collection("groups").doc(targetGroupId).collection("posts");
            console.log("Saving post to group collection:", targetGroupId);
        } else {
            collectionRef = db.collection("posts");
            console.log("Saving post to main collection.");
        }

        await collectionRef.add(postData);
        showMessage(authStatusElement, "Post berhasil diunggah!");
        
        // --- Hide the upload loading screen after successful upload ---
        if (uploadLoadingScreen) uploadLoadingScreen.classList.remove('active');

        resetUploadModal();

        // Show header, bottom nav, and sidebar again after upload is done
        if (mainHeader) mainHeader.classList.remove('hidden-element');
        if (bottomNav) bottomNav.classList.remove('hidden-element');
        if (sidebarPc) sidebarPc.classList.remove('hidden-element');

        const activePage = document.querySelector('.page-content.active');
        if (activePage) {
            await showPage(activePage.id, null, currentGroupId); // Pass currentGroupId to re-load group data if applicable
        }

    } catch (error) {
        console.error("Error saat upload post:", error);
        showMessage(errorMessageElement, `Gagal upload post: ${error.message}`, true);
        // --- Hide the upload loading screen on error ---
        if (uploadLoadingScreen) uploadLoadingScreen.classList.remove('active');
         // Show header, bottom nav, and sidebar again even if error
        if (mainHeader) mainHeader.classList.remove('hidden-element');
        if (bottomNav) bottomNav.classList.remove('hidden-element');
        if (sidebarPc) sidebarPc.classList.remove('hidden-element');
    }
});


// --- Upload Photo to ImgBB ---
/**
 * Mengunggah file gambar ke ImgBB.
 * @param {File} file - Objek file gambar.
 * @returns {Promise<string|null>} URL gambar yang diunggah atau null jika gagal.
 */
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
/**
 * Mengunggah file video ke Cloudinary dengan pembaruan progress.
 * @param {File} file - Objek file video.
 * @param {HTMLElement} [progressTextElement=null] - Elemen DOM untuk menampilkan progress unggahan.
 * @returns {Promise<string|null>} URL video yang diunggah.
 */
async function uploadToCloudinary(file, progressTextElement = null) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_VIDEO);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                if (progressTextElement) {
                    progressTextElement.innerText = `Mengunggah: ${percent}%`;
                }
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                if (data.secure_url) {
                    resolve(data.secure_url);
                } else {
                    console.error("Cloudinary upload failed:", data.error);
                    reject(new Error(data.error?.message || "Gagal mengunggah video ke Cloudinary."));
                }
            } else {
                console.error("Cloudinary upload XHR error:", xhr.status, xhr.responseText);
                reject(new Error(`Gagal mengunggah video: ${xhr.status} ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            console.error("Network error during Cloudinary upload.");
            reject(new Error("Terjadi kesalahan jaringan saat mengunggah video."));
        });

        xhr.send(formData);
    });
}


// --- Display Posts from Firestore (for Home Page) ---
if (contentContainer) {
    db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => { // Order by creation date initially
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

/**
 * Memuat postingan untuk halaman explore, diurutkan berdasarkan votes.
 * @param {string} searchTerm - Kata kunci pencarian opsional.
 */
async function loadExplorePosts(searchTerm = '') {
    if (!exploreContentContainer) return;

    explorePostsLoaded = false;

    showLoading();
    try {
        const snapshot = await db.collection("posts").orderBy("votes", "desc").orderBy("createdAt", "desc").get(); // Order by votes
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

/**
 * Merender postingan di halaman explore berdasarkan filter.
 * @param {Array<Object>} posts - Array objek postingan.
 * @param {string} searchTerm - Kata kunci pencarian.
 */
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

/**
 * Memfilter postingan yang terlihat di halaman beranda berdasarkan kata kunci pencarian.
 * @param {string} searchTerm - Kata kunci pencarian.
 */
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

// --- Video Autoplay/Pause on Scroll Logic (for Home/Explore feed) ---
/**
 * Mengatur Intersection Observer untuk autoplay/pause video di feed utama.
 */
function setupVideoObservers() {
    const videoElements = document.querySelectorAll('.post-card video');

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
        video.setAttribute('controls', 'true'); // Keep controls, but rely on CSS to hide them if desired
        videoObserver.observe(video);
    });
}


// --- Dynamic Post Card Creation (Reusable for Home, Explore, Group Posts) ---
/**
 * Membuat elemen kartu postingan untuk ditampilkan di feed.
 * @param {Object} post - Objek data postingan dari Firestore.
 * @param {string} postId - ID dokumen postingan.
 * @param {boolean} isGroupPost - True jika postingan adalah bagian dari grup.
 * @param {string} [groupId=null] - ID grup jika itu adalah postingan grup.
 * @returns {HTMLElement} Elemen div kartu postingan.
 */
function createPostCard(post, postId, isGroupPost = false, groupId = null) {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');
    postCard.dataset.postId = postId;

    let mediaContent = '';
    if (post.url) {
        if (post.type === "image") {
            mediaContent = `<img src="${post.url}" alt="${post.title || 'Post Image'}">`;
        } else if (post.type === "video") {
            // For video posts in general feed, provide a click handler to open the full video view
            mediaContent = `
                <div class="video-player-container" onclick="openVideoView('${postId}')">
                    <video preload="metadata" src="${post.url}#t=1" controls></video>
                    <div class="video-thumbnail-overlay">
                        <i class="fas fa-play play-icon-overlay"></i>
                    </div>
                </div>
            `;
        }
    }

    const postText = post.description || '';
    const timestamp = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : 'Baru saja';
    const hashtagsHtml = post.hashtags && post.hashtags.length > 0
        ? `<div class="hashtags">${post.hashtags.map(tag => `<span>${tag}</span>`).join(' ')}</div>`
        : '';

    const userVotedUp = post.votedBy && post.votedBy[currentUserId] === 'up';
    const userVotedDown = post.votedBy && post.votedBy[currentUserId] === 'down';

    postCard.innerHTML = `
        ${post.title ? `<h3>${post.title}</h3>` : ''}
        ${mediaContent}
        <p>${postText.replace(/\n/g, '<br>')}</p>
        ${hashtagsHtml}
        <small>Diposting oleh: ${post.userId ? post.userId.substring(0, 8) : 'Anonim'}... pada ${timestamp}</small>
        <div class="vote-buttons">
            <button onclick="handleVote('${postId}', 'up', ${isGroupPost}, '${groupId || ''}')" class="${userVotedUp ? 'voted' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.093l-8 8H7v8h10v-8h3z"/>
                </svg>
                Upvote (${post.votes || 0})
            </button>
            <button onclick="handleVote('${postId}', 'down', ${isGroupPost}, '${groupId || ''}')" class="${userVotedDown ? 'voted' : ''}">
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
                <button onclick="addComment('${postId}', 'commentInput-${postId}', ${isGroupPost}, '${groupId || ''}')">Kirim</button>
            </div>
            <div class="comment-list" id="commentList-${postId}"></div>
        </div>
    `;
    return postCard;
}

// --- Voting Logic for Posts (Modified for Group Posts) ---
/**
 * Menangani vote (upvote/downvote) untuk postingan.
 * @param {string} postId - ID postingan.
 * @param {'up'|'down'} type - Tipe vote.
 * @param {boolean} isGroupPost - True jika postingan adalah bagian dari grup.
 * @param {string} [groupId=null] - ID grup jika itu adalah postingan grup.
 */
window.handleVote = async function(postId, type, isGroupPost = false, groupId = null) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk vote post.", true);
        return;
    }

    const postRef = isGroupPost && groupId ?
        db.collection("groups").doc(groupId).collection("posts").doc(postId) :
        db.collection("posts").doc(postId);

    try {
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) {
                throw "Post tidak ditemukan!";
            }

            let currentVotes = postDoc.data().votes || 0;
            let votedBy = postDoc.data().votedBy || {}; // {userId: 'up'/'down'}

            const userCurrentVote = votedBy[currentUserId];

            if (type === 'up') {
                if (userCurrentVote === 'up') {
                    // User already upvoted, remove vote
                    currentVotes--;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'down') {
                    // User downvoted, change to upvote (undo down, add up)
                    currentVotes += 2;
                    votedBy[currentUserId] = 'up';
                } else {
                    // No previous vote, add upvote
                    currentVotes++;
                    votedBy[currentUserId] = 'up';
                }
            } else if (type === 'down') {
                if (userCurrentVote === 'down') {
                    // User already downvoted, remove vote
                    currentVotes++;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'up') {
                    // User upvoted, change to downvote (undo up, add down)
                    currentVotes -= 2;
                    votedBy[currentUserId] = 'down';
                } else {
                    // No previous vote, add downvote
                    currentVotes--;
                    votedBy[currentUserId] = 'down';
                }
            }

            transaction.update(postRef, { votes: currentVotes, votedBy: votedBy });
        });
        console.log(`Vote for post ${postId} processed!`);
    } catch (error) {
        console.error("Error during post voting:", error);
        showMessage(errorMessageElement, `Gagal vote post: ${error.message}`, true);
    }
};

// --- Dedicated Video Post View Page Logic (Reels) ---
/**
 * Membuka halaman tampilan video (reels) dan memulai dari postingan tertentu jika disediakan.
 * @param {string} [initialPostId=null] - ID postingan video yang akan dimulai.
 */
window.openVideoView = async function(initialPostId = null) {
    showLoading();
    try {
        // Ensure allVideoPosts is populated
        if (allVideoPosts.length === 0) {
            const snapshot = await db.collection("posts").where("type", "==", "video").orderBy("votes", "desc").orderBy("createdAt", "desc").get();
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
                videoFeedItem.classList.add('video-reel-item');
                videoFeedItem.dataset.postId = videoPost.id;

                const timestamp = videoPost.createdAt ? new Date(videoPost.createdAt.toDate()).toLocaleString() : 'Baru saja';
                const hashtagsHtml = videoPost.hashtags && videoPost.hashtags.length > 0
                    ? `<div class="reel-hashtags">${videoPost.hashtags.map(tag => `<span>${tag}</span>`).join(' ')}</div>`
                    : '';

                const userVotedUp = videoPost.votedBy && videoPost.votedBy[currentUserId] === 'up';
                const userVotedDown = videoPost.votedBy && videoPost.votedBy[currentUserId] === 'down';

                // Initial comment count (will be updated by renderComments listener)
                const commentCount = videoPost.comments ? videoPost.comments.length : 0;


                videoFeedItem.innerHTML = `
                    <video class="reel-video" preload="auto" src="${videoPost.url}" controlslist="nodownload nofullscreen" loop playsinline></video>
                    <div class="reel-overlay">
                        <div class="play-pause-icon">
                            <i class="fas fa-play"></i> </div>
                        <div class="video-info">
                            <h3 class="reel-title">${videoPost.title || 'Untitled Video'}</h3>
                            <p class="reel-description">${videoPost.description || ''}</p>
                            ${hashtagsHtml}
                        </div>
                    </div>
                    <div class="reel-actions">
                        <button class="upvote-button ${userVotedUp ? 'voted' : ''}" onclick="handleVote('${videoPost.id}', 'up')">
                            <i class="fas fa-arrow-up"></i> <span class="upvote-count">${videoPost.votes || 0}</span>
                        </button>
                        <button class="downvote-button ${userVotedDown ? 'voted' : ''}" onclick="handleVote('${videoPost.id}', 'down')">
                            <i class="fas fa-arrow-down"></i> <span class="downvote-count"></span>
                        </button>
                        <button class="comment-button" onclick="scrollToComments('${videoPost.id}')">
                            <i class="fas fa-comment"></i> <span class="comment-count">${commentCount}</span>
                        </button>
                    </div>
                    <div class="comments-section">
                        <h3>Komentar</h3>
                        <div class="comment-input-bar">
                            <input type="text" id="reelCommentInput-${videoPost.id}" placeholder="Tambahkan komentar..."/>
                            <button onclick="addComment('${videoPost.id}', 'reelCommentInput-${videoPost.id}')">Kirim</button>
                        </div>
                        <div class="comment-list" id="reelCommentList-${videoPost.id}">
                            <p class="no-comments">Memuat komentar...</p>
                        </div>
                    </div>
                `;
                videoFeedContainer.appendChild(videoFeedItem);
                renderComments(videoPost.id, `reelCommentList-${videoPost.id}`); // Render comments for reels
            });

            // Scroll to the initial video
            const initialVideoElement = videoFeedContainer.querySelector(`[data-post-id="${allVideoPosts[startIndex].id}"]`);
            if (initialVideoElement) {
                initialVideoElement.scrollIntoView({ behavior: 'instant', block: 'center' }); // Use 'instant' for immediate scroll
            }
        }

        setupVideoFeedObserver(); // Set up intersection observer for the video feed
        await showPage('videoViewPage'); // Show the video view page

    } catch (error) {
        console.error("Error opening video view:", error);
        showMessage(errorMessageElement, `Gagal membuka tampilan video: ${error.message}`, true);
    } finally {
        hideLoading();
    }
};

/**
 * Menggulir tampilan ke bagian komentar postingan video di halaman reels.
 * @param {string} postId - ID postingan video.
 */
window.scrollToComments = function(postId) {
    const videoItem = videoFeedContainer.querySelector(`[data-post-id="${postId}"]`);
    if (videoItem) {
        const commentsSection = videoItem.querySelector('.comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

/**
 * Mengatur Intersection Observer untuk autoplay/pause video di feed reels.
 */
function setupVideoFeedObserver() {
    const videoFeedItems = document.querySelectorAll('#reelsContainer .video-reel-item');

    const observerOptions = {
        root: videoFeedContainer, // Observe relative to the videoFeedContainer
        rootMargin: '0px',
        threshold: 0.75 // A video is considered "in view" if 75% is visible
    };

    const feedObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            const playPauseIcon = entry.target.querySelector('.play-pause-icon');

            if (entry.isIntersecting) {
                // Pause any previously playing video in this feed
                if (currentVideoPlayingInFeed && currentVideoPlayingInFeed !== video) {
                    currentVideoPlayingInFeed.pause();
                    currentVideoPlayingInFeed.currentTime = 0; // Reset
                    const prevPlayPauseIcon = currentVideoPlayingInFeed.closest('.video-reel-item')?.querySelector('.play-pause-icon');
                    if (prevPlayPauseIcon) prevPlayPauseIcon.innerHTML = '<i class="fas fa-play"></i>';
                }

                // Attempt to play the current video (unmuted)
                video.muted = false;
                video.play().then(() => {
                    currentVideoPlayingInFeed = video;
                    if (playPauseIcon) playPauseIcon.innerHTML = '<i class="fas fa-pause"></i>';
                }).catch(error => {
                    console.warn("Autoplay (unmuted) prevented in feed:", error);
                    video.muted = true; // Fallback to muted autoplay
                    video.play().catch(e => console.warn("Muted autoplay also prevented in feed:", e));
                    currentVideoPlayingInFeed = video;
                    if (playPauseIcon) playPauseIcon.innerHTML = '<i class="fas fa-pause"></i>';
                });
            } else {
                // Pause video when it goes out of view
                video.pause();
                video.currentTime = 0; // Reset video to start
                if (currentVideoPlayingInFeed === video) {
                    currentVideoPlayingInFeed = null;
                }
                if (playPauseIcon) playPauseIcon.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    }, observerOptions);

    videoFeedItems.forEach(item => {
        const video = item.querySelector('video');
        video.setAttribute('preload', 'auto'); // Ensure videos are preloaded aggressively
        feedObserver.observe(item);

        // Add click listener for play/pause icon overlay
        const playPauseIcon = item.querySelector('.play-pause-icon');
        if (playPauseIcon) {
            playPauseIcon.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    playPauseIcon.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    playPauseIcon.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
        }
    });
}


// --- Comment Logic ---
/**
 * Menambahkan komentar ke postingan.
 * @param {string} postId - ID postingan.
 * @param {string} inputElementId - ID elemen input komentar.
 * @param {boolean} isGroupPost - True jika postingan adalah bagian dari grup.
 * @param {string} [groupId=null] - ID grup jika itu adalah postingan grup.
 */
window.addComment = async function(postId, inputElementId = null, isGroupPost = false, groupId = null) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk berkomentar.", true);
        return;
    }
    const commentInput = document.getElementById(inputElementId || `commentInput-${postId}`);
    const commentText = commentInput.value.trim();

    if (!commentText) {
        showMessage(errorMessageElement, "Komentar tidak boleh kosong!", true);
        return;
    }

    let postRef;
    if (isGroupPost && groupId) {
        postRef = db.collection("groups").doc(groupId).collection("posts").doc(postId);
    } else {
        postRef = db.collection("posts").doc(postId);
    }

    try {
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
                votedBy: {}, // Initialize votedBy for comments
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

/**
 * Merender komentar untuk postingan tertentu dan mengatur listener real-time.
 * @param {string} postId - ID postingan.
 * @param {string} [commentListId=null] - ID elemen div daftar komentar.
 * @param {boolean} isGroupPost - True jika postingan adalah bagian dari grup.
 * @param {string} [groupId=null] - ID grup jika itu adalah postingan grup.
 */
function renderComments(postId, commentListId = null, isGroupPost = false, groupId = null) {
    const targetListId = commentListId || `commentList-${postId}`;
    const commentListDiv = document.getElementById(targetListId);
    if (!commentListDiv) {
        console.warn(`commentListDiv for postId ${postId} and ID ${targetListId} not found.`);
        return;
    }

    // Ensure we only have one listener per comment list
    if (commentUnsubscribers[targetListId]) {
        commentUnsubscribers[targetListId]();
        delete commentUnsubscribers[targetListId];
    }

    let postRef;
    if (isGroupPost && groupId) {
        postRef = db.collection("groups").doc(groupId).collection("posts").doc(postId);
    } else {
        postRef = db.collection("posts").doc(postId);
    }

    const unsubscribe = postRef.onSnapshot((doc) => {
        if (doc.exists) {
            const post = doc.data();
            const comments = post.comments || [];
            commentListDiv.innerHTML = '';

            // Update comment count on parent card if available
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            if (postCard) {
                const commentCountSpan = postCard.querySelector('.comment-count');
                if (commentCountSpan) {
                    commentCountSpan.innerText = comments.length;
                }
            }


            if (comments.length === 0) {
                commentListDiv.innerHTML = '<p class="no-comments">Belum ada komentar.</p>';
                return;
            }

            // Sort comments by votes, then by creation time
            comments.sort((a, b) => {
                const votesA = a.votes || 0;
                const votesB = b.votes || 0;
                if (votesA !== votesB) {
                    return votesB - votesA; // Descending by votes
                }
                const timeA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : 0;
                const timeB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : 0;
                return timeB - timeA; // Descending by time
            });

            comments.forEach((comment) => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                const timestamp = comment.createdAt && typeof comment.createdAt.toDate === 'function' ? new Date(comment.createdAt.toDate()).toLocaleString() : 'Baru saja';
                // Use a combination of timestamp and userId for a more unique identifier if multiple comments happen at the same ms
                // Note: This relies on `createdAt` having toMillis() if it's a Timestamp. Firestore.FieldValue.serverTimestamp() creates a Timestamp.
                const commentUniqueId = `${comment.createdAt.toMillis()}-${comment.userId}`;

                const userVotedUp = comment.votedBy && comment.votedBy[currentUserId] === 'up';
                const userVotedDown = comment.votedBy && comment.votedBy[currentUserId] === 'down';

                commentDiv.innerHTML = `
                    <div class="comment-content">
                        <p><strong>${comment.userId ? comment.userId.substring(0, 8) : 'Anonim'}...</strong>: ${comment.text}</p>
                        <small>${timestamp}</small>
                    </div>
                    <div class="comment-votes">
                        <button onclick="handleCommentVote('${postId}', '${commentUniqueId}', 'up', ${isGroupPost}, '${groupId || ''}')" class="${userVotedUp ? 'voted' : ''}">▲</button>
                        <span>${comment.votes || 0}</span>
                        <button onclick="handleCommentVote('${postId}', '${commentUniqueId}', 'down', ${isGroupPost}, '${groupId || ''}')" class="${userVotedDown ? 'voted' : ''}">▼</button>
                    </div>
                `;
                commentListDiv.appendChild(commentDiv);
            });
        }
    }, (error) => {
        console.error(`Error fetching comments for post ${postId}:`, error);
    });

    commentUnsubscribers[targetListId] = unsubscribe;
}

/**
 * Membersihkan semua listener komentar yang aktif.
 */
function cleanupCommentListeners() {
    for (const key in commentUnsubscribers) {
        if (commentUnsubscribers.hasOwnProperty(key)) {
            commentUnsubscribers[key]();
            delete commentUnsubscribers[key];
        }
    }
}

/**
 * Menangani vote (upvote/downvote) untuk komentar.
 * @param {string} postId - ID postingan tempat komentar berada.
 * @param {string} commentIdentifier - Kombinasi timestamp dan userId untuk mengidentifikasi komentar unik.
 * @param {'up'|'down'} type - Tipe vote.
 * @param {boolean} isGroupPost - True jika postingan adalah bagian dari grup.
 * @param {string} [groupId=null] - ID grup jika itu adalah postingan grup.
 */
window.handleCommentVote = async function(postId, commentIdentifier, type, isGroupPost = false, groupId = null) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk vote komentar.", true);
        return;
    }

    const [commentTimestampStr, commentUserId] = commentIdentifier.split('-');
    const commentTimestamp = parseInt(commentTimestampStr);

    let postRef;
    if (isGroupPost && groupId) {
        postRef = db.collection("groups").doc(groupId).collection("posts").doc(postId);
    } else {
        postRef = db.collection("posts").doc(postId);
    }

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
            let votedBy = commentToUpdate.votedBy || {};

            const userCurrentVote = votedBy[currentUserId];

            if (type === 'up') {
                if (userCurrentVote === 'up') {
                    newCommentVotes--;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'down') {
                    newCommentVotes += 2;
                    votedBy[currentUserId] = 'up';
                } else {
                    newCommentVotes++;
                    votedBy[currentUserId] = 'up';
                }
            } else if (type === 'down') {
                if (userCurrentVote === 'down') {
                    newCommentVotes++;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'up') {
                    newCommentVotes -= 2;
                    votedBy[currentUserId] = 'down';
                } else {
                    newCommentVotes--;
                    votedBy[currentUserId] = 'down';
                }
            }

            commentToUpdate.votes = newCommentVotes;
            commentToUpdate.votedBy = votedBy;
            comments[foundIndex] = commentToUpdate;

            transaction.update(postRef, { comments: comments });
        });
        console.log("Vote komentar berhasil!");
    } catch (error) {
        console.error("Error saat voting komentar:", error);
        showMessage(errorMessageElement, `Gagal vote komentar: ${error.message}`, true);
    }
}

// --- Donation & Info Page Functions ---
/**
 * Mensimulasikan donasi "traktir kopi".
 */
window.traktirNgopi = function() {
    const amountInput = document.getElementById('coffeeCustomAmount');
    let amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < 10000) {
        showMessage(errorMessageElement, "Jumlah donasi kopi minimal Rp 10.000!", true);
        return;
    }

    showMessage(authStatusElement, `Terima kasih! Anda mentraktir kopi sebesar Rp ${amount.toLocaleString('id-ID')} (simulasi).`);
    // TODO: Integrate with a real payment gateway (e.g., Midtrans, Xendit, Stripe, PayPal)
    console.log(`Simulating coffee donation of Rp ${amount}`);
    amountInput.value = '';
};

/**
 * Mensimulasikan donasi kustom.
 */
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

    amountInput.value = '';
    donorNameInput.value = '';
    donorMessageInput.value = '';
};


// --- Dark Mode Toggle ---
const localStorageKey = 'darkModeEnabled';

/**
 * Mengatur mode gelap pada aplikasi.
 * @param {boolean} isEnabled - True untuk mengaktifkan mode gelap, false untuk menonaktifkan.
 */
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

// --- NEW GROUP LOGIC ---

/**
 * Mengatur ulang form pembuatan grup.
 */
function resetCreateGroupForm() {
    if (groupNameInput) groupNameInput.value = '';
    if (groupDescriptionInput) groupDescriptionInput.value = '';
    if (groupCategoryInput) groupCategoryInput.value = '';
    if (groupBannerInput) groupBannerInput.value = '';
    selectedGroupBannerFile = null;
    if (groupBannerPreview) groupBannerPreview.style.display = 'none';
    if (groupBannerPreview) groupBannerPreview.src = '';
    const previewAreaElement = groupBannerInput.closest('.form-group')?.querySelector('.preview-area');
    const placeholderSpan = previewAreaElement ? previewAreaElement.querySelector('span') : null;
    if (placeholderSpan) placeholderSpan.style.display = 'block';
    if (createGroupSubmitBtn) createGroupSubmitBtn.disabled = true;
}

// Handle Group Banner File Selection (for create group page)
if (groupBannerInput) {
    groupBannerInput.addEventListener('change', (e) => {
        selectedGroupBannerFile = e.target.files[0];
        const previewAreaElement = groupBannerInput.closest('.form-group')?.querySelector('.preview-area');
        const placeholderSpan = previewAreaElement ? previewAreaElement.querySelector('span') : null;

        if (selectedGroupBannerFile) {
            const fileType = selectedGroupBannerFile.type;
            if (fileType.startsWith('image/')) {
                if (placeholderSpan) placeholderSpan.style.display = 'none';
                if (groupBannerPreview) {
                    groupBannerPreview.src = URL.createObjectURL(selectedGroupBannerFile);
                    groupBannerPreview.style.display = 'block';
                }
                checkCreateGroupFormValidity(); // Check validity after file selection
            } else {
                showMessage(errorMessageElement, "Hanya gambar yang diizinkan untuk banner grup.", true);
                selectedGroupBannerFile = null;
                if (groupBannerPreview) groupBannerPreview.style.display = 'none';
                if (placeholderSpan) placeholderSpan.style.display = 'block';
                checkCreateGroupFormValidity(); // Re-check validity (should disable button)
            }
        } else {
            // If no file selected (e.g., user opens and cancels)
            if (groupBannerPreview) groupBannerPreview.style.display = 'none';
            if (placeholderSpan) placeholderSpan.style.display = 'block';
            checkCreateGroupFormValidity(); // Re-check validity (should disable button)
        }
    });
}

/**
 * Memeriksa validitas form pembuatan grup untuk mengaktifkan/menonaktifkan tombol submit.
 */
function checkCreateGroupFormValidity() {
    const nameValid = groupNameInput && groupNameInput.value.trim() !== '';
    const descValid = groupDescriptionInput && groupDescriptionInput.value.trim() !== '';
    const categoryValid = groupCategoryInput && groupCategoryInput.value.trim() !== '';
    const bannerValid = selectedGroupBannerFile !== null;

    if (createGroupSubmitBtn) {
        createGroupSubmitBtn.disabled = !(nameValid && descValid && categoryValid && bannerValid);
    }
}

// Attach listeners for input changes to enable/disable button
if (groupNameInput) groupNameInput.addEventListener('input', checkCreateGroupFormValidity);
if (groupDescriptionInput) groupDescriptionInput.addEventListener('input', checkCreateGroupFormValidity);
if (groupCategoryInput) groupCategoryInput.addEventListener('change', checkCreateGroupFormValidity);


// Handle Create Group Submission
if (createGroupForm) {
    createGroupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = groupNameInput ? groupNameInput.value.trim() : '';
        const description = groupDescriptionInput ? groupDescriptionInput.value.trim() : '';
        const category = groupCategoryInput ? groupCategoryInput.value.trim() : '';

        if (!name || !description || !category) {
            showMessage(errorMessageElement, "Nama, deskripsi, dan kategori grup tidak boleh kosong!", true);
            return;
        }
        if (!selectedGroupBannerFile) {
            showMessage(errorMessageElement, "Anda harus memilih banner untuk grup!", true);
            return;
        }
        if (!currentUserId) {
             showMessage(errorMessageElement, "Anda harus terautentikasi untuk membuat grup.", true);
            return;
        }

        showLoading();
        let bannerUrl = null;

        try {
            bannerUrl = await uploadToImgBB(selectedGroupBannerFile);
            if (!bannerUrl) throw new Error("Gagal mengunggah banner grup ke ImgBB.");

            const groupData = {
                name: name,
                description: description,
                category: category,
                bannerUrl: bannerUrl,
                ownerId: currentUserId,
                members: [currentUserId], // Owner is automatically a member
                memberCount: 1,
                votes: 0, // Initial votes for group (for retention)
                votedBy: {}, // Who voted for the group
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                // Initial duration for group survival (24 hours from creation)
                expiresAt: firebase.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
            };

            await db.collection("groups").add(groupData);
            showMessage(authStatusElement, "Grup berhasil dibuat!");
            resetCreateGroupForm();
            await showPage('groupsPage'); // Navigate back to the groups list

        } catch (error) {
            console.error("Error saat membuat grup:", error);
            showMessage(errorMessageElement, `Gagal membuat grup: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });
}

// Load Groups Content (main groups page)
/**
 * Memuat dan menampilkan daftar grup utama.
 */
async function loadGroupsContent() {
    if (!groupList) return;

    showLoading();
    try {
        const categoriesContainer = groupsPage.querySelector('.group-categories');
        const searchInput = groupsPage.querySelector('.explore-search input');
        let currentCategory = 'all';
        let currentSearchTerm = '';

        // Only add listeners once
        if (categoriesContainer && !categoriesContainer.dataset.listenersAdded) {
            categoriesContainer.addEventListener('click', (e) => {
                const targetButton = e.target.closest('.category-tag');
                if (targetButton) {
                    categoriesContainer.querySelectorAll('.category-tag').forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                    currentCategory = targetButton.dataset.category;
                    renderGroups(currentCategory, currentSearchTerm);
                }
            });
            categoriesContainer.dataset.listenersAdded = 'true'; // Mark as listeners added
        }


        if (searchInput && !searchInput.dataset.listenersAdded) {
            const searchButton = searchInput.nextElementSibling;
            searchButton.addEventListener('click', () => {
                currentSearchTerm = searchInput.value.trim().toLowerCase();
                renderGroups(currentCategory, currentSearchTerm);
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    currentSearchTerm = searchInput.value.trim().toLowerCase();
                    renderGroups(currentCategory, currentSearchTerm);
                }
            });
            searchInput.dataset.listenersAdded = 'true'; // Mark as listeners added
        }


        const snapshot = await db.collection("groups").orderBy("createdAt", "desc").get();
        const allGroups = [];
        snapshot.forEach(doc => {
            allGroups.push({ id: doc.id, ...doc.data() });
        });

        window.allAvailableGroups = allGroups; // Store globally for filtering

        renderGroups(currentCategory, currentSearchTerm);

    } catch (error) {
        console.error("Error loading groups:", error);
        showMessage(errorMessageElement, `Gagal memuat daftar grup: ${error.message}`, true);
        if (groupList) groupList.innerHTML = '<p class="error-message">Gagal memuat grup.</p>';
    } finally {
        hideLoading();
    }
}

/**
 * Merender daftar grup berdasarkan kategori dan kata kunci pencarian.
 * @param {string} category - Kategori grup yang akan ditampilkan ('all' atau nama kategori).
 * @param {string} searchTerm - Kata kunci pencarian grup.
 */
function renderGroups(category = 'all', searchTerm = '') {
    if (!groupList || !window.allAvailableGroups) return;

    groupList.innerHTML = '';
    const noGroupsMessage = '<p class="no-groups-message">Belum ada grup yang dibuat. Ayo jadi yang pertama!</p>';
    let filteredGroups = window.allAvailableGroups;

    if (category !== 'all') {
        filteredGroups = filteredGroups.filter(group => group.category === category);
    }

    if (searchTerm) {
        filteredGroups = filteredGroups.filter(group =>
            group.name.toLowerCase().includes(searchTerm) ||
            group.description.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredGroups.length === 0) {
        groupList.innerHTML = noGroupsMessage;
        return;
    }

    filteredGroups.forEach(group => {
        const isMember = group.members && group.members.includes(currentUserId);
        groupList.appendChild(createGroupCard(group, group.id, isMember ? 'your' : 'popular'));
    });
}


/**
 * Membuat elemen kartu grup untuk daftar grup.
 * @param {Object} group - Objek data grup dari Firestore.
 * @param {string} groupId - ID dokumen grup.
 * @returns {HTMLElement} Elemen div kartu grup.
 */
function createGroupCard(group, groupId) {
    const groupCard = document.createElement('div');
    groupCard.classList.add('group-item');
    groupCard.dataset.groupId = groupId;

    const memberCount = group.memberCount || 0;

    let actionButton = '';
    const isMember = group.members && group.members.includes(currentUserId);

    if (isMember) {
         actionButton = `
            <button class="view-group-button" onclick="viewGroupDetail('${groupId}')">Lihat Grup</button>
        `;
    } else {
        actionButton = `
            <button class="join-group-button" onclick="toggleGroupMembership('${groupId}', 'join')">Gabung Grup</button>
        `;
    }

    groupCard.innerHTML = `
        <img src="${group.bannerUrl || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Group+Banner'}" alt="Group Banner" class="group-item-banner">
        <div class="group-item-info">
            <h4>${group.name}</h4>
            <p>${group.description}</p>
            <div class="group-meta">
                <span><i class="fas fa-users"></i> ${memberCount} Anggota</span>
                <span>Kategori: ${group.category}</span>
            </div>
        </div>
        ${actionButton}
    `;

    return groupCard;
}


/**
 * Menggabungkan atau meninggalkan grup.
 * @param {string} groupId - ID grup.
 * @param {'join'|'leave'} action - Aksi yang akan dilakukan.
 */
window.toggleGroupMembership = async function(groupId, action) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk bergabung atau keluar dari grup.", true);
        return;
    }

    const groupRef = db.collection("groups").doc(groupId);
    showLoading();

    try {
        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists) {
                throw "Grup tidak ditemukan!";
            }

            let members = groupDoc.data().members || [];
            let memberCount = groupDoc.data().memberCount || 0;

            if (action === 'join') {
                if (!members.includes(currentUserId)) {
                    members.push(currentUserId);
                    memberCount++;
                    showMessage(authStatusElement, "Berhasil bergabung dengan grup!");
                } else {
                    showMessage(errorMessageElement, "Anda sudah menjadi anggota grup ini.", true);
                }
            } else if (action === 'leave') {
                if (members.includes(currentUserId)) {
                    // Prevent owner from leaving their own group unless it's deleted
                    if (groupDoc.data().ownerId === currentUserId) {
                        showMessage(errorMessageElement, "Anda tidak bisa keluar dari grup yang Anda buat. Silahkan hapus grup jika ingin.", true);
                        hideLoading();
                        return Promise.reject("Owner cannot leave their own group.");
                    }

                    members = members.filter(id => id !== currentUserId);
                    memberCount--;
                    showMessage(authStatusElement, "Berhasil keluar dari grup!");
                } else {
                    showMessage(errorMessageElement, "Anda bukan anggota grup ini.", true);
                }
            }
            transaction.update(groupRef, { members: members, memberCount: memberCount });
        });
        await loadGroupsContent(); // Reload the groups content to update UI after join/leave
    } catch (error) {
        console.error(`Error ${action}ing group:`, error);
        if (error !== "Owner cannot leave their own group.") {
             showMessage(errorMessageElement, `Gagal ${action === 'join' ? 'bergabung' : 'keluar'} grup: ${error.message || error}`, true);
        }
    } finally {
        hideLoading();
    }
};

// --- View Group Detail Logic ---
/**
 * Menampilkan halaman detail grup.
 * @param {string} groupId - ID grup yang akan ditampilkan.
 */
window.viewGroupDetail = function(groupId) {
    showPage('groupDetailPage', null, groupId); // Pass groupId to showPage to load detail data
};

/**
 * Memuat detail grup dan postingan-postingan di dalamnya.
 * @param {string} groupId - ID grup yang akan dimuat.
 */
async function loadGroupDetail(groupId) {
    if (!groupDetailPage || !detailGroupBanner || !detailGroupName || !detailGroupDescription || !groupPostList) {
        console.error("Group detail page elements not found.");
        return;
    }
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk melihat detail grup.", true);
        showPage('groupsPage');
        return;
    }

    showLoading();

    groupPostList.innerHTML = '<p class="no-posts-message">Memuat postingan grup...</p>';

    // Cleanup previous group detail listener if any
    if (groupUnsubscribers[groupId]) {
        groupUnsubscribers[groupId]();
        delete groupUnsubscribers[groupId];
    }
    cleanupCommentListeners(); // Also cleanup comments from other pages

    const groupRef = db.collection("groups").doc(groupId);
    const unsubscribeGroup = groupRef.onSnapshot(async (doc) => {
        if (!doc.exists) {
            showMessage(errorMessageElement, "Grup tidak ditemukan atau telah dihapus.", true);
            showPage('groupsPage');
            return;
        }

        const groupData = doc.data();
        if (!(groupData.members && groupData.members.includes(currentUserId))) {
            showMessage(errorMessageElement, "Anda harus bergabung dengan grup ini untuk melihat isinya.", true);
            showPage('groupsPage');
            return;
        }

        detailGroupBanner.src = groupData.bannerUrl || 'https://via.placeholder.com/800x200/CCCCCC/FFFFFF?text=Group+Banner';
        detailGroupName.innerText = groupData.name;
        detailGroupDescription.innerText = groupData.description;

        // Group Vote and Timer logic
        const votes = groupData.votes || 0;
        const votedBy = groupData.votedBy || {};
        const userVotedUp = votedBy[currentUserId] === 'up';
        const userVotedDown = votedBy[currentUserId] === 'down';

        if (voteUpButton) {
            voteUpButton.classList.toggle('voted', userVotedUp);
            voteUpButton.innerHTML = `<i class="fas fa-thumbs-up"></i> Vote Up (${votes})`;
            voteUpButton.onclick = () => handleGroupVote(groupId, 'up');
        }
        if (voteDownButton) {
            voteDownButton.classList.toggle('voted', userVotedDown);
            voteDownButton.innerHTML = `<i class="fas fa-thumbs-down"></i> Vote Down`;
            voteDownButton.onclick = () => handleGroupVote(groupId, 'down');
        }

        // Update timer
        const expiresAtMillis = groupData.expiresAt ? groupData.expiresAt.toMillis() : 0;
        clearInterval(groupVoteTimers[groupId]); // Clear any existing timer for this group
        if (expiresAtMillis > Date.now()) {
            groupVoteTimers[groupId] = setInterval(() => {
                const timeLeft = expiresAtMillis - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(groupVoteTimers[groupId]);
                    detailGroupTimer.innerText = "Waktu habis! Grup akan dihapus jika vote down lebih banyak.";
                    // TODO: Logic to delete group if votes are low after timer
                } else {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    detailGroupTimer.innerText = `Waktu Tersisa: ${hours} jam ${minutes} menit`;
                }
            }, 1000);
        } else {
            detailGroupTimer.innerText = "Waktu habis! Grup akan dihapus jika vote down lebih banyak.";
            // TODO: Logic to delete group if votes are low after timer
        }


        // Load group posts
        const groupPostsSnapshot = await groupRef.collection("posts").orderBy("createdAt", "desc").get();
        groupPostList.innerHTML = ''; // Clear previous content

        if (groupPostsSnapshot.empty) {
            groupPostList.innerHTML = '<p class="no-posts-message">Belum ada postingan di grup ini.</p>';
        } else {
            groupPostsSnapshot.forEach(postDoc => {
                const post = postDoc.data();
                const postId = postDoc.id;
                groupPostList.appendChild(createPostCard(post, postId, true, groupId)); // Pass isGroupPost and groupId
                renderComments(postId, null, true, groupId); // Render comments for group posts
            });
        }
        hideLoading();
    }, (error) => {
        console.error("Error fetching group detail:", error);
        showMessage(errorMessageElement, `Gagal memuat detail grup: ${error.message}`, true);
        hideLoading();
        showPage('groupsPage'); // Go back to groups list on error
    });
    groupUnsubscribers[groupId] = unsubscribeGroup; // Store the unsubscribe function

    // Event listeners for creating posts within the group (if they exist in HTML)
    // Placeholder for opening the general upload modal from group detail
    if (openGroupPostModalPlaceholder) { // The "Apa yang Anda pikirkan?" text area
        openGroupPostModalPlaceholder.onclick = () => {
            openUploadModal('text'); // Assuming opening this means a text post
            postTypeHiddenInput.dataset.groupId = groupId; // Set context for group post
        };
    }
    if (openGroupPhotoUpload) openGroupPhotoUpload.onclick = () => {
        openUploadModal('image');
        postTypeHiddenInput.dataset.groupId = groupId;
    };
    if (openGroupVideoUpload) openGroupVideoUpload.onclick = () => {
        openUploadModal('video');
        postTypeHiddenInput.dataset.groupId = groupId;
    };
    // The "Posting" button for quick text posts (if implemented as a separate button)
    // Note: your HTML seems to combine 'post-input-area' with 'openGroupPostModal'.
    // If you add a separate "Posting" button for text directly from the group detail, attach listener here.
    // As per your HTML, openGroupPostModal is the trigger to open the modal.
}

/**
 * Menangani vote (upvote/downvote) untuk grup (untuk bertahan hidup).
 * @param {string} groupId - ID grup.
 * @param {'up'|'down'} type - Tipe vote.
 */
window.handleGroupVote = async function(groupId, type) {
    if (!currentUserId) {
        showMessage(errorMessageElement, "Anda harus terautentikasi untuk vote grup.", true);
        return;
    }

    const groupRef = db.collection("groups").doc(groupId);

    try {
        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists) {
                throw "Grup tidak ditemukan!";
            }

            // Prevent owner from voting on their own group
            if (groupDoc.data().ownerId === currentUserId) {
                showMessage(errorMessageElement, "Pemilik grup tidak bisa vote grupnya sendiri.", true);
                return; // Exit transaction early
            }

            let currentVotes = groupDoc.data().votes || 0;
            let votedBy = groupDoc.data().votedBy || {}; // {userId: 'up'/'down'}

            const userCurrentVote = votedBy[currentUserId];

            if (type === 'up') {
                if (userCurrentVote === 'up') {
                    currentVotes--;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'down') {
                    currentVotes += 2; // Undo downvote, add upvote
                    votedBy[currentUserId] = 'up';
                } else {
                    currentVotes++;
                    votedBy[currentUserId] = 'up';
                }
            } else if (type === 'down') {
                if (userCurrentVote === 'down') {
                    currentVotes++;
                    delete votedBy[currentUserId];
                } else if (userCurrentVote === 'up') {
                    currentVotes -= 2; // Undo upvote, add downvote
                    votedBy[currentUserId] = 'down';
                } else {
                    currentVotes--;
                    votedBy[currentUserId] = 'down';
                }
            }
            transaction.update(groupRef, { votes: currentVotes, votedBy: votedBy });
        });
        console.log(`Vote for group ${groupId} processed!`);
        showMessage(authStatusElement, "Vote grup berhasil disimpan!");
    } catch (error) {
        console.error("Error during group voting:", error);
        showMessage(errorMessageElement, `Gagal vote grup: ${error.message}`, true);
    }
};

// Placeholder for Edit Group (implement this if needed)
window.editGroup = function(groupId) {
    showMessage(authStatusElement, `Mengedit grup ID: ${groupId} (Fitur ini perlu dikembangkan!)`);
    console.log(`Opening edit form for group: ${groupId}`);
};
