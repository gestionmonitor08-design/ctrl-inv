document.addEventListener('DOMContentLoaded', function () {

  const menuItems = document.querySelectorAll('.menu-item');
  const vistas = document.querySelectorAll('.vista');
  const tituloVista = document.getElementById('tituloVista');
  const btnMenu = document.getElementById('btnMenu');
  const sidebar = document.querySelector('.sidebar');

  /*
   * Nombres que aparecerán en el encabezado
   */
  const nombresVistas = {
    inicio: 'Inicio',
    productos: 'Productos',
    categorias: 'Categorías',
    proveedores: 'Proveedores',
    clientes: 'Clientes',
    inventario: 'Inventario',
    compras: 'Compras',
    ventas: 'Notas de Venta',
    reportes: 'Reportes',
    configuracion: 'Configuración'
  };


  /*
   * Cambiar de vista
   */
  function cambiarVista(nombreVista) {

    // Ocultar todas las vistas
    vistas.forEach(function (vista) {
      vista.classList.remove('activa');
    });

    // Quitar estado activo de todos los botones
    menuItems.forEach(function (item) {
      item.classList.remove('active');
    });

    // Mostrar la vista seleccionada
    const vistaSeleccionada =
      document.getElementById('vista-' + nombreVista);

    if (vistaSeleccionada) {
      vistaSeleccionada.classList.add('activa');
    }

    // Activar botón seleccionado
    const menuSeleccionado =
      document.querySelector(
        '.menu-item[data-vista="' + nombreVista + '"]'
      );

    if (menuSeleccionado) {
      menuSeleccionado.classList.add('active');
    }

    // Actualizar título
    if (tituloVista) {
      tituloVista.textContent =
        nombresVistas[nombreVista] || nombreVista;
    }

    // Cerrar menú lateral en dispositivos móviles
    if (sidebar) {
      sidebar.classList.remove('abierta');
    }
  }


  /*
   * Eventos del menú
   */
  menuItems.forEach(function (item) {

    item.addEventListener('click', function () {

      const nombreVista =
        item.getAttribute('data-vista');

      if (nombreVista) {
        cambiarVista(nombreVista);
      }

    });

  });


  /*
   * Abrir / cerrar menú lateral en móviles
   */
  if (btnMenu && sidebar) {

    btnMenu.addEventListener('click', function () {

      sidebar.classList.toggle('abierta');

    });

  }


  /*
   * Vista inicial
   */
  cambiarVista('inicio');

});
