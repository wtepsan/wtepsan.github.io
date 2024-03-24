document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.toggle-button');
    const publicationsList = document.querySelector('.publications-list');

    // Initialize button text based on the list's initial state
    toggleButton.textContent = '▼ Publications'; // List is visible by default

    toggleButton.addEventListener('click', () => {
        const isOpen = publicationsList.style.display === 'block' || publicationsList.style.display === '';
        publicationsList.style.display = isOpen ? 'none' : 'block';
        toggleButton.textContent = isOpen ? '▶ Publications' : '▼ Publications';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navUL = document.querySelector('nav ul');

    hamburger.addEventListener('click', () => {
        navUL.style.display = navUL.style.display === 'block' ? 'none' : 'block';
    });
}); 

