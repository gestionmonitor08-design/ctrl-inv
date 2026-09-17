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
    
    if (nombreVista === 'categorias') {
      cargarCategorias();
    }  
    
    if (nombreVista === 'proveedores') {
      cargarProveedores();
    }    

    if (nombreVista === 'clientes') {
      cargarClientes();
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
      const respuesta = await apiGet({accion:'productos'});
  
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

    const activo =
      producto.ACTIVO === true ||
      producto.ACTIVO === 'TRUE' ||
      producto.ACTIVO === 1 ||
      producto.ACTIVO === '1';

    filas += `
      <tr data-activo="${activo ? 'true' : 'false'}">

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
          <span style="
            display:inline-block;
            padding:4px 9px;
            border-radius:12px;
            font-size:11px;
            font-weight:600;
            background:${activo ? '#e8f5e9' : '#ffebee'};
            color:${activo ? 'var(--color-success)' : 'var(--color-danger)'};
          ">
            ${activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>

        <td style="
          text-align:center;
          padding:12px;
          border-bottom:1px solid var(--color-border);
          white-space:nowrap;
        ">

          <button
            class="btn-editar-producto"
            data-id="${producto.ID_PRODUCTO}"
            style="
              border:1px solid var(--color-border);
              background:white;
              color:var(--color-primary);
              padding:7px 12px;
              border-radius:7px;
              cursor:pointer;
              font-size:12px;
              font-weight:600;
              margin-right:5px;
            "
          >
            Editar
          </button>

          <button
            class="btn-estado-producto"
            data-id="${producto.ID_PRODUCTO}"
            data-activo="${activo ? 'true' : 'false'}"
            style="
              border:1px solid var(--color-border);
              background:white;
              color:${activo ? 'var(--color-danger)' : 'var(--color-success)'};
              padding:7px 12px;
              border-radius:7px;
              cursor:pointer;
              font-size:12px;
              font-weight:600;
            "
          >
            ${activo ? 'Desactivar' : 'Activar'}
          </button>

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


      <div
        style="
          display:grid;
          grid-template-columns:minmax(250px,1fr) 180px;
          gap:12px;
          margin-bottom:18px;
        "
      >

        <input
          type="text"
          id="buscarProducto"
          placeholder="Buscar por código o nombre..."
          style="
            width:100%;
            padding:10px 12px;
            border:1px solid var(--color-border);
            border-radius:8px;
            font-size:13px;
          "
        >

        <select
          id="filtroEstadoProducto"
          style="
            width:100%;
            padding:10px 12px;
            border:1px solid var(--color-border);
            border-radius:8px;
            font-size:13px;
            background:white;
          "
        >

          <option value="todos">
            Todos
          </option>

          <option value="activos">
            Activos
          </option>

          <option value="inactivos">
            Inactivos
          </option>

        </select>

      </div>


      <div class="panel-body">

        <div style="overflow-x:auto;">

          <table
            id="tablaProductos"
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

                <th style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);">
                  Acciones
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


  /*
   * Botones Editar
   */
  document
    .querySelectorAll('.btn-editar-producto')
    .forEach(function (boton) {

      boton.addEventListener('click', function () {

        const idProducto =
          Number(
            boton.getAttribute('data-id')
          );

        mostrarFormularioEditarProducto(idProducto);

      });

    });


  /*
   * Botones Activar / Desactivar
   */
  document
    .querySelectorAll('.btn-estado-producto')
    .forEach(function (boton) {

      boton.addEventListener('click', function () {

        const idProducto =
          Number(
            boton.getAttribute('data-id')
          );

        const activo =
          boton.getAttribute('data-activo') === 'true';

        cambiarEstadoProductoFrontend(
          idProducto,
          !activo
        );

      });

    });


  /*
   * Búsqueda de productos
   */
  const buscarProducto =
    document.getElementById('buscarProducto');

  const filtroEstadoProducto =
    document.getElementById('filtroEstadoProducto');


  if (buscarProducto) {

    buscarProducto.addEventListener(
      'input',
      aplicarFiltrosProductos
    );

  }


  if (filtroEstadoProducto) {

    filtroEstadoProducto.addEventListener(
      'change',
      aplicarFiltrosProductos
    );

  }

}

  const buscarProducto =
    document.getElementById('buscarProducto');
  
  const filtroEstadoProducto =
    document.getElementById('filtroEstadoProducto');
  
  
  if (buscarProducto) {
  
    buscarProducto.addEventListener(
      'input',
      aplicarFiltrosProductos
    );
  
  }
  
  
  if (filtroEstadoProducto) {
  
    filtroEstadoProducto.addEventListener(
      'change',
      aplicarFiltrosProductos
    );
  
  }

function aplicarFiltrosProductos() {

  const campoBusqueda =
    document.getElementById('buscarProducto');

  const selectorEstado =
    document.getElementById('filtroEstadoProducto');


  if (!campoBusqueda || !selectorEstado) {
    return;
  }


  const texto =
    campoBusqueda.value
      .trim()
      .toLowerCase();


  const estado =
    selectorEstado.value;


  const filas =
    document.querySelectorAll(
      '#tablaProductos tbody tr'
    );


  filas.forEach(function (fila) {

    const textoFila =
      fila.textContent.toLowerCase();


    const coincideBusqueda =
      !texto ||
      textoFila.includes(texto);


    const activo =
      fila.getAttribute('data-activo') === 'true';


    let coincideEstado = true;


    if (estado === 'activos') {
      coincideEstado = activo;
    }


    if (estado === 'inactivos') {
      coincideEstado = !activo;
    }


    fila.style.display =
      coincideBusqueda && coincideEstado
        ? ''
        : 'none';

  });

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

function mostrarFormularioEditarProducto(idProducto) {

  const contenedor =
    document.getElementById('vista-productos');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <p>Cargando producto...</p>
      </div>
    </div>
  `;

  cargarProductoParaEditar(idProducto);
}

  async function cargarProductoParaEditar(idProducto) {
  
    const contenedor =
      document.getElementById('vista-productos');
  
    try {
  
      const respuesta = await apiGet({
        accion: 'producto',
        idProducto: idProducto
      });
  
      if (!respuesta.ok) {
        throw new Error(
          respuesta.mensaje ||
          'No se pudo obtener el producto.'
        );
      }
  
      const producto = respuesta.datos;
  
      if (!producto) {
        throw new Error(
          'No se encontró el producto.'
        );
      }
  
      mostrarFormularioEditarProductoDatos(producto);
  
    } catch (error) {
  
      console.error(
        'Error al cargar producto:',
        error
      );
  
      contenedor.innerHTML = `
        <div class="panel">
          <div class="panel-body">
  
            <div class="estado-inicial">
  
              <div class="estado-icono">
                !
              </div>
  
              <div>
                <h3>Error al cargar producto</h3>
                <p>${error.message}</p>
              </div>
  
            </div>
  
          </div>
        </div>
      `;
    }
  }

function mostrarFormularioEditarProductoDatos(producto) {

  const contenedor =
    document.getElementById('vista-productos');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>
        <h1>Editar producto</h1>
        <p>Modificar la información del producto</p>
      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>
          <h2>Datos del producto</h2>
          <p>
            Modifique la información que desea actualizar.
          </p>
        </div>

      </div>


      <div class="panel-body">

        <form id="formEditarProducto">


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
                id="editarProductoCodigo"
                value="${producto.codigo || ''}"
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
                id="editarProductoNombre"
                value="${producto.nombre || ''}"
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
                id="editarProductoCategoria"
                value="${producto.categoriaId || ''}"
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
                id="editarProductoUnidad"
                value="${producto.unidadMedida || ''}"
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
                id="editarProductoPrecio"
                value="${Number(producto.precioVenta || 0)}"
                min="0"
                step="0.01"
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
                id="editarProductoCosto"
                value="${Number(producto.costoUnitario || 0)}"
                min="0"
                step="0.01"
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
                id="editarProductoActivo"
                ${producto.activo ? 'checked' : ''}
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
              id="btnCancelarEditarProducto"
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
              Guardar cambios
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
    .getElementById('btnCancelarEditarProducto')
    .addEventListener('click', function () {

      cargarProductos();

    });


  /*
   * Guardar cambios
   */

  document
    .getElementById('formEditarProducto')
    .addEventListener('submit', function (evento) {

      guardarEdicionProducto(
        evento,
        producto.ID_PRODUCTO || producto.idProducto
      );

    });

}

  async function guardarEdicionProducto(evento, idProducto) {
  
    evento.preventDefault();
  
    const boton =
      document.querySelector(
        '#formEditarProducto button[type="submit"]'
      );
  
    if (boton) {
      boton.disabled = true;
      boton.textContent = 'Guardando...';
    }
  
  
    try {
  
      const codigo =
        document
          .getElementById('editarProductoCodigo')
          .value
          .trim();
  
      const nombre =
        document
          .getElementById('editarProductoNombre')
          .value
          .trim();
  
      const categoria =
        document
          .getElementById('editarProductoCategoria')
          .value;
  
      const unidad =
        document
          .getElementById('editarProductoUnidad')
          .value
          .trim();
  
      const precio =
        Number(
          document
            .getElementById('editarProductoPrecio')
            .value
        ) || 0;
  
      const costo =
        Number(
          document
            .getElementById('editarProductoCosto')
            .value
        ) || 0;
  
      const activo =
        document
          .getElementById('editarProductoActivo')
          .checked;
  
  
      /*
       * Validaciones básicas
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
  
      if (precio < 0) {
        throw new Error(
          'El precio de venta no puede ser negativo.'
        );
      }
  
      if (costo < 0) {
        throw new Error(
          'El costo unitario no puede ser negativo.'
        );
      }
  
  
      /*
       * Enviar cambios al backend
       */
  
      const respuesta = await apiPost({
  
        accion: 'editarProducto',
  
        idProducto: Number(idProducto),
  
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
       * Verificar respuesta
       */
  
      if (!respuesta.ok) {
  
        throw new Error(
          respuesta.mensaje ||
          'No se pudo actualizar el producto.'
        );
  
      }
  
  
      /*
       * Confirmación
       */
  
      alert(
        'Producto actualizado correctamente.'
      );
  
  
      /*
       * Volver al listado
       */
  
      cargarProductos();
  
  
    } catch (error) {
  
      console.error(
        'Error al editar producto:',
        error
      );
  
      alert(
        'No se pudo actualizar el producto.\n\n' +
        error.message
      );
  
  
    } finally {
  
      if (boton) {
        boton.disabled = false;
        boton.textContent = 'Guardar cambios';
      }
  
    }
  
  }

  async function cambiarEstadoProductoFrontend(idProducto, nuevoEstado) {
  
    const accionTexto =
      nuevoEstado
        ? 'activar'
        : 'desactivar';
  
  
    const confirmar =
      confirm(
        '¿Está seguro de que desea ' +
        accionTexto +
        ' este producto?'
      );
  
  
    if (!confirmar) {
      return;
    }
  
  
    try {
  
      const respuesta =
        await apiPost({
  
          accion:
            'cambiarEstadoProducto',
  
          idProducto:
            Number(idProducto),
  
          activo:
            nuevoEstado
  
        });
  
  
      if (!respuesta.ok) {
  
        throw new Error(
          respuesta.mensaje ||
          'No se pudo cambiar el estado del producto.'
        );
  
      }
  
  
      alert(
        respuesta.mensaje ||
        'Estado actualizado correctamente.'
      );
  
  
      cargarProductos();
  
  
    } catch (error) {
  
      console.error(
        'Error al cambiar estado del producto:',
        error
      );
  
  
      alert(
        'No se pudo cambiar el estado del producto.\n\n' +
        error.message
      );
  
    }
  
  }

/*
 * ============================================================
 * MÓDULO: CATEGORÍAS
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * Cargar categorías
 * ------------------------------------------------------------
 */
async function cargarCategorias() {

  const contenedor =
    document.getElementById('vista-categorias');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <p>Cargando categorías...</p>
      </div>
    </div>
  `;

  try {

    const respuesta =
      await apiGet({
        accion: 'categorias'
      });

    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudieron cargar las categorías.'
      );

    }

    mostrarCategorias(respuesta.datos);

  } catch (error) {

    console.error(
      'Error al cargar categorías:',
      error
    );

    contenedor.innerHTML = `
      <div class="panel">
        <div class="panel-body">

          <div class="estado-inicial">

            <div class="estado-icono">
              !
            </div>

            <div>
              <h3>Error al cargar categorías</h3>
              <p>${error.message}</p>
            </div>

          </div>

        </div>
      </div>
    `;
  }
}


/*
 * ------------------------------------------------------------
 * Mostrar categorías
 * ------------------------------------------------------------
 */
function mostrarCategorias(categorias) {

  const contenedor =
    document.getElementById('vista-categorias');

  if (!contenedor) {
    return;
  }

  if (!Array.isArray(categorias)) {
    categorias = [];
  }

  let filas = '';

  categorias.forEach(function(categoria) {

    const activo =
      categoria.ACTIVO === true ||
      categoria.ACTIVO === 'TRUE' ||
      categoria.ACTIVO === 1 ||
      categoria.ACTIVO === '1';

    filas += `
      <tr
        data-activo="${activo ? 'true' : 'false'}"
        style="
          border-bottom:1px solid var(--color-border);
        "
      >

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${categoria.ID_CATEGORIA}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${categoria.NOMBRE}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${categoria.DESCRIPCION || ''}
        </td>

        <td style="
          text-align:center;
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          <span style="
            display:inline-block;
            padding:4px 9px;
            border-radius:12px;
            font-size:11px;
            font-weight:600;
            background:${activo ? '#e8f5e9' : '#ffebee'};
            color:${activo
              ? 'var(--color-success)'
              : 'var(--color-danger)'};
          ">
            ${activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>

        <td style="
          text-align:center;
          padding:12px;
          border-bottom:1px solid var(--color-border);
          white-space:nowrap;
        ">

          <button
            class="btn-editar-categoria"
            data-id="${categoria.ID_CATEGORIA}"
            style="
              border:1px solid var(--color-border);
              background:white;
              color:var(--color-primary);
              padding:7px 12px;
              border-radius:7px;
              cursor:pointer;
              font-size:12px;
              font-weight:600;
              margin-right:5px;
            "
          >
            Editar
          </button>

          <button
            class="btn-estado-categoria"
            data-id="${categoria.ID_CATEGORIA}"
            data-activo="${activo ? 'true' : 'false'}"
            style="
              border:1px solid var(--color-border);
              background:white;
              color:${activo
                ? 'var(--color-danger)'
                : 'var(--color-success)'};
              padding:7px 12px;
              border-radius:7px;
              cursor:pointer;
              font-size:12px;
              font-weight:600;
            "
          >
            ${activo ? 'Desactivar' : 'Activar'}
          </button>

        </td>

      </tr>
    `;
  });


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>
        <h1>Categorías</h1>

        <p>
          Administración de categorías de productos
        </p>
      </div>

      <div>

        <button
          id="btnNuevaCategoria"
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
          + Nueva categoría
        </button>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>

          <h2>Categorías registradas</h2>

          <p>
            Administre las categorías disponibles
            para sus productos.
          </p>

        </div>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:minmax(250px,1fr) 180px;
          gap:12px;
          margin-bottom:18px;
        "
      >

        <input
          type="text"
          id="buscarCategoria"
          placeholder="Buscar por nombre o descripción..."
          style="
            width:100%;
            padding:10px 12px;
            border:1px solid var(--color-border);
            border-radius:8px;
            font-size:13px;
          "
        >

        <select
          id="filtroEstadoCategoria"
          style="
            width:100%;
            padding:10px 12px;
            border:1px solid var(--color-border);
            border-radius:8px;
            font-size:13px;
            background:white;
          "
        >

          <option value="todos">
            Todos
          </option>

          <option value="activos">
            Activos
          </option>

          <option value="inactivos">
            Inactivos
          </option>

        </select>

      </div>


      <div class="panel-body">

        <div style="overflow-x:auto;">

          <table
            id="tablaCategorias"
            style="
              width:100%;
              border-collapse:collapse;
              font-size:13px;
            "
          >

            <thead>

              <tr>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  ID
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Nombre
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Descripción
                </th>

                <th style="
                  text-align:center;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Estado
                </th>

                <th style="
                  text-align:center;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Acciones
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
   * Nuevo
   */
  const btnNuevaCategoria =
    document.getElementById('btnNuevaCategoria');

  if (btnNuevaCategoria) {

    btnNuevaCategoria.addEventListener(
      'click',
      mostrarFormularioNuevaCategoria
    );

  }


  /*
   * Editar
   */
  document
    .querySelectorAll('.btn-editar-categoria')
    .forEach(function(boton) {

      boton.addEventListener(
        'click',
        function() {

          const idCategoria =
            Number(
              boton.getAttribute('data-id')
            );

          mostrarFormularioEditarCategoria(
            idCategoria
          );

        }
      );

    });


  /*
   * Estado
   */
  document
    .querySelectorAll('.btn-estado-categoria')
    .forEach(function(boton) {

      boton.addEventListener(
        'click',
        function() {

          const idCategoria =
            Number(
              boton.getAttribute('data-id')
            );

          const activo =
            boton.getAttribute('data-activo') === 'true';

          cambiarEstadoCategoriaFrontend(
            idCategoria,
            !activo
          );

        }
      );

    });


  /*
   * Búsqueda
   */
  const buscarCategoria =
    document.getElementById('buscarCategoria');

  const filtroEstadoCategoria =
    document.getElementById(
      'filtroEstadoCategoria'
    );


  if (buscarCategoria) {

    buscarCategoria.addEventListener(
      'input',
      aplicarFiltrosCategorias
    );

  }


  if (filtroEstadoCategoria) {

    filtroEstadoCategoria.addEventListener(
      'change',
      aplicarFiltrosCategorias
    );

  }

}


/*
 * ------------------------------------------------------------
 * Filtros
 * ------------------------------------------------------------
 */
function aplicarFiltrosCategorias() {

  const campoBusqueda =
    document.getElementById(
      'buscarCategoria'
    );

  const selectorEstado =
    document.getElementById(
      'filtroEstadoCategoria'
    );

  if (!campoBusqueda || !selectorEstado) {
    return;
  }

  const texto =
    campoBusqueda.value
      .trim()
      .toLowerCase();

  const estado =
    selectorEstado.value;

  const filas =
    document.querySelectorAll(
      '#tablaCategorias tbody tr'
    );

  filas.forEach(function(fila) {

    const textoFila =
      fila.textContent.toLowerCase();

    const coincideBusqueda =
      !texto ||
      textoFila.includes(texto);

    const activo =
      fila.getAttribute(
        'data-activo'
      ) === 'true';

    let coincideEstado = true;

    if (estado === 'activos') {
      coincideEstado = activo;
    }

    if (estado === 'inactivos') {
      coincideEstado = !activo;
    }

    fila.style.display =
      coincideBusqueda && coincideEstado
        ? ''
        : 'none';

  });

}


/*
 * ------------------------------------------------------------
 * Formulario nueva categoría
 * ------------------------------------------------------------
 */
function mostrarFormularioNuevaCategoria() {

  const contenedor =
    document.getElementById(
      'vista-categorias'
    );

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>

        <h1>Nueva categoría</h1>

        <p>
          Registrar una nueva categoría
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>

          <h2>Datos de la categoría</h2>

          <p>
            Complete la información requerida.
          </p>

        </div>

      </div>


      <div class="panel-body">

        <form id="formNuevaCategoria">


          <div style="
            display:grid;
            grid-template-columns:1fr;
            gap:18px;
          ">


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
                id="categoriaNombre"
                required
                maxlength="100"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Descripción
              </label>

              <textarea
                id="categoriaDescripcion"
                maxlength="250"
                rows="4"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                  resize:vertical;
                "
              ></textarea>

            </div>


          </div>


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
                id="categoriaActivo"
                checked
              >

              Categoría activa

            </label>

          </div>


          <div style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:22px;
          ">

            <button
              type="button"
              id="btnCancelarNuevaCategoria"
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
              Guardar categoría
            </button>

          </div>


        </form>

      </div>

    </div>
  `;


  document
    .getElementById(
      'btnCancelarNuevaCategoria'
    )
    .addEventListener(
      'click',
      cargarCategorias
    );


  document
    .getElementById(
      'formNuevaCategoria'
    )
    .addEventListener(
      'submit',
      guardarNuevaCategoria
    );

}


/*
 * ------------------------------------------------------------
 * Guardar nueva categoría
 * ------------------------------------------------------------
 */
async function guardarNuevaCategoria(evento) {

  evento.preventDefault();

  const boton =
    document.querySelector(
      '#formNuevaCategoria button[type="submit"]'
    );

  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Guardando...';

  }


  try {

    const nombre =
      document
        .getElementById(
          'categoriaNombre'
        )
        .value
        .trim();

    const descripcion =
      document
        .getElementById(
          'categoriaDescripcion'
        )
        .value
        .trim();

    const activo =
      document
        .getElementById(
          'categoriaActivo'
        )
        .checked;


    if (!nombre) {

      throw new Error(
        'El nombre de la categoría es obligatorio.'
      );

    }


    const respuesta =
      await apiPost({

        accion: 'crearCategoria',

        datos: {

          nombre: nombre,

          descripcion: descripcion,

          activo: activo

        }

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo crear la categoría.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Categoría creada correctamente.'
    );


    cargarCategorias();


  } catch (error) {

    console.error(
      'Error al crear categoría:',
      error
    );

    alert(
      'No se pudo crear la categoría.\n\n' +
      error.message
    );


  } finally {

    if (boton) {

      boton.disabled = false;
      boton.textContent =
        'Guardar categoría';

    }

  }

}


/*
 * ------------------------------------------------------------
 * Formulario editar categoría
 * ------------------------------------------------------------
 */
function mostrarFormularioEditarCategoria(
  idCategoria
) {

  const contenedor =
    document.getElementById(
      'vista-categorias'
    );

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <div class="panel">

      <div class="panel-body">

        <p>
          Cargando categoría...
        </p>

      </div>

    </div>

  `;


  cargarCategoriaParaEditar(
    idCategoria
  );

}


/*
 * ------------------------------------------------------------
 * Cargar categoría para editar
 * ------------------------------------------------------------
 */
async function cargarCategoriaParaEditar(
  idCategoria
) {

  const contenedor =
    document.getElementById(
      'vista-categorias'
    );

  try {

    const respuesta =
      await apiGet({

        accion: 'categoria',

        idCategoria: idCategoria

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo obtener la categoría.'
      );

    }


    const categoria =
      respuesta.datos;


    if (!categoria) {

      throw new Error(
        'No se encontró la categoría.'
      );

    }


    mostrarFormularioEditarCategoriaDatos(
      categoria
    );


  } catch (error) {

    console.error(
      'Error al cargar categoría:',
      error
    );


    contenedor.innerHTML = `

      <div class="panel">

        <div class="panel-body">

          <div class="estado-inicial">

            <div class="estado-icono">
              !
            </div>

            <div>

              <h3>
                Error al cargar categoría
              </h3>

              <p>
                ${error.message}
              </p>

            </div>

          </div>

        </div>

      </div>

    `;

  }

}


/*
 * ------------------------------------------------------------
 * Mostrar formulario de edición
 * ------------------------------------------------------------
 */
function mostrarFormularioEditarCategoriaDatos(
  categoria
) {

  const contenedor =
    document.getElementById(
      'vista-categorias'
    );

  if (!contenedor) {
    return;
  }


  const activo =
    categoria.activo === true ||
    categoria.activo === 'TRUE' ||
    categoria.activo === 'true' ||
    categoria.activo === 1 ||
    categoria.activo === '1';


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>

        <h1>Editar categoría</h1>

        <p>
          Modificar la información de la categoría
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>

          <h2>Datos de la categoría</h2>

          <p>
            Modifique la información que desea actualizar.
          </p>

        </div>

      </div>


      <div class="panel-body">

        <form id="formEditarCategoria">


          <div style="
            display:grid;
            grid-template-columns:1fr;
            gap:18px;
          ">


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
                id="editarCategoriaNombre"
                value="${categoria.nombre || ''}"
                required
                maxlength="100"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Descripción
              </label>

              <textarea
                id="editarCategoriaDescripcion"
                maxlength="250"
                rows="4"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                  resize:vertical;
                "
              >${categoria.descripcion || ''}</textarea>

            </div>


          </div>


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
                id="editarCategoriaActivo"
                ${activo ? 'checked' : ''}
              >

              Categoría activa

            </label>

          </div>


          <div style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:22px;
          ">

            <button
              type="button"
              id="btnCancelarEditarCategoria"
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
              Guardar cambios
            </button>

          </div>


        </form>

      </div>

    </div>
  `;


  document
    .getElementById(
      'btnCancelarEditarCategoria'
    )
    .addEventListener(
      'click',
      cargarCategorias
    );


  document
    .getElementById(
      'formEditarCategoria'
    )
    .addEventListener(
      'submit',
      function(evento) {

        guardarEdicionCategoria(
          evento,
          categoria.idCategoria ||
          categoria.ID_CATEGORIA
        );

      }
    );

}


/*
 * ------------------------------------------------------------
 * Guardar edición
 * ------------------------------------------------------------
 */
async function guardarEdicionCategoria(
  evento,
  idCategoria
) {

  evento.preventDefault();


  const boton =
    document.querySelector(
      '#formEditarCategoria button[type="submit"]'
    );


  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Guardando...';

  }


  try {

    const nombre =
      document
        .getElementById(
          'editarCategoriaNombre'
        )
        .value
        .trim();

    const descripcion =
      document
        .getElementById(
          'editarCategoriaDescripcion'
        )
        .value
        .trim();

    const activo =
      document
        .getElementById(
          'editarCategoriaActivo'
        )
        .checked;


    if (!nombre) {

      throw new Error(
        'El nombre de la categoría es obligatorio.'
      );

    }


    const respuesta =
      await apiPost({

        accion: 'editarCategoria',

        idCategoria:
          Number(idCategoria),

        datos: {

          nombre: nombre,

          descripcion: descripcion,

          activo: activo

        }

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo actualizar la categoría.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Categoría actualizada correctamente.'
    );


    cargarCategorias();


  } catch (error) {

    console.error(
      'Error al editar categoría:',
      error
    );


    alert(
      'No se pudo actualizar la categoría.\n\n' +
      error.message
    );


  } finally {

    if (boton) {

      boton.disabled = false;
      boton.textContent =
        'Guardar cambios';

    }

  }

}


/*
 * ------------------------------------------------------------
 * Activar / desactivar
 * ------------------------------------------------------------
 */
async function cambiarEstadoCategoriaFrontend(
  idCategoria,
  nuevoEstado
) {

  const accionTexto =
    nuevoEstado
      ? 'activar'
      : 'desactivar';


  const confirmar =
    confirm(
      '¿Está seguro de que desea ' +
      accionTexto +
      ' esta categoría?'
    );


  if (!confirmar) {
    return;
  }


  try {

    const respuesta =
      await apiPost({

        accion:
          'cambiarEstadoCategoria',

        idCategoria:
          Number(idCategoria),

        activo:
          nuevoEstado

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo cambiar el estado de la categoría.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Estado actualizado correctamente.'
    );


    cargarCategorias();


  } catch (error) {

    console.error(
      'Error al cambiar estado de categoría:',
      error
    );


    alert(
      'No se pudo cambiar el estado de la categoría.\n\n' +
      error.message
    );

  }

}

/*
 * ============================================================
 * MÓDULO: PROVEEDORES
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * Cargar proveedores
 * ------------------------------------------------------------
 */
async function cargarProveedores() {

  const contenedor =
    document.getElementById('vista-proveedores');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <p>Cargando proveedores...</p>
      </div>
    </div>
  `;

  try {

    const respuesta =
      await apiGet({
        accion: 'proveedores'
      });

    if (!respuesta.ok) {
      throw new Error(
        respuesta.mensaje ||
        'No se pudieron cargar los proveedores.'
      );
    }

    mostrarProveedores(respuesta.datos);

  } catch (error) {

    console.error(
      'Error al cargar proveedores:',
      error
    );

    contenedor.innerHTML = `
      <div class="panel">
        <div class="panel-body">

          <div class="estado-inicial">

            <div class="estado-icono">
              !
            </div>

            <div>
              <h3>Error al cargar proveedores</h3>
              <p>${error.message}</p>
            </div>

          </div>

        </div>
      </div>
    `;
  }
}


/*
 * ------------------------------------------------------------
 * Mostrar proveedores
 * ------------------------------------------------------------
 */
function mostrarProveedores(proveedores) {

  const contenedor =
    document.getElementById('vista-proveedores');

  if (!contenedor) {
    return;
  }

  if (!Array.isArray(proveedores)) {
    proveedores = [];
  }

  let filas = '';

  proveedores.forEach(function(proveedor) {

    const activo =
      proveedor.ACTIVO === true ||
      proveedor.ACTIVO === 'TRUE' ||
      proveedor.ACTIVO === 1 ||
      proveedor.ACTIVO === '1';

    filas += `
      <tr
        data-activo="${activo ? 'true' : 'false'}"
        style="
          border-bottom:1px solid var(--color-border);
        "
      >

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.ID_PROVEEDOR}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.NOMBRE || ''}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.DOCUMENTO || ''}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.TELEFONO || ''}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.EMAIL || ''}
        </td>

        <td style="
          padding:12px;
          border-bottom:1px solid var(--color-border);
        ">
          ${proveedor.DIRECCION || ''}
        </td>

        <td style="
          padding:12px;
          text-align:center;
          border-bottom:1px solid var(--color-border);
        ">

          <span
            style="
              display:inline-block;
              padding:4px 9px;
              border-radius:12px;
              font-size:11px;
              font-weight:600;
              background:${
                activo
                  ? 'var(--color-success-light, #dcfce7)'
                  : 'var(--color-danger-light, #fee2e2)'
              };
              color:${
                activo
                  ? 'var(--color-success, #166534)'
                  : 'var(--color-danger, #991b1b)'
              };
            "
          >
            ${activo ? 'Activo' : 'Inactivo'}
          </span>

        </td>

        <td style="
          padding:12px;
          text-align:center;
          border-bottom:1px solid var(--color-border);
        ">

          <div style="
            display:flex;
            justify-content:center;
            gap:6px;
            flex-wrap:wrap;
          ">

            <button
              type="button"
              class="btn-editar-proveedor"
              data-id="${proveedor.ID_PROVEEDOR}"
              style="
                border:1px solid var(--color-border);
                background:white;
                padding:7px 10px;
                border-radius:7px;
                cursor:pointer;
                font-size:12px;
              "
            >
              Editar
            </button>

            <button
              type="button"
              class="btn-estado-proveedor"
              data-id="${proveedor.ID_PROVEEDOR}"
              data-activo="${activo ? 'true' : 'false'}"
              style="
                border:none;
                background:var(--color-primary);
                color:white;
                padding:7px 10px;
                border-radius:7px;
                cursor:pointer;
                font-size:12px;
              "
            >
              ${activo ? 'Desactivar' : 'Activar'}
            </button>

          </div>

        </td>

      </tr>
    `;
  });


  /*
   * Si no existen proveedores
   */
  if (!filas) {

    filas = `
      <tr>
        <td
          colspan="8"
          style="
            padding:30px;
            text-align:center;
            color:var(--color-text-secondary);
          "
        >
          No hay proveedores registrados.
        </td>
      </tr>
    `;
  }


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>
        <h1>Proveedores</h1>

        <p>
          Gestionar proveedores del sistema
        </p>
      </div>

      <div>
        <button
          type="button"
          id="btnNuevoProveedor"
          style="
            border:none;
            background:var(--color-primary);
            color:white;
            padding:10px 16px;
            border-radius:8px;
            cursor:pointer;
            font-size:13px;
            font-weight:600;
          "
        >
          + Nuevo proveedor
        </button>
      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>
          <h2>Listado de proveedores</h2>

          <p>
            Consulte y administre los proveedores registrados.
          </p>
        </div>

      </div>


      <div class="panel-body">

        <div style="
          display:grid;
          grid-template-columns:2fr 1fr;
          gap:12px;
          margin-bottom:18px;
        ">

          <input
            type="text"
            id="buscarProveedor"
            placeholder="Buscar por nombre, documento, teléfono o correo..."
            style="
              width:100%;
              padding:10px 12px;
              border:1px solid var(--color-border);
              border-radius:8px;
              font-size:13px;
            "
          >

          <select
            id="filtroEstadoProveedor"
            style="
              width:100%;
              padding:10px 12px;
              border:1px solid var(--color-border);
              border-radius:8px;
              font-size:13px;
              background:white;
            "
          >

            <option value="todos">
              Todos
            </option>

            <option value="activos">
              Activos
            </option>

            <option value="inactivos">
              Inactivos
            </option>

          </select>

        </div>


        <div style="
          overflow-x:auto;
        ">

          <table
            id="tablaProveedores"
            style="
              width:100%;
              border-collapse:collapse;
              font-size:13px;
            "
          >

            <thead>

              <tr>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  ID
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Nombre
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Documento
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Teléfono
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Email
                </th>

                <th style="
                  text-align:left;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Dirección
                </th>

                <th style="
                  text-align:center;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Estado
                </th>

                <th style="
                  text-align:center;
                  padding:12px;
                  border-bottom:1px solid var(--color-border);
                ">
                  Acciones
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
   * Nuevo proveedor
   */
  const btnNuevoProveedor =
    document.getElementById('btnNuevoProveedor');

  if (btnNuevoProveedor) {

    btnNuevoProveedor.addEventListener(
      'click',
      mostrarFormularioNuevoProveedor
    );

  }


  /*
   * Editar proveedor
   */
  document
    .querySelectorAll('.btn-editar-proveedor')
    .forEach(function(boton) {

      boton.addEventListener(
        'click',
        function() {

          const idProveedor =
            Number(
              boton.getAttribute('data-id')
            );

          mostrarFormularioEditarProveedor(
            idProveedor
          );

        }
      );

    });


  /*
   * Activar / desactivar
   */
  document
    .querySelectorAll('.btn-estado-proveedor')
    .forEach(function(boton) {

      boton.addEventListener(
        'click',
        function() {

          const idProveedor =
            Number(
              boton.getAttribute('data-id')
            );

          const activo =
            boton.getAttribute('data-activo') === 'true';

          cambiarEstadoProveedorFrontend(
            idProveedor,
            !activo
          );

        }
      );

    });


  /*
   * Búsqueda
   */
  const buscarProveedor =
    document.getElementById('buscarProveedor');

  const filtroEstadoProveedor =
    document.getElementById(
      'filtroEstadoProveedor'
    );


  if (buscarProveedor) {

    buscarProveedor.addEventListener(
      'input',
      aplicarFiltrosProveedores
    );

  }


  if (filtroEstadoProveedor) {

    filtroEstadoProveedor.addEventListener(
      'change',
      aplicarFiltrosProveedores
    );

  }

}


/*
 * ------------------------------------------------------------
 * Filtros
 * ------------------------------------------------------------
 */
function aplicarFiltrosProveedores() {

  const campoBusqueda =
    document.getElementById(
      'buscarProveedor'
    );

  const selectorEstado =
    document.getElementById(
      'filtroEstadoProveedor'
    );

  if (!campoBusqueda || !selectorEstado) {
    return;
  }


  const texto =
    campoBusqueda.value
      .trim()
      .toLowerCase();

  const estado =
    selectorEstado.value;


  const filas =
    document.querySelectorAll(
      '#tablaProveedores tbody tr'
    );


  filas.forEach(function(fila) {

    const textoFila =
      fila.textContent.toLowerCase();

    const coincideBusqueda =
      !texto ||
      textoFila.includes(texto);

    const activo =
      fila.getAttribute(
        'data-activo'
      ) === 'true';


    let coincideEstado = true;


    if (estado === 'activos') {
      coincideEstado = activo;
    }


    if (estado === 'inactivos') {
      coincideEstado = !activo;
    }


    fila.style.display =
      coincideBusqueda &&
      coincideEstado
        ? ''
        : 'none';

  });

}


/*
 * ------------------------------------------------------------
 * Formulario nuevo proveedor
 * ------------------------------------------------------------
 */
function mostrarFormularioNuevoProveedor() {

  const contenedor =
    document.getElementById(
      'vista-proveedores'
    );

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>

        <h1>Nuevo proveedor</h1>

        <p>
          Registrar un nuevo proveedor
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>

          <h2>Datos del proveedor</h2>

          <p>
            Complete la información requerida.
          </p>

        </div>

      </div>


      <div class="panel-body">

        <form id="formNuevoProveedor">

          <div style="
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px;
          ">


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
                id="proveedorNombre"
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


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Documento
              </label>

              <input
                type="text"
                id="proveedorDocumento"
                maxlength="30"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Teléfono
              </label>

              <input
                type="text"
                id="proveedorTelefono"
                maxlength="30"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Email
              </label>

              <input
                type="email"
                id="proveedorEmail"
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


            <div style="
              grid-column:1 / -1;
            ">

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Dirección
              </label>

              <textarea
                id="proveedorDireccion"
                maxlength="250"
                rows="3"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                  resize:vertical;
                "
              ></textarea>

            </div>


          </div>


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
                id="proveedorActivo"
                checked
              >

              Proveedor activo

            </label>

          </div>


          <div style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:22px;
          ">

            <button
              type="button"
              id="btnCancelarProveedor"
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
              Guardar proveedor
            </button>

          </div>


        </form>

      </div>

    </div>
  `;


  document
    .getElementById('btnCancelarProveedor')
    .addEventListener(
      'click',
      function() {
        cargarProveedores();
      }
    );


  document
    .getElementById('formNuevoProveedor')
    .addEventListener(
      'submit',
      guardarNuevoProveedor
    );

}


/*
 * ------------------------------------------------------------
 * Guardar nuevo proveedor
 * ------------------------------------------------------------
 */
async function guardarNuevoProveedor(evento) {

  evento.preventDefault();


  const boton =
    document.querySelector(
      '#formNuevoProveedor button[type="submit"]'
    );


  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Guardando...';

  }


  try {

    const nombre =
      document
        .getElementById(
          'proveedorNombre'
        )
        .value
        .trim();


    const documento =
      document
        .getElementById(
          'proveedorDocumento'
        )
        .value
        .trim();


    const telefono =
      document
        .getElementById(
          'proveedorTelefono'
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          'proveedorEmail'
        )
        .value
        .trim();


    const direccion =
      document
        .getElementById(
          'proveedorDireccion'
        )
        .value
        .trim();


    const activo =
      document
        .getElementById(
          'proveedorActivo'
        )
        .checked;


    if (!nombre) {

      throw new Error(
        'El nombre del proveedor es obligatorio.'
      );

    }


    const respuesta =
      await apiPost({

        accion:
          'crearProveedor',

        datos: {

          nombre:
            nombre,

          documento:
            documento,

          telefono:
            telefono,

          email:
            email,

          direccion:
            direccion,

          activo:
            activo

        }

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo crear el proveedor.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Proveedor creado correctamente.'
    );


    cargarProveedores();


  } catch (error) {

    console.error(
      'Error al crear proveedor:',
      error
    );


    alert(
      'No se pudo crear el proveedor.\n\n' +
      error.message
    );


  } finally {

    if (boton) {

      boton.disabled = false;
      boton.textContent =
        'Guardar proveedor';

    }

  }

}


/*
 * ------------------------------------------------------------
 * Formulario editar proveedor
 * ------------------------------------------------------------
 */
function mostrarFormularioEditarProveedor(
  idProveedor
) {

  const contenedor =
    document.getElementById(
      'vista-proveedores'
    );

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <p>Cargando proveedor...</p>
      </div>
    </div>
  `;


  cargarProveedorParaEditar(
    idProveedor
  );

}


/*
 * ------------------------------------------------------------
 * Cargar proveedor para edición
 * ------------------------------------------------------------
 */
async function cargarProveedorParaEditar(
  idProveedor
) {

  const contenedor =
    document.getElementById(
      'vista-proveedores'
    );


  try {

    /*
     * Utilizamos el endpoint existente
     * de proveedor por ID.
     */
    const respuesta =
      await apiGet({

        accion:
          'proveedor',

        idProveedor:
          idProveedor

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo obtener el proveedor.'
      );

    }


    const proveedor =
      respuesta.datos;


    if (!proveedor) {

      throw new Error(
        'No se encontró el proveedor.'
      );

    }


    mostrarFormularioEditarProveedorDatos(
      proveedor
    );


  } catch (error) {

    console.error(
      'Error al cargar proveedor:',
      error
    );


    contenedor.innerHTML = `

      <div class="panel">

        <div class="panel-body">

          <div class="estado-inicial">

            <div class="estado-icono">
              !
            </div>

            <div>

              <h3>
                Error al cargar proveedor
              </h3>

              <p>
                ${error.message}
              </p>

            </div>

          </div>

        </div>

      </div>

    `;

  }

}


/*
 * ------------------------------------------------------------
 * Mostrar formulario de edición
 * ------------------------------------------------------------
 */
function mostrarFormularioEditarProveedorDatos(
  proveedor
) {

  const contenedor =
    document.getElementById(
      'vista-proveedores'
    );


  if (!contenedor) {
    return;
  }


  const idProveedor =
    proveedor.ID_PROVEEDOR ||
    proveedor.idProveedor;


  const nombre =
    proveedor.NOMBRE ||
    proveedor.nombre ||
    '';


  const documento =
    proveedor.DOCUMENTO ||
    proveedor.documento ||
    '';


  const telefono =
    proveedor.TELEFONO ||
    proveedor.telefono ||
    '';


  const email =
    proveedor.EMAIL ||
    proveedor.email ||
    '';


  const direccion =
    proveedor.DIRECCION ||
    proveedor.direccion ||
    '';


  const activo =
    proveedor.ACTIVO === true ||
    proveedor.ACTIVO === 'TRUE' ||
    proveedor.ACTIVO === 1 ||
    proveedor.ACTIVO === '1' ||
    proveedor.activo === true;


  contenedor.innerHTML = `

    <div class="pagina-header">

      <div>

        <h1>Editar proveedor</h1>

        <p>
          Modificar la información del proveedor
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>

          <h2>Datos del proveedor</h2>

          <p>
            Modifique la información que desea actualizar.
          </p>

        </div>

      </div>


      <div class="panel-body">

        <form id="formEditarProveedor">

          <div style="
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px;
          ">


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
                id="editarProveedorNombre"
                value="${nombre}"
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


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Documento
              </label>

              <input
                type="text"
                id="editarProveedorDocumento"
                value="${documento}"
                maxlength="30"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Teléfono
              </label>

              <input
                type="text"
                id="editarProveedorTelefono"
                value="${telefono}"
                maxlength="30"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                "
              >

            </div>


            <div>

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Email
              </label>

              <input
                type="email"
                id="editarProveedorEmail"
                value="${email}"
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


            <div style="
              grid-column:1 / -1;
            ">

              <label style="
                display:block;
                font-size:13px;
                font-weight:600;
                margin-bottom:6px;
              ">
                Dirección
              </label>

              <textarea
                id="editarProveedorDireccion"
                maxlength="250"
                rows="3"
                style="
                  width:100%;
                  padding:10px 12px;
                  border:1px solid var(--color-border);
                  border-radius:8px;
                  font-size:13px;
                  resize:vertical;
                "
              >${direccion}</textarea>

            </div>


          </div>


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
                id="editarProveedorActivo"
                ${activo ? 'checked' : ''}
              >

              Proveedor activo

            </label>

          </div>


          <div style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:22px;
          ">

            <button
              type="button"
              id="btnCancelarEdicionProveedor"
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
              Guardar cambios
            </button>

          </div>


        </form>

      </div>

    </div>
  `;


  document
    .getElementById(
      'btnCancelarEdicionProveedor'
    )
    .addEventListener(
      'click',
      function() {

        cargarProveedores();

      }
    );


  document
    .getElementById(
      'formEditarProveedor'
    )
    .addEventListener(
      'submit',
      function(evento) {

        guardarEdicionProveedor(
          evento,
          idProveedor
        );

      }
    );

}


/*
 * ------------------------------------------------------------
 * Guardar edición
 * ------------------------------------------------------------
 */
async function guardarEdicionProveedor(
  evento,
  idProveedor
) {

  evento.preventDefault();


  const boton =
    document.querySelector(
      '#formEditarProveedor button[type="submit"]'
    );


  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Guardando...';

  }


  try {

    const nombre =
      document
        .getElementById(
          'editarProveedorNombre'
        )
        .value
        .trim();


    const documento =
      document
        .getElementById(
          'editarProveedorDocumento'
        )
        .value
        .trim();


    const telefono =
      document
        .getElementById(
          'editarProveedorTelefono'
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          'editarProveedorEmail'
        )
        .value
        .trim();


    const direccion =
      document
        .getElementById(
          'editarProveedorDireccion'
        )
        .value
        .trim();


    const activo =
      document
        .getElementById(
          'editarProveedorActivo'
        )
        .checked;


    if (!nombre) {

      throw new Error(
        'El nombre del proveedor es obligatorio.'
      );

    }


    const respuesta =
      await apiPost({

        accion:
          'editarProveedor',

        idProveedor:
          Number(idProveedor),

        datos: {

          nombre:
            nombre,

          documento:
            documento,

          telefono:
            telefono,

          email:
            email,

          direccion:
            direccion,

          activo:
            activo

        }

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo actualizar el proveedor.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Proveedor actualizado correctamente.'
    );


    cargarProveedores();


  } catch (error) {

    console.error(
      'Error al editar proveedor:',
      error
    );


    alert(
      'No se pudo actualizar el proveedor.\n\n' +
      error.message
    );


  } finally {

    if (boton) {

      boton.disabled = false;
      boton.textContent =
        'Guardar cambios';

    }

  }

}


/*
 * ------------------------------------------------------------
 * Activar / desactivar
 * ------------------------------------------------------------
 */
async function cambiarEstadoProveedorFrontend(
  idProveedor,
  nuevoEstado
) {

  const accionTexto =
    nuevoEstado
      ? 'activar'
      : 'desactivar';


  const confirmar =
    confirm(
      '¿Está seguro de que desea ' +
      accionTexto +
      ' este proveedor?'
    );


  if (!confirmar) {
    return;
  }


  try {

    const respuesta =
      await apiPost({

        accion:
          'cambiarEstadoProveedor',

        idProveedor:
          Number(idProveedor),

        activo:
          nuevoEstado

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo cambiar el estado del proveedor.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Estado actualizado correctamente.'
    );


    cargarProveedores();


  } catch (error) {

    console.error(
      'Error al cambiar estado del proveedor:',
      error
    );


    alert(
      'No se pudo cambiar el estado del proveedor.\n\n' +
      error.message
    );

  }

}  

/*
 * ------------------------------------------------------------
 * Cargar clientes
 * ------------------------------------------------------------
 */
async function cargarClientes() {

  const contenedor =
    document.getElementById('vista-clientes');

  if (!contenedor) {
    return;
  }

  try {

    const respuesta =
      await apiGet({
        accion: 'clientes'
      });

    if (!respuesta.ok) {
      throw new Error(
        respuesta.mensaje ||
        'No se pudieron cargar los clientes.'
      );
    }

    mostrarClientes(respuesta.datos);

  } catch (error) {

    console.error(
      'Error al cargar clientes:',
      error
    );

    contenedor.innerHTML = `
      <div class="panel">
        <div class="panel-body">

          <div class="estado-inicial">

            <div class="estado-icono">
              !
            </div>

            <div>
              <h3>Error al cargar clientes</h3>
              <p>${error.message}</p>
            </div>

          </div>

        </div>
      </div>
    `;
  }
}

/*
 * ------------------------------------------------------------
 * Mostrar clientes
 * ------------------------------------------------------------
 */
function mostrarClientes(clientes) {
  
    const contenedor =
      document.getElementById('vista-clientes');
  
    if (!contenedor) {
      return;
    }
  
    if (!Array.isArray(clientes)) {
      clientes = [];
    }
  
    let filas = '';
  
    clientes.forEach(function(cliente) {
  
      const activo =
        cliente.ACTIVO === true ||
        cliente.ACTIVO === 'TRUE' ||
        cliente.ACTIVO === 1 ||
        cliente.ACTIVO === '1';
  
      filas += `
        <tr
          data-activo="${activo ? 'true' : 'false'}"
          style="
            border-bottom:1px solid var(--color-border);
          "
        >
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.ID_CLIENTE}
          </td>
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.NOMBRE || ''}
          </td>
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.COMPAÑIA || ''}
          </td>
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.DOCUMENTO || ''}
          </td>
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.TELEFONO || ''}
          </td>
  
          <td style="
            padding:12px;
            border-bottom:1px solid var(--color-border);
          ">
            ${cliente.EMAIL || ''}
          </td>
  
          <td style="
            padding:12px;
            text-align:center;
            border-bottom:1px solid var(--color-border);
          ">
  
            <span
              style="
                display:inline-block;
                padding:4px 9px;
                border-radius:12px;
                font-size:11px;
                font-weight:600;
                background:${
                  activo
                    ? 'var(--color-success-light, #dcfce7)'
                    : 'var(--color-danger-light, #fee2e2)'
                };
                color:${
                  activo
                    ? 'var(--color-success, #166534)'
                    : 'var(--color-danger, #991b1b)'
                };
              "
            >
              ${activo ? 'Activo' : 'Inactivo'}
            </span>
  
          </td>
  
          <td style="
            padding:12px;
            text-align:center;
            border-bottom:1px solid var(--color-border);
          ">
  
            <div style="
              display:flex;
              justify-content:center;
              gap:6px;
              flex-wrap:wrap;
            ">
  
              <button
                type="button"
                class="btn-editar-cliente"
                data-id="${cliente.ID_CLIENTE}"
                style="
                  border:1px solid var(--color-border);
                  background:white;
                  padding:7px 10px;
                  border-radius:7px;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                Editar
              </button>
  
              <button
                type="button"
                class="btn-estado-cliente"
                data-id="${cliente.ID_CLIENTE}"
                data-activo="${activo ? 'true' : 'false'}"
                style="
                  border:none;
                  background:var(--color-primary);
                  color:white;
                  padding:7px 10px;
                  border-radius:7px;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                ${activo ? 'Desactivar' : 'Activar'}
              </button>
  
            </div>
  
          </td>
  
        </tr>
      `;
    });
  
    /*
     * Si no existen clientes
     */
    if (!filas) {
  
      filas = `
        <tr>
          <td
            colspan="8"
            style="
              padding:30px;
              text-align:center;
              color:var(--color-text-secondary);
            "
          >
            No hay clientes registrados.
          </td>
        </tr>
      `;
    }
  
    /*
     * Construir tabla
     */
    const tabla =
      document.getElementById('tablaClientes');
  
    if (!tabla) {
      return;
    }
  
    const tbody =
      tabla.querySelector('tbody');
  
    if (!tbody) {
      return;
    }
  
    tbody.innerHTML = filas;
  }

function abrirFormularioNuevoCliente() {

  const contenedor =
    document.getElementById('vista-clientes');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <div class="pagina-header">

      <div>
        <h1>Nuevo cliente</h1>
        <p>Registra un nuevo cliente.</p>
      </div>

    </div>

    <div class="panel">

      <div class="panel-body">

        <form id="formNuevoCliente">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
            gap:15px;
          ">

            <div>
              <label>Nombre *</label>
              <input
                type="text"
                id="clienteNombre"
                required
                style="width:100%;padding:10px;"
              >
            </div>

            <div>
              <label>Compañía</label>
              <input
                type="text"
                id="clienteCompania"
                style="width:100%;padding:10px;"
              >
            </div>

            <div>
              <label>Documento</label>
              <input
                type="text"
                id="clienteDocumento"
                style="width:100%;padding:10px;"
              >
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                id="clienteEmail"
                style="width:100%;padding:10px;"
              >
            </div>

            <div>
              <label>Teléfono</label>
              <input
                type="text"
                id="clienteTelefono"
                style="width:100%;padding:10px;"
              >
            </div>

            <div>
              <label>Dirección</label>
              <input
                type="text"
                id="clienteDireccion"
                style="width:100%;padding:10px;"
              >
            </div>

          </div>

          <div style="
            margin-top:20px;
            display:flex;
            gap:10px;
          ">

            <button
              type="submit"
              class="btn-primary"
            >
              Guardar cliente
            </button>

            <button
              type="button"
              id="btnCancelarNuevoCliente"
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>
  `;

  const formulario =
    document.getElementById(
      'formNuevoCliente'
    );
  
  if (formulario) {
  
    formulario.addEventListener(
      'submit',
      guardarNuevoCliente
    );
  
  }
  
  const btnCancelar =
    document.getElementById(
      'btnCancelarNuevoCliente'
    );

  if (btnCancelar) {

    btnCancelar.addEventListener(
      'click',
      function () {

        cambiarVista('clientes');

      }
    );

  }

}  

/*
 * Nuevo cliente
 */
const btnNuevoCliente =
  document.getElementById('btnNuevoCliente');

if (btnNuevoCliente) {

  btnNuevoCliente.addEventListener('click', function () {

    abrirFormularioNuevoCliente();

  });

}

async function guardarNuevoCliente(evento) {

  evento.preventDefault();


  const boton =
    document.querySelector(
      '#formNuevoCliente button[type="submit"]'
    );


  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Guardando...';

  }


  try {

    const nombre =
      document
        .getElementById(
          'clienteNombre'
        )
        .value
        .trim();


    const compania =
      document
        .getElementById(
          'clienteCompania'
        )
        .value
        .trim();


    const documento =
      document
        .getElementById(
          'clienteDocumento'
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          'clienteEmail'
        )
        .value
        .trim();


    const telefono =
      document
        .getElementById(
          'clienteTelefono'
        )
        .value
        .trim();


    const direccion =
      document
        .getElementById(
          'clienteDireccion'
        )
        .value
        .trim();


    if (!nombre) {

      throw new Error(
        'El nombre del cliente es obligatorio.'
      );

    }


    const respuesta =
      await apiPost({

        accion:
          'crearCliente',

        datos: {

          nombre:
            nombre,

          compania:
            compania,

          documento:
            documento,

          email:
            email,

          telefono:
            telefono,

          direccion:
            direccion

        }

      });


    if (!respuesta.ok) {

      throw new Error(
        respuesta.mensaje ||
        'No se pudo crear el cliente.'
      );

    }


    alert(
      respuesta.mensaje ||
      'Cliente creado correctamente.'
    );


    cargarClientes();


  } catch (error) {

    console.error(
      'Error al crear cliente:',
      error
    );


    alert(
      'No se pudo crear el cliente.\n\n' +
      error.message
    );


  } finally {

    if (boton) {

      boton.disabled = false;
      boton.textContent =
        'Guardar cliente';

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
