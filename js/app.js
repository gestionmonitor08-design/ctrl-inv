document.addEventListener('DOMContentLoaded', function () {

  const menuItems = document.querySelectorAll('.menu-item');
  const vistas = document.querySelectorAll('.vista');
  const tituloVista = document.getElementById('tituloVista');
  const btnMenu = document.getElementById('btnMenu');
  const sidebar = document.querySelector('.sidebar');


  /*
   * Nombres de las vistas
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

    vistas.forEach(function (vista) {
      vista.classList.remove('activa');
    });

    menuItems.forEach(function (item) {
      item.classList.remove('active');
    });

    const vistaSeleccionada =
      document.getElementById('vista-' + nombreVista);

    if (vistaSeleccionada) {
      vistaSeleccionada.classList.add('activa');
    }

    const menuSeleccionado =
      document.querySelector(
        '.menu-item[data-vista="' + nombreVista + '"]'
      );

    if (menuSeleccionado) {
      menuSeleccionado.classList.add('active');
    }

    if (tituloVista) {
      tituloVista.textContent =
        nombresVistas[nombreVista] || nombreVista;
    }

    if (sidebar) {
      sidebar.classList.remove('abierta');
    }

    /*
     * Cuando entramos a Productos,
     * cargar los productos desde la API.
     */
    if (nombreVista === 'productos') {
      cargarProductos();
    }
  }


  /*
   * Cargar productos desde Google Apps Script
   */
  async function cargarProductos() {

    const contenedor =
      document.getElementById('vista-productos');

    if (!contenedor) {
      return;
    }

    contenedor.innerHTML = `
      <div class="panel">
        <div class="panel-body">
          <p>Cargando productos...</p>
        </div>
      </div>
    `;

    try {

      const respuesta = await apiGet({
        accion: 'productos'
      });

      if (!respuesta.ok) {
        throw new Error(
          respuesta.mensaje || 'No se pudieron obtener los productos.'
        );
      }

      mostrarProductos(respuesta.datos);

    } catch (error) {

      contenedor.innerHTML = `
        <div class="panel">
          <div class="panel-body">
            <div class="estado-inicial">
              <div class="estado-icono">!</div>

              <div>
                <h3>Error al cargar productos</h3>
                <p>${error.message}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      console.error(
        'Error al cargar productos:',
        error
      );
    }
  }


  /*
   * Mostrar productos en pantalla
   */
  function mostrarProductos(productos) {

    const contenedor =
      document.getElementById('vista-productos');

    if (!contenedor) {
      return;
    }

    if (!Array.isArray(productos) || productos.length === 0) {

      contenedor.innerHTML = `
        <div class="pagina-header">
          <div>
            <h1>Productos</h1>
            <p>Listado de productos registrados</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-body">
            <p>No hay productos registrados.</p>
          </div>
        </div>
      `;

      return;
    }


    let filas = '';

    productos.forEach(function (producto) {

      const estado = producto.ACTIVO
        ? 'Activo'
        : 'Inactivo';

      filas += `
        <tr>

          <td>${producto.ID_PRODUCTO}</td>

          <td>${producto.CODIGO}</td>

          <td>${producto.NOMBRE}</td>

          <td>${producto.UNIDAD_MEDIDA}</td>

          <td>S/ ${Number(producto.PRECIO_VENTA).toFixed(2)}</td>

          <td>S/ ${Number(producto.COSTO_UNITARIO).toFixed(2)}</td>

          <td>
            ${estado}
          </td>

        </tr>
      `;
    });


    contenedor.innerHTML = `

      <div class="pagina-header">

        <div>
          <h1>Productos</h1>
          <p>Listado de productos registrados</p>
        </div>

      </div>


      <div class="panel">

        <div class="panel-header">

          <div>
            <h2>Productos registrados</h2>
            <p>
              Información obtenida desde Google Sheets.
            </p>
          </div>

        </div>


        <div class="panel-body">

          <div style="overflow-x:auto;">

            <table style="
              width:100%;
              border-collapse:collapse;
              font-size:13px;
            ">

              <thead>

                <tr>

                  <th style="text-align:left;padding:12px;border-bottom:1px solid var(--color-border);">
                    ID
                  </th>

                  <th style="text-align:left;padding:12px;border-bottom:1px solid var(--color-border);">
                    Código
                  </th>

                  <th style="text-align:left;padding:12px;border-bottom:1px solid var(--color-border);">
                    Producto
                  </th>

                  <th style="text-align:left;padding:12px;border-bottom:1px solid var(--color-border);">
                    Unidad
                  </th>

                  <th style="text-align:right;padding:12px;border-bottom:1px solid var(--color-border);">
                    Precio venta
                  </th>

                  <th style="text-align:right;padding:12px;border-bottom:1px solid var(--color-border);">
                    Costo promedio
                  </th>

                  <th style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);">
                    Estado
                  </th>

                </tr>

              </thead>


              <tbody>

                ${filas}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    `;
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
   * Menú móvil
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
