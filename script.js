// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
});

// Turnstile CAPTCHA callbacks

// Auto-bypass for local development
if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Local environment detected. Bypassing verification.');
        const verificationGate = document.getElementById('verification-gate');
        const mainContent = document.getElementById('main-content');
        if (verificationGate && mainContent) {
            verificationGate.style.display = 'none';
            mainContent.style.display = 'block';
            setTimeout(() => AOS.refresh(), 100);
        }
    });
}

function onTurnstileSuccess(token) {
    console.log('Turnstile verification successful');

    // Hide verification gate and show main content
    const verificationGate = document.getElementById('verification-gate');
    const mainContent = document.getElementById('main-content');

    // Add a brief success animation
    if (verificationGate) {
        verificationGate.style.opacity = '0';
        verificationGate.style.transition = 'opacity 0.5s ease-out';
    }

    setTimeout(() => {
        if (verificationGate) verificationGate.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';

        // Initialize AOS animations for the newly visible content
        AOS.refresh();
    }, 500);
}

function onTurnstileExpired() {
    console.log('Turnstile token expired');
    alert('Verification expired. Please try again.');
}

function onTurnstileError(error) {
    console.log('Turnstile error:', error);
    // Handle errors - could show a message or reload the widget
    alert('Verification failed. Please try again.');
}

// Navigation Logic
function initNavigation() {
    // 1. Create Hamburger Button
    const btn = document.createElement('button');
    btn.className = 'hamburger-btn';
    btn.innerHTML = '🍔';
    btn.setAttribute('aria-label', 'Menu');
    document.body.appendChild(btn);

    // 2. Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';

    // Determine active page for highlighting
    const path = window.location.pathname;
    const isPhotos = path.includes('photos.html');
    const isStory = path.includes('story.html');
    const isIndex = !isPhotos && !isStory; // simplistic check, works for index.html or root /

    overlay.innerHTML = `
        <ul class="nav-menu">
            <li><a href="index.html" class="nav-link ${isIndex ? 'active' : ''}">About Me</a></li>
            <!-- Hiding for now. Future agent: see .agent/workflows/publish-story.md to publish -->
            <!-- <li><a href="story.html" class="nav-link ${isStory ? 'active' : ''}">Now</a></li> -->
            <li><a href="photos.html" class="nav-link ${isPhotos ? 'active' : ''}">Adventures</a></li>
            <li><a href="https://linkedin.com/in/chayceoneal" target="_blank" class="nav-link">Contact</a></li>
        </ul>
    `;
    document.body.appendChild(overlay);

    // 3. Logic to toggle
    let isOpen = false;

    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            overlay.classList.add('open');
            btn.innerHTML = '❌';
        } else {
            overlay.classList.remove('open');
            btn.innerHTML = '🍔';
        }
    });

    // Close when clicking a link
    const links = overlay.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            overlay.classList.remove('open');
            btn.innerHTML = '🍔';
        });
    });
}

// Lightbox Logic
let currentPhotoIndex = 0;
let allPhotos = [];

function initLightbox() {
    // Inject Lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Photo viewer');
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous">❮</button>
        <img src="" alt="Enlarged photo" class="lightbox-image">
        <button class="lightbox-nav lightbox-next" aria-label="Next">❯</button>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // Close functionalities
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scroll
        setTimeout(() => {
            img.src = ''; // Clear src after fade out
        }, 300);
    };

    const changeImage = (direction) => {
        currentPhotoIndex = (currentPhotoIndex + direction + allPhotos.length) % allPhotos.length;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = allPhotos[currentPhotoIndex];
            img.style.opacity = '1';
        }, 150);
    };

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeImage(-1);
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeImage(1);
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);

        // Focus trap
        if (e.key === 'Tab') {
            const focusableElements = lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // Touch Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            changeImage(1); // Swipe left -> Next
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            changeImage(-1); // Swipe right -> Prev
        }
    }

    // Expose open function globally
    window.openLightbox = (index) => {
        currentPhotoIndex = index;
        img.src = allPhotos[currentPhotoIndex];
        img.style.opacity = '1';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock scroll
        closeBtn.focus(); // Focus the close button for accessibility
    };
}

// Gallery Logic
async function loadGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return; // Not on photos page

    // 1. Try Global Variable (generated by photos_data.js) - Works locally (file://)
    if (window.galleryPhotos && window.galleryPhotos.length > 0) {
        allPhotos = window.galleryPhotos;
        renderPhotos(allPhotos, galleryGrid);
        return;
    }

    // 2. Fallback to Fetch (JSON) - Good for production/server environment
    try {
        const response = await fetch('photos.json');
        if (response.ok) {
            allPhotos = await response.json();
            renderPhotos(allPhotos, galleryGrid);
        } else {
            console.log('No photos data found.');
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function renderPhotos(photos, container) {
    if (photos.length > 0) {
        container.innerHTML = ''; // Clear placeholders

        photos.forEach((photoSrc, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = 'Adventure photo';
            img.loading = 'lazy';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';

            // Click to open lightbox
            item.addEventListener('click', () => {
                if (window.openLightbox) {
                    window.openLightbox(index);
                } else {
                    console.error('Lightbox not initialized');
                }
            });

            item.appendChild(img);
            container.appendChild(item);
        });
    }
}

// Run navigation, gallery, and lightbox init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initLightbox();
        loadGallery();
    });
} else {
    initNavigation();
    initLightbox();
    loadGallery();
}
