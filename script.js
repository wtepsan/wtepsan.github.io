document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.toggle-button');
    const publicationsList = document.querySelector('.project-list');

    // Initialize button text based on the list's initial state
    toggleButton.textContent = '▼ Todo Research Project'; // List is visible by default

    toggleButton.addEventListener('click', () => {
        const isOpen = publicationsList.style.display === 'block' || publicationsList.style.display === '';
        publicationsList.style.display = isOpen ? 'none' : 'block';
        toggleButton.textContent = isOpen ? '▶ Todo Research Project' : '▼ Todo Research Project';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navUL = document.querySelector('nav ul');

    hamburger.addEventListener('click', () => {
        navUL.style.display = navUL.style.display === 'block' ? 'none' : 'block';
    });
}); 
