document.addEventListener('DOMContentLoaded', () => {
    // --- FIX NESTED DOM BUG ---
    // Un-nest subsequent sections to body first to prevent them inheriting hidden state from gallery sections
    const sectionsToMove = ['#lightbox', '#sponsors', 'footer'];
    sectionsToMove.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            document.body.appendChild(el);
        }
    });


    // --- STICKY HEADER ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- MOBILE MENU ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('open', isOpen);
        });

        // Close mobile menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('open');
            });
        });
    }

    // --- SCROLL SPY ACTIVE STATE ---
    const sections = document.querySelectorAll('section, div.hero');
    
    function scrollSpy() {
        const scrollPos = window.scrollY + 120; // offset for sticky header
        
        sections.forEach(section => {
            if (section.id) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }
    window.addEventListener('scroll', scrollSpy);
    scrollSpy(); // run once on load

    // --- GALLERY CAROUSEL SLIDERS ---
    const initializeSliders = () => {
        const wrappers = document.querySelectorAll('.gallery-slider-wrapper');
        
        wrappers.forEach(wrapper => {
            const track = wrapper.querySelector('.gallery-slider-track');
            const prevBtn = wrapper.querySelector('.gallery-slider-btn.prev');
            const nextBtn = wrapper.querySelector('.gallery-slider-btn.next');
            const viewport = wrapper.querySelector('.gallery-slider-viewport');
            
            if (!track || !prevBtn || !nextBtn || !viewport) return;
            
            let currentIndex = 0;
            
            const updateSlider = () => {
                const visibleItems = Array.from(track.querySelectorAll('.gallery-item.show'));
                if (visibleItems.length === 0) {
                    prevBtn.disabled = true;
                    nextBtn.disabled = true;
                    track.style.transform = 'translateX(0px)';
                    return;
                }
                
                const itemWidth = visibleItems[0].getBoundingClientRect().width;
                const computedStyle = window.getComputedStyle(track);
                const gap = parseFloat(computedStyle.gap) || 24; // 1.5rem = 24px
                const viewportWidth = viewport.clientWidth;
                
                const itemsPerViewport = Math.round((viewportWidth + gap) / (itemWidth + gap)) || 1;
                const maxIndex = Math.max(0, visibleItems.length - itemsPerViewport);
                
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                if (currentIndex < 0) {
                    currentIndex = 0;
                }
                
                const offset = currentIndex * (itemWidth + gap);
                track.style.transform = `translateX(-${offset}px)`;
                
                prevBtn.disabled = currentIndex === 0;
                nextBtn.disabled = currentIndex >= maxIndex;
            };
            
            prevBtn.addEventListener('click', () => {
                currentIndex--;
                updateSlider();
            });
            
            nextBtn.addEventListener('click', () => {
                currentIndex++;
                updateSlider();
            });
            
            wrapper.resetSlider = () => {
                currentIndex = 0;
                updateSlider();
            };
            
            updateSlider();
        });
    };

    // --- GALLERY FILTERING ---
    const tabs = document.querySelectorAll('.gallery-tab');
    const yearSections = document.querySelectorAll('.gallery-year-section');
    const items = document.querySelectorAll('.gallery-item');

    function filterGallery(category) {
        if (category === 'all') {
            yearSections.forEach(sec => sec.classList.add('show'));
            items.forEach(item => item.classList.add('show'));
        } else {
            yearSections.forEach(sec => {
                if (sec.getAttribute('data-year') === category) {
                    sec.classList.add('show');
                } else {
                    sec.classList.remove('show');
                }
            });
            items.forEach(item => {
                if (item.getAttribute('data-category') === category) {
                    item.classList.add('show');
                } else {
                    item.classList.remove('show');
                }
            });
        }
        
        // Reset all sliders on filtering
        const wrappers = document.querySelectorAll('.gallery-slider-wrapper');
        wrappers.forEach(wrapper => {
            if (typeof wrapper.resetSlider === 'function') {
                wrapper.resetSlider();
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-target');
            filterGallery(category);
        });
    });

    // Initialize sliders and gallery
    initializeSliders();
    filterGallery('all');

    window.addEventListener('resize', () => {
        const wrappers = document.querySelectorAll('.gallery-slider-wrapper');
        wrappers.forEach(wrapper => {
            if (typeof wrapper.resetSlider === 'function') {
                wrapper.resetSlider();
            }
        });
    });

    // --- REGISTRATION CLOSED MODAL ---
    const regModal = document.getElementById('registration-modal');
    const regTriggers = document.querySelectorAll('.register-trigger');
    const regClose = regModal ? regModal.querySelector('.modal-close') : null;

    if (regModal && regClose) {
        regTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                regModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        const closeRegModal = () => {
            regModal.style.display = 'none';
            document.body.style.overflow = '';
        };

        regClose.addEventListener('click', closeRegModal);
        
        regModal.addEventListener('click', (e) => {
            if (e.target === regModal) {
                closeRegModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && regModal.style.display === 'flex') {
                closeRegModal();
            }
        });
    }

    // --- LIGHTBOX MODAL ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const prevBtn = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const nextBtn = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    
    let activeImages = [];
    let currentIndex = 0;

    function getVisibleImages() {
        // Find all currently displayed images in the gallery
        const visibleItems = document.querySelectorAll('.gallery-item.show img');
        return Array.from(visibleItems);
    }

    function showLightbox(imgElement) {
        console.log("showLightbox called with:", imgElement);
        if (!lightbox || !lightboxImg) {
            console.log("Lightbox elements not found in DOM");
            return;
        }
        
        // Detect if clicked image is a route map
        const isRouteMap = imgElement.closest('.route-map-card') !== null;
        console.log("isRouteMap:", isRouteMap);
        
        if (isRouteMap) {
            const routeMaps = Array.from(document.querySelectorAll('.route-map-card img'));
            console.log("Route maps found:", routeMaps);
            activeImages = routeMaps.map(img => img.src);
            currentIndex = activeImages.indexOf(imgElement.src);
            console.log("activeImages for route maps:", activeImages, "currentIndex:", currentIndex);
        } else {
            const visibleImages = getVisibleImages();
            activeImages = visibleImages.map(img => img.src);
            currentIndex = activeImages.indexOf(imgElement.src);
            console.log("activeImages for gallery:", activeImages.length, "currentIndex:", currentIndex);
        }
        
        if (currentIndex === -1) currentIndex = 0;
        
        const targetSrc = activeImages[currentIndex];
        console.log("Setting lightboxImg.src to:", targetSrc);
        lightboxImg.src = targetSrc;
        
        // Handle SVG class toggling to prevent zero-height browser bug
        if (targetSrc && targetSrc.toLowerCase().endsWith('.svg')) {
            lightboxImg.classList.add('is-svg');
        } else {
            lightboxImg.classList.remove('is-svg');
        }
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // stop page scroll
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // restore scroll
    }

    function navigateLightbox(dir) {
        if (activeImages.length === 0) return;
        
        currentIndex = (currentIndex + dir + activeImages.length) % activeImages.length;
        if (lightboxImg) {
            const targetSrc = activeImages[currentIndex];
            lightboxImg.src = targetSrc;
            
            // Handle SVG class toggling to prevent zero-height browser bug
            if (targetSrc && targetSrc.toLowerCase().endsWith('.svg')) {
                lightboxImg.classList.add('is-svg');
            } else {
                lightboxImg.classList.remove('is-svg');
            }
        }
    }

    // Attach click events to gallery items
    document.addEventListener('click', (e) => {
        const itemImg = e.target.closest('.gallery-item img');
        const overlay = e.target.closest('.gallery-overlay');
        const routeMapCard = e.target.closest('.route-map-card');
        
        if (itemImg) {
            showLightbox(itemImg);
        } else if (overlay) {
            const img = overlay.previousElementSibling;
            if (img && img.tagName === 'IMG') {
                showLightbox(img);
            }
        } else if (routeMapCard) {
            const img = routeMapCard.querySelector('img');
            if (img) {
                showLightbox(img);
            }
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });

    // --- SCROLL ANIMATIONS OBSERVER ---
    const revealElements = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
