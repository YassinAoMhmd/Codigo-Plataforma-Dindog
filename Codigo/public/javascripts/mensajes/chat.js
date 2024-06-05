const contenedorMensajes = document.getElementById("chat-messages");
contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;

const barraBusqueda = document.getElementById('search-input');
const listaContactos = document.getElementById('listaContactos');
const contactItems = listaContactos.getElementsByTagName('a');

barraBusqueda.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  Array.from(contactItems).forEach(function(contactItem) {
    const contactName = contactItem.querySelector('.contact-name').innerText.toLowerCase();
    if (contactName.includes(searchTerm)) {
      contactItem.style.display = '';
    } else {
      contactItem.style.display = 'none';
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

document.querySelector('.form-container form').addEventListener('submit', function(e) {
  const contenido = document.querySelector('textarea[name="contenido"]').value.trim();
  const image = document.querySelector('input[name="image"]').files[0];

  if (!contenido && !image) {
    e.preventDefault();
    alert('No puedes enviar un mensaje vacío.');
  }
});
