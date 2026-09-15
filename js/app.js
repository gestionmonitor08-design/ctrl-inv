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
  
      /*
       * Usamos inventario porque este endpoint
       * devuelve productos + existencia actual.
       */
      const respuesta = await apiGet({
        accion: 'inventario'
      });
  
      if (!respuesta.ok) {
        throw new Error(
          respuesta.mensaje ||
          'No se pudo obtener el inventario.'
        );
      }
  
      mostrarProductos(respuesta.datos);
  
    } catch (error) {
  
      contenedor.innerHTML = `
        <div class="panel">
          <div class="panel-body">
  
            <div class="estado-inicial">
  
              <div class="estado-icono">
                !
              </div>
  
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


  if (!Array.isArray(productos)) {
    productos = [];
  }


  let filas = '';


  productos.forEach(function (producto) {

    const estado = producto.ACTIVO
      ? 'Activo'
      : 'Inactivo';


    filas += `
      <tr>

        <td style="padding:12px;border-bottom:1px solid var(--color-border);">
          ${producto.ID_PRODUCTO}
        </td>

        <td style="padding:12px;border-bottom:1px solid var(--color-border);">
          ${producto.CODIGO}
        </td>

        <td style="padding:12px;border-bottom:1px solid var(--color-border);">
          ${producto.NOMBRE}
        </td>

        <td style="padding:12px;border-bottom:1px solid var(--color-border);">
          ${producto.UNIDAD_MEDIDA}
        </td>

        <td style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);">
          <strong>${Number(producto.existencia || 0)}</strong>
        </td>

        <td style="text-align:right;padding:12px;border-bottom:1px solid var(--color-border);">
          S/ ${Number(producto.PRECIO_VENTA || 0).toFixed(2)}
        </td>

        <td style="text-align:right;padding:12px;border-bottom:1px solid var(--color-border);">
          S/ ${Number(producto.COSTO_UNITARIO || 0).toFixed(2)}
        </td>

        <td style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);">
          ${estado}
        </td>

      </tr>
    `;
  });


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>
        <h1>Productos</h1>
        <p>Administración de productos registrados</p>
      </div>

      <div>

        <button
          id="btnNuevoProducto"
          style="
            border:none;
            background:var(--color-primary);
            color:white;
            padding:11px 18px;
            border-radius:8px;
            cursor:pointer;
            font-size:13px;
            font-weight:600;
          "
        >
          + Nuevo producto
        </button>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>
          <h2>Productos registrados</h2>

          <p>
            Productos, existencias y costos actuales.
          </p>
        </div>

      </div>


      <div class="panel-body">

        <div style="overflow-x:auto;">

          <table
            style="
              width:100%;
              border-collapse:collapse;
              font-size:13px;
            "
          >

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

                <th style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);">
                  Existencia
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


  /*
   * Botón Nuevo Producto
   */
  const btnNuevoProducto =
    document.getElementById('btnNuevoProducto');

  if (btnNuevoProducto) {

    btnNuevoProducto.addEventListener(
      'click',
      mostrarFormularioNuevoProducto
    );

  }

}

function mostrarFormularioNuevoProducto() {

  const contenedor =
    document.getElementById('vista-productos');

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>
        <h1>Nuevo producto</h1>
        <p>Registrar un nuevo producto en el sistema</p>
      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>
          <h2>Datos del producto</h2>
          <p>
            Complete la información requerida.
          </p>
        </div>

      </div>


      <div class="panel-body">

        <form id="formNuevoProducto">


          <div style="
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px;
          ">


            <!-- CÓDIGO -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Código *
              </label>

              <input
                type="text"
                id="productoCodigo"
                required
                maxlength="50"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <!-- NOMBRE -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Nombre *
              </label>

              <input
                type="text"
                id="productoNombre"
                required
                maxlength="150"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <!-- CATEGORÍA -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                ID Categoría
              </label>

              <input
                type="number"
                id="productoCategoria"
                min="1"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <!-- UNIDAD -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Unidad de medida
              </label>

              <input
                type="text"
                id="productoUnidad"
                value="UND"
                maxlength="20"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <!-- PRECIO -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Precio de venta
              </label>

              <input
                type="number"
                id="productoPrecio"
                min="0"
                step="0.01"
                value="0"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <!-- COSTO -->

            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Costo unitario
              </label>

              <input
                type="number"
                id="productoCosto"
                min="0"
                step="0.01"
                value="0"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


          </div>


          <!-- ESTADO -->

          <div style="
            margin-top:20px;
            padding:14px;
            background:var(--color-background);
            border-radius:8px;
          ">

            <label style="
              display:flex;
              align-items:center;
              gap:8px;
              font-size:13px;
              cursor:pointer;
            ">

              <input
                type="checkbox"
                id="productoActivo"
                checked
              >

              Producto activo

            </label>

          </div>


          <!-- BOTONES -->

          <div style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:22px;
          ">

            <button
              type="button"
              id="btnCancelarProducto"
              style="
                border:1px solid var(--color-border);
                background:white;
                color:var(--color-text);
                padding:10px 18px;
                border-radius:8px;
                cursor:pointer;
                font-size:13px;
              "
            >
              Cancelar
            </button>


            <button
              type="submit"
              style="
                border:none;
                background:var(--color-primary);
                color:white;
                padding:10px 18px;
                border-radius:8px;
                cursor:pointer;
                font-size:13px;
                font-weight:600;
              "
            >
              Guardar producto
            </button>

          </div>


        </form>

      </div>

    </div>
  `;


  /*
   * Cancelar
   */
  document
    .getElementById('btnCancelarProducto')
    .addEventListener('click', function () {

      cargarProductos();

    });


  /*
   * Guardar
   */
  document
    .getElementById('formNuevoProducto')
    .addEventListener('submit', guardarNuevoProducto);

}

  async function guardarNuevoProducto(evento) {
  
    evento.preventDefault();
  
    const boton =
      document.querySelector(
        '#formNuevoProducto button[type="submit"]'
      );
  
    if (boton) {
      boton.disabled = true;
      boton.textContent = 'Guardando...';
    }
  
  
    try {
  
      const codigo =
        document.getElementById('productoCodigo').value.trim();
  
      const nombre =
        document.getElementById('productoNombre').value.trim();
  
      const categoria =
        document.getElementById('productoCategoria').value;
  
      const unidad =
        document.getElementById('productoUnidad').value.trim();
  
      const precio =
        Number(
          document.getElementById('productoPrecio').value
        ) || 0;
  
      const costo =
        Number(
          document.getElementById('productoCosto').value
        ) || 0;
  
      const activo =
        document.getElementById('productoActivo').checked;
  
  
      /*
       * Validación básica del frontend
       */
      if (!codigo) {
        throw new Error(
          'El código del producto es obligatorio.'
        );
      }
  
      if (!nombre) {
        throw new Error(
          'El nombre del producto es obligatorio.'
        );
      }
  
  
      /*
       * Enviar producto a Apps Script
       */
      const respuesta = await apiPost({
  
        accion: 'crearProducto',
  
        datos: {
  
          codigo: codigo,
  
          nombre: nombre,
  
          categoriaId:
            categoria
              ? Number(categoria)
              : '',
  
          unidadMedida: unidad,
  
          precioVenta: precio,
  
          costoUnitario: costo,
  
          activo: activo
  
        }
  
      });
  
  
      /*
       * Verificar respuesta del backend
       */
      if (!respuesta.ok) {
  
        throw new Error(
          respuesta.mensaje ||
          'No se pudo crear el producto.'
        );
  
      }
  
  
      /*
       * Confirmación
       */
      alert(
        'Producto creado correctamente.\n\n' +
        'Código: ' + respuesta.producto.CODIGO +
        '\nNombre: ' + respuesta.producto.NOMBRE
      );
  
  
      /*
       * Volver al listado
       */
      cargarProductos();
  
  
    } catch (error) {
  
      console.error(
        'Error al crear producto:',
        error
      );
  
      alert(
        'No se pudo crear el producto.\n\n' +
        error.message
      );
  
  
    } finally {
  
      if (boton) {
        boton.disabled = false;
        boton.textContent = 'Guardar producto';
      }
  
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
