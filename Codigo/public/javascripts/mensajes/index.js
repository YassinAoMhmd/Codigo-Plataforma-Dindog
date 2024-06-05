
document.getElementById('search-input').addEventListener('input', function() {
const searchTerm = this.value.toLowerCase();
document.querySelectorAll('.chat-list .list-group-item').forEach(item => {
    const userName = item.querySelector('strong').textContent.toLowerCase();
    if (userName.includes(searchTerm)) {
        item.style.display = '';
    } else {
        item.style.display = 'none';
    }
});
});

document.getElementById('filter-icon').addEventListener('click', function() {
const filterMenu = document.getElementById('filter-menu');
if (filterMenu.style.display === 'none' || !filterMenu.style.display) {
    filterMenu.style.display = 'block';
} else {
    filterMenu.style.display = 'none';
}
});

document.querySelectorAll('.filter-option').forEach(option => {
option.addEventListener('click', function() {
    const filterType = this.dataset.filter;
    document.querySelectorAll('.chat-list .list-group-item').forEach(item => {
        const unreadMessages = item.querySelector('.badge');
        if (filterType === 'all') {
            item.style.display = '';
        } else if (filterType === 'unread' && unreadMessages) {
            item.style.display = '';
        } else if (filterType === 'read' && !unreadMessages) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
    document.getElementById('filter-menu').style.display = 'none';
});
});
