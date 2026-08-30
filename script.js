document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navUL = document.querySelector('nav ul');

    if (hamburger && navUL) {
        hamburger.addEventListener('click', () => {
            navUL.classList.toggle('show');
        });
    }

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navUL.classList.contains('show')) {
                navUL.classList.remove('show');
            }
        });
    });
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach((section) => {
        observer.observe(section);
    });
});
