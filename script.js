// JavaScript navigation and motion for the slide presentation
document.addEventListener('DOMContentLoaded', () => {
    const authoredSlides = Array.from(document.querySelectorAll('.slide'));
    const slides = authoredSlides.map((element, index) => {
        const heading = element.querySelector('.title, .section-title, .final-title');
        const headingText = heading?.cloneNode(true);
        headingText?.querySelectorAll('br').forEach((lineBreak) => lineBreak.replaceWith(' '));
        const title = headingText?.textContent.replace(/\s+/g, ' ').trim() || `Slide ${index + 1}`;
        const classes = Array.from(element.classList)
            .filter((className) => className !== 'slide' && className !== 'active');

        if (index >= 14 && index <= 26) classes.push('larger-type');

        return {
            id: element.id,
            classes: classes.join(' '),
            html: element.innerHTML,
            title
        };
    });
    const slideStage = authoredSlides[0];
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('slide-indicator');
    const showAllSlidesBtn = document.getElementById('show-all-slides');
    const slideOverview = document.getElementById('slide-overview');
    const closeSlideOverviewBtn = document.getElementById('close-slide-overview');
    const slideGrid = document.getElementById('slide-grid');
    const fullscreenBtn =
        document.getElementById('fullscreen-btn');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let currentSlide = 0;
    let activeAnimations = [];
    const totalSlides = slides.length;
    const transitionPresets = [
        { name: 'wipe ngang', duration: 420 },
        { name: 'wipe dọc', duration: 460 },
        { name: 'mở vòng tròn', duration: 520 },
        { name: 'trượt ngang', duration: 380 },
        { name: 'trượt dọc', duration: 420 },
        { name: 'phóng tiêu điểm', duration: 460 },
        { name: 'lật ngang', duration: 520 },
        { name: 'lật dọc', duration: 520 },
        { name: 'mở màn trập', duration: 460 },
        { name: 'mở chéo', duration: 480 },
        { name: 'nghiêng vào', duration: 440 }
    ];

    authoredSlides.slice(1).forEach((slide) => slide.remove());

    function collectRevealTargets(slide) {
        const content = slide.querySelector('.slide-content');
        const targets = [];

        function visit(parent) {
            Array.from(parent.children).forEach((child) => {
                if (child.matches('.grid, .process-wrapper, .col, .outline-list')) {
                    visit(child);
                } else {
                    targets.push(child);
                }
            });
        }

        if (content) visit(content);
        return targets;
    }

    function stopMotion() {
        activeAnimations.forEach((animation) => animation.cancel());
        activeAnimations = [];
    }

    function increaseSlideTextSize(slide) {
        const elements = [slide, ...slide.querySelectorAll('*')];
        const sizes = elements.map((element) => ({
            element,
            fontSize: Number.parseFloat(window.getComputedStyle(element).fontSize)
        }));

        sizes.forEach(({ element, fontSize }) => {
            if (Number.isFinite(fontSize) && fontSize > 0) {
                element.style.fontSize = `${fontSize * 1.1}px`;
            }
        });

        const content = slide.querySelector('.slide-content');
        if (content && content.scrollHeight > content.clientHeight + 1) {
            slide.classList.add('text-expanded');
        }
    }

    function animateSlideContent(slide, direction, index) {
        if (reduceMotion.matches || typeof Element.prototype.animate !== 'function') return;

        const preset = transitionPresets[index % transitionPresets.length];
        const reverse = direction < 0;
        const edge = reverse ? 'left' : 'right';
        const verticalEdge = reverse ? 'bottom' : 'top';
        const originX = reverse ? '100%' : '0%';
        const originY = reverse ? '100%' : '0%';
        let stageFrames;

        switch (index % transitionPresets.length) {
            case 0:
                stageFrames = [
                    { clipPath: reverse ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
                    { clipPath: 'inset(0 0 0 0)' }
                ];
                break;
            case 1:
                stageFrames = [
                    { clipPath: reverse ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)' },
                    { clipPath: 'inset(0 0 0 0)' }
                ];
                break;
            case 2:
                stageFrames = [
                    { clipPath: `circle(0% at ${originX} ${originY})` },
                    { clipPath: `circle(150% at ${originX} ${originY})` }
                ];
                break;
            case 3:
                stageFrames = [
                    { opacity: 0.5, transform: `translate3d(${direction * 100}%, 0, 0) scale(.98)` },
                    { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
                ];
                break;
            case 4:
                stageFrames = [
                    { opacity: 0.5, transform: `translate3d(0, ${direction * 100}%, 0) scale(.98)` },
                    { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
                ];
                break;
            case 5:
                stageFrames = [
                    { opacity: 0, filter: 'blur(10px)', transform: 'scale(1.12)' },
                    { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }
                ];
                break;
            case 6:
                stageFrames = [
                    { opacity: 0.35, transform: `perspective(1200px) rotateY(${direction * 70}deg)`, transformOrigin: `${edge} center` },
                    { opacity: 1, transform: 'perspective(1200px) rotateY(0)', transformOrigin: `${edge} center` }
                ];
                break;
            case 7:
                stageFrames = [
                    { opacity: 0.35, transform: `perspective(1200px) rotateX(${direction * -65}deg)`, transformOrigin: `center ${verticalEdge}` },
                    { opacity: 1, transform: 'perspective(1200px) rotateX(0)', transformOrigin: `center ${verticalEdge}` }
                ];
                break;
            case 8:
                stageFrames = [
                    { clipPath: `inset(0 50% 0 50% round 48%)` },
                    { clipPath: 'inset(0 0 0 0 round 0)' }
                ];
                break;
            case 9:
                stageFrames = [
                    { clipPath: reverse ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' : 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
                    { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
                ];
                break;
            default:
                stageFrames = [
                    { opacity: 0.35, transform: `translate3d(${direction * 70}px, 0, 0) rotate(${direction * 7}deg) scale(.96)` },
                    { opacity: 1, transform: 'translate3d(0, 0, 0) rotate(0) scale(1)' }
                ];
        }

        slide.dataset.transition = preset.name;
        const stageAnimation = slide.animate(stageFrames, {
            duration: preset.duration,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        });
        activeAnimations.push(stageAnimation);
        stageAnimation.onfinish = () => {
            stageAnimation.cancel();
            activeAnimations = activeAnimations.filter((item) => item !== stageAnimation);
        };

        const targets = collectRevealTargets(slide);
        targets.forEach((element, index) => {
            const isHeading = element.matches('.title, .section-title, .final-title, .sub-heading');
            const isProcessArrow = element.matches('.process-arrow');
            const isCard = element.matches('.card, .process-step, .outline-item');
            const startTransform = isProcessArrow
                ? `scaleX(${direction < 0 ? -0.75 : 0.75})`
                : isCard
                    ? `translate3d(${direction * 18}px, 8px, 0) scale(.985)`
                    : `translate3d(${direction * 12}px, 0, 0)`;
            const startFilter = isHeading ? 'blur(6px)' : isCard ? 'blur(3px)' : 'blur(2px)';
            const animation = element.animate(
                [
                    {
                        opacity: 0,
                        filter: startFilter,
                        transform: startTransform,
                        transformOrigin: isProcessArrow
                            ? (direction < 0 ? 'right center' : 'left center')
                            : 'center'
                    },
                    {
                        opacity: 1,
                        filter: 'blur(0)',
                        transform: 'translate3d(0, 0, 0) scale(1)'
                    }
                ],
                {
                    duration: isHeading ? 300 : 350,
                    delay: Math.min(index * 55, 275),
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    fill: 'both'
                }
            );

            activeAnimations.push(animation);
            animation.onfinish = () => {
                animation.cancel();
                activeAnimations = activeAnimations.filter((item) => item !== animation);
            };
        });
    }

    function updateSlide(index, direction = 0, animate = false) {
        stopMotion();

        const slide = slides[index];
        slideStage.style.removeProperty('font-size');
        slideStage.id = slide.id;
        slideStage.className = `slide active${slide.classes ? ` ${slide.classes}` : ''}`;
        slideStage.innerHTML = slide.html;
        if(slide.id === 'slide-9'){
    setTimeout(() => {
        animateCounters(slideStage);
    }, 300);
}
        increaseSlideTextSize(slideStage);
        slideStage.setAttribute('aria-hidden', 'false');
        slideStage.setAttribute('aria-label', `Slide ${index + 1}: ${slide.title}`);

        indicator.textContent = `${index + 1} / ${totalSlides}`;
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;

        updateSelectedThumbnail();
        if (animate) animateSlideContent(slideStage, direction, index);
    }

    function goToSlide(index) {
        if (index < 0 || index >= totalSlides || index === currentSlide) return;

        const direction = Math.sign(index - currentSlide);
        currentSlide = index;
        updateSlide(currentSlide, direction, true);
    }

    function navigateFromButton(button, index) {
        if (!button.disabled && !reduceMotion.matches && typeof button.animate === 'function') {
            button.animate(
                [
                    { transform: 'scale(1)' },
                    { transform: 'scale(.94)', offset: 0.45 },
                    { transform: 'scale(1)' }
                ],
                { duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            );
        }
        goToSlide(index);
    }

    slideStage.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;

        const selectedOption = event.target.closest('[data-quiz-option]');
        if (!selectedOption || selectedOption.disabled) return;

        const options = slideStage.querySelectorAll('[data-quiz-option]');
        const feedback = slideStage.querySelector('[data-quiz-feedback]');
        const isCorrect = selectedOption.dataset.correct === 'true';
        const retryUntilCorrect = slideStage.querySelector('[data-quiz-retry]') !== null;
        const correctOption = slideStage.querySelector('[data-quiz-option][data-correct="true"]');

        options.forEach((option) => {
            option.classList.remove('is-incorrect');
            option.disabled = !retryUntilCorrect || isCorrect;
            option.setAttribute('aria-pressed', String(option === selectedOption));
        });

        if (isCorrect) {
            selectedOption.classList.add('is-correct');
            feedback.className = 'quiz-feedback is-correct';
            feedback.textContent = 'Đúng! Bạn đã chọn chính xác.';
        } else if (retryUntilCorrect) {
            selectedOption.classList.add('is-incorrect');
            feedback.className = 'quiz-feedback is-incorrect';
            feedback.textContent = 'Chưa đúng. Hãy thử lại nhé.';
        } else {
            selectedOption.classList.add('is-incorrect');
            correctOption?.classList.add('is-correct');
            feedback.className = 'quiz-feedback is-incorrect';
            feedback.textContent = `Sai. Đáp án đúng là ${correctOption?.querySelector('.quiz-option__letter')?.textContent}.`;
        }

        feedback.classList.remove('is-updated');
        void feedback.offsetWidth;
        feedback.classList.add('is-updated');
    });

    function updateSelectedThumbnail() {
        slideGrid.querySelectorAll('.slide-thumb').forEach((thumbnail, index) => {
            if (index === currentSlide) {
                thumbnail.setAttribute('aria-current', 'true');
            } else {
                thumbnail.removeAttribute('aria-current');
            }
        });
    }

    function updateThumbnailScale() {
        slideGrid.querySelectorAll('.slide-thumb__stage').forEach((stage) => {
            const preview = stage.querySelector('.slide-thumb__content');
            if (preview) preview.style.transform = `scale(${stage.clientWidth / 1540})`;
        });
    }

    function renderThumbnails() {
        const fragment = document.createDocumentFragment();

        slides.forEach((slide, index) => {
            const thumbnail = document.createElement('button');
            thumbnail.className = 'slide-thumb';
            thumbnail.type = 'button';
            thumbnail.setAttribute('aria-label', `Hiển thị slide ${index + 1}: ${slide.title}`);
            thumbnail.dataset.slideIndex = String(index);

            const stage = document.createElement('span');
            stage.className = 'slide-thumb__stage';
            stage.setAttribute('aria-hidden', 'true');

            const preview = document.createElement('span');
            preview.className = `slide slide-thumb__content active${slide.classes ? ` ${slide.classes}` : ''}`;
            preview.dataset.slideId = slide.id;
            preview.innerHTML = slide.html;
            preview.querySelectorAll('video').forEach((video) => {
                const thumbnailVideo = document.createElement('span');
                thumbnailVideo.className = 'video-slide__thumbnail';
                thumbnailVideo.setAttribute('aria-hidden', 'true');
                video.replaceWith(thumbnailVideo);
            });
            preview.querySelectorAll('[data-quiz-option]').forEach((option) => {
                const staticOption = document.createElement('div');
                staticOption.className = option.className;
                staticOption.innerHTML = option.innerHTML;
                staticOption.setAttribute('aria-hidden', 'true');
                option.replaceWith(staticOption);
            });
            preview.querySelectorAll('[data-quiz-feedback]').forEach((feedback) => feedback.remove());
            preview.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
            stage.append(preview);

            const label = document.createElement('span');
            label.className = 'slide-thumb__label';
            const number = document.createElement('span');
            number.className = 'slide-thumb__number';
            number.textContent = String(index + 1).padStart(2, '0');
            label.append(number, document.createTextNode(slide.title));

            thumbnail.append(stage, label);
            thumbnail.addEventListener('click', () => {
                goToSlide(index);
                slideOverview.close();
                showAllSlidesBtn.focus();
            });
            fragment.append(thumbnail);
        });

        slideGrid.replaceChildren(fragment);
        slideGrid.querySelectorAll('.slide-thumb__content').forEach(increaseSlideTextSize);
        updateSelectedThumbnail();
        updateThumbnailScale();
    }

    prevBtn.addEventListener('click', () => navigateFromButton(prevBtn, currentSlide - 1));
    nextBtn.addEventListener('click', () => navigateFromButton(nextBtn, currentSlide + 1));
    showAllSlidesBtn.addEventListener('click', () => {
        updateSelectedThumbnail();
        slideOverview.showModal();
        updateThumbnailScale();
        closeSlideOverviewBtn.focus();
    });
    closeSlideOverviewBtn.addEventListener('click', () => slideOverview.close());
    slideOverview.addEventListener('click', (event) => {
        if (event.target === slideOverview) slideOverview.close();
    });
    slideOverview.addEventListener('close', () => showAllSlidesBtn.focus());
    window.addEventListener('resize', updateThumbnailScale);

    document.addEventListener('keydown', (event) => {
        if (slideOverview.open) return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;

        if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
            event.preventDefault();
            goToSlide(currentSlide + 1);
        } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            goToSlide(currentSlide - 1);
        }
    });

    reduceMotion.addEventListener?.('change', (event) => {
        if (event.matches) stopMotion();
    });
fullscreenBtn?.addEventListener('click', async () => {

    if (!document.fullscreenElement) {

        await document
            .querySelector('.presentation-container')
            ?.requestFullscreen();

        fullscreenBtn.innerHTML =
            '<span>⛶</span><span>Thoát Fullscreen</span>';

    } else {

        await document.exitFullscreen();

        fullscreenBtn.innerHTML =
            '<span>⛶</span><span>Toàn màn hình</span>';
    }
});

document.addEventListener('fullscreenchange', () => {

    if (!document.fullscreenElement) {

        fullscreenBtn.innerHTML =
            '<span>⛶</span><span>Toàn màn hình</span>';
    }
});
function animateCounters(slide){

    const counters =
        slide.querySelectorAll('.stat-number[data-target]');

    counters.forEach(counter => {

        const target =
            parseFloat(counter.dataset.target);

        const suffix =
            counter.dataset.suffix || '';

        let start = 0;

        const duration = 1800;

        const startTime = performance.now();

        function update(now){

            const progress =
                Math.min(
                    (now - startTime) / duration,
                    1
                );

            const value =
                target * progress;

            if(suffix === 'M'){

                counter.textContent =
                    value.toFixed(2).replace('.', ',')
                    + suffix;

            }else{

                counter.textContent =
                    Math.floor(value)
                        .toLocaleString('vi-VN')
                    + suffix;
            }

            if(progress < 1){
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    });
}
    renderThumbnails();
    updateSlide(currentSlide);
});
