document.addEventListener('DOMContentLoaded', () => {
    const navBar = document.querySelector('.nav-bar');
    const menuToggle = document.querySelector('.nav-bar input[type="checkbox"]');
    const navLinks = document.querySelectorAll('.menu-list a');
    const sections = document.querySelectorAll('section[id]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 1. Mobile menu: close after choosing a link or tapping outside, or pressing Esc */
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.checked = false;
        });
    });

    document.addEventListener('click', e => {
        if (menuToggle.checked && !navBar.contains(e.target)) {
            menuToggle.checked = false;
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') menuToggle.checked = false;
    });

    /* 2. Highlight the nav link of the section currently in view */
    const setActiveLink = () => {
        const offset = window.scrollY + 120;
        let currentId = '';
        sections.forEach(section => {
            if (offset >= section.offsetTop) currentId = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    };

    /* 3. Navbar gets a stronger look after scrolling, plus back-to-top button */
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            navBar.classList.toggle('scrolled', window.scrollY > 40);
            backToTop.classList.toggle('show', window.scrollY > 500);
            setActiveLink();
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* 4. Reveal menu items, cards and testimonials as they enter the viewport */
    if ('IntersectionObserver' in window && !reducedMotion) {
        const targets = document.querySelectorAll(
            '.food-menu-item, .testimonial-box, .contact-container'
        );
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        targets.forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = (i % 3) * 80 + 'ms';
            observer.observe(el);
        });
    }

    /* 5. "Learn More" buttons: placeholder links shouldn't jump to the top */
    document.querySelectorAll('.img-content a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const name = btn.parentElement.querySelector('h3').textContent;
            showToast(name + ' details are coming soon.');
        });
    });

    /* 6. Menu items: tap/click to highlight one, click again to clear */
    document.querySelectorAll('.food-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const wasSelected = item.classList.contains('selected');
            document.querySelectorAll('.food-menu-item.selected')
                .forEach(el => el.classList.remove('selected'));
            if (!wasSelected) item.classList.add('selected');
        });
    });

    /* 7. Contact form validation */
    const contactBox = document.querySelector('.contact-detail');
    const nameInput = contactBox.querySelector('input[placeholder="Name"]');
    const emailInput = contactBox.querySelector('input[placeholder="Email"]');
    const messageInput = contactBox.querySelector('textarea');
    const submitBtn = contactBox.querySelector('a.btn');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setInvalid = (field, invalid) => field.classList.toggle('invalid', invalid);

    [nameInput, emailInput, messageInput].forEach(field => {
        field.addEventListener('input', () => setInvalid(field, false));
    });

    submitBtn.addEventListener('click', e => {
        e.preventDefault();

        const nameOk = nameInput.value.trim().length >= 2;
        const emailOk = emailPattern.test(emailInput.value.trim());
        const messageOk = messageInput.value.trim().length >= 5;

        setInvalid(nameInput, !nameOk);
        setInvalid(emailInput, !emailOk);
        setInvalid(messageInput, !messageOk);

        if (!nameOk) return showToast('Enter your name (at least 2 characters).', 'error');
        if (!emailOk) return showToast('Enter a valid email address.', 'error');
        if (!messageOk) return showToast('Write a message (at least 5 characters).', 'error');

        // Replace this with a real fetch() call to your backend when you have one.
        showToast('Thanks, ' + nameInput.value.trim() + '! Your message was sent.');
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
    });

    /* Toast helper */
    let toastTimer;
    function showToast(text, type = 'success') {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.remove('success', 'error');
        toast.classList.add(type, 'show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
