document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Preloader ────────────────────────────────────
    const preloader  = document.getElementById('preloader');
    const loaderFill = document.getElementById('loader-fill');
    let progress = 0;
    const tick = setInterval(() => {
        progress += Math.random() * 22;
        if (progress > 100) progress = 100;
        if (loaderFill) loaderFill.style.width = `${progress}%`;
        if (progress === 100) {
            clearInterval(tick);
            setTimeout(() => {
                if (preloader) {
                    preloader.style.opacity    = '0';
                    preloader.style.visibility = 'hidden';
                    document.body.classList.remove('loading');
                }
            }, 500);
        }
    }, 140);


    // ─── 2. Lucide Icons ─────────────────────────────────
    if (window.lucide) lucide.createIcons();


    // ─── 3. Navbar scroll effect ─────────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });


    // ─── 4. Mobile hamburger nav ─────────────────────────
    const hamburger        = document.getElementById('hamburger');
    const mobileNav        = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose   = document.getElementById('mobile-nav-close');

    const openMobileNav  = () => {
        mobileNav?.classList.add('open');
        mobileNavOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeMobileNav = () => {
        mobileNav?.classList.remove('open');
        mobileNavOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    hamburger?.addEventListener('click', openMobileNav);
    mobileNavClose?.addEventListener('click', closeMobileNav);
    mobileNavOverlay?.addEventListener('click', closeMobileNav);

    // Close on nav link click
    mobileNav?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });


    // ─── 5. Lazy-load videos ─────────────────────────────
    const lazyVideos = document.querySelectorAll('.lazy-video');
    const lazyObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const video  = entry.target;
            const source = video.querySelector('source');
            if (source && source.dataset.src) {
                source.src = source.dataset.src;
                video.load();
                video.addEventListener('loadeddata', () => {
                    video.classList.add('loaded');
                }, { once: true });
                // Fallback: mark loaded after 2 s regardless
                setTimeout(() => video.classList.add('loaded'), 2000);
            }
            obs.unobserve(video);
        });
    }, { rootMargin: '0px 0px 500px 0px' });

    lazyVideos.forEach(v => lazyObserver.observe(v));

    // Hover auto-play for preview strip and grid cards
    document.querySelectorAll('.strip-card video, .grid-card video, .dual-video-wrap video').forEach(vid => {
        const parent = vid.closest('.strip-card, .grid-card, .dual-video-wrap');
        if (!parent) return;
        parent.addEventListener('mouseenter', () => { if (vid.classList.contains('loaded')) vid.play(); });
        parent.addEventListener('mouseleave', () => vid.pause());
    });


    // ─── 6. Scroll reveal ────────────────────────────────
    const fadeObserver = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


    // ─── 7. Modals ───────────────────────────────────────
    let swiperInstances = {};

    // Open modal — triggered by any element with .open-modal
    document.querySelectorAll('.open-modal').forEach(trigger => {
        trigger.addEventListener('click', e => {
            e.stopPropagation();
            const modalId = trigger.dataset.modal;
            const modal   = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.add('active');
            document.body.classList.add('modal-open');

            // Init Swiper once per modal
            if (!swiperInstances[modalId]) {
                const swiperEl = modal.querySelector('.modalSwiper');
                if (swiperEl) {
                    swiperInstances[modalId] = new Swiper(swiperEl, {
                        slidesPerView : 'auto',
                        spaceBetween  : 28,
                        freeMode      : true,
                        grabCursor    : true,
                        mousewheel    : { forceToAxis: true },
                        navigation    : {
                            nextEl: swiperEl.querySelector('.swiper-button-next'),
                            prevEl: swiperEl.querySelector('.swiper-button-prev'),
                        },
                    });
                }
            } else {
                swiperInstances[modalId].update();
            }

            // Auto-play first video
            const firstVid = modal.querySelector('video');
            if (firstVid) {
                firstVid.play().catch(() => {});
                updatePlayBtn(firstVid, true);
            }
        });
    });

    // Close modal
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const modal = e.target.closest('.glass-modal');
            closeModal(modal);
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.glass-modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // ESC key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.glass-modal.active').forEach(closeModal);
            closeFsPlayer();
        }
    });

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        modal.querySelectorAll('video').forEach(vid => {
            vid.pause();
            updatePlayBtn(vid, false);
        });
        if (window.lucide) lucide.createIcons();
    }


    // ─── 8. Play/Pause & Fullscreen controls ─────────────
    document.addEventListener('click', e => {
        const playBtn = e.target.closest('.play-pause-btn');
        const fsBtn   = e.target.closest('.fullscreen-btn');

        if (playBtn) {
            e.stopPropagation();
            const container = playBtn.closest('.swiper-slide, .highlight-card');
            const vid = container?.querySelector('video');
            if (!vid) return;
            if (vid.paused) { vid.play(); updatePlayBtn(vid, true); }
            else            { vid.pause(); updatePlayBtn(vid, false); }
        }

        if (fsBtn) {
            e.stopPropagation();
            const slide   = fsBtn.closest('.swiper-slide');
            const modal   = fsBtn.closest('.glass-modal');
            const vid     = slide?.querySelector('video source');
            const fsPlayer = document.getElementById('fullscreen-player');
            const fsVideo  = document.getElementById('fs-video');

            if (modal && vid && fsPlayer && fsVideo) {
                const swiper = swiperInstances[modal.id];
                window.currentFsSwiper = swiper;

                // Pause the in-modal video
                const inModalVid = slide.querySelector('video');
                if (inModalVid) { inModalVid.pause(); updatePlayBtn(inModalVid, false); }

                fsVideo.src = vid.src;
                fsPlayer.classList.remove('hidden');
                fsVideo.play().catch(() => {});
                updateFsBtn(true);
                if (window.lucide) lucide.createIcons();

                if (fsPlayer.requestFullscreen) fsPlayer.requestFullscreen().catch(() => {});
                else if (fsPlayer.webkitRequestFullscreen) fsPlayer.webkitRequestFullscreen();
            } else {
                // Fallback native fullscreen
                const anyVid = fsBtn.closest('.swiper-slide')?.querySelector('video');
                if (anyVid?.requestFullscreen) anyVid.requestFullscreen();
            }
        }
    });

    // Sync icon when video naturally ends
    document.querySelectorAll('.glass-modal video').forEach(vid => {
        vid.addEventListener('ended', () => updatePlayBtn(vid, false));
    });

    function updatePlayBtn(vid, playing) {
        const btn = vid.parentElement?.querySelector('.play-pause-btn');
        if (btn) btn.innerHTML = playing
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';
        if (window.lucide) lucide.createIcons();
    }


    // ─── 9. True Fullscreen Player ───────────────────────
    const fsPlayer  = document.getElementById('fullscreen-player');
    const fsVideo   = document.getElementById('fs-video');
    const fsClose   = fsPlayer?.querySelector('.fs-close');
    const fsPrev    = fsPlayer?.querySelector('.fs-prev');
    const fsNext    = fsPlayer?.querySelector('.fs-next');
    const fsPlayBtn = document.getElementById('fs-play-btn');

    fsClose?.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        closeFsPlayer();
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fsPlayer && !fsPlayer.classList.contains('hidden')) {
            closeFsPlayer();
        }
    });

    function closeFsPlayer() {
        if (!fsPlayer) return;
        fsPlayer.classList.add('hidden');
        if (fsVideo) { fsVideo.pause(); fsVideo.src = ''; }
    }

    function updateFsVideo() {
        if (!window.currentFsSwiper) return;
        const slide = window.currentFsSwiper.slides[window.currentFsSwiper.activeIndex];
        const src   = slide?.querySelector('video source')?.src;
        if (src && fsVideo) {
            fsVideo.src = src;
            fsVideo.play().catch(() => {});
            updateFsBtn(true);
        }
    }

    fsPrev?.addEventListener('click', e => {
        e.stopPropagation();
        window.currentFsSwiper?.slidePrev();
        updateFsVideo();
    });
    fsNext?.addEventListener('click', e => {
        e.stopPropagation();
        window.currentFsSwiper?.slideNext();
        updateFsVideo();
    });

    fsPlayBtn?.addEventListener('click', e => {
        e.stopPropagation();
        if (!fsVideo) return;
        if (fsVideo.paused) { fsVideo.play(); updateFsBtn(true); }
        else                { fsVideo.pause(); updateFsBtn(false); }
    });

    function updateFsBtn(playing) {
        if (!fsPlayBtn) return;
        fsPlayBtn.innerHTML = playing
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';
        if (window.lucide) lucide.createIcons();
    }


    // ─── 10. Magnetic footer CTA ─────────────────────────
    const magBtn = document.getElementById('magnetic-btn');
    if (magBtn) {
        magBtn.addEventListener('mousemove', e => {
            const r = magBtn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width  / 2;
            const y = e.clientY - r.top  - r.height / 2;
            magBtn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            const txt = magBtn.querySelector('span');
            if (txt) txt.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        magBtn.addEventListener('mouseleave', () => {
            magBtn.style.transform = 'translate(0,0)';
            const txt = magBtn.querySelector('span');
            if (txt) txt.style.transform = 'translate(0,0)';
        });
    }

});
