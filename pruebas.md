Pruebas sin estar autenticado en el sistema

Se realizaron pruebas locales en el marketplace Soho Boutique para verificar las funcionalidades destinadas tanto al cliente como al administrador.
Objetivo:
 Documentar los hallazgos identificados y proponer mejoras en la experiencia de usuario y en las funcionalidades del sistema.

2. Hallazgos por Sección

2.1. Página Principal
Elemento
Estado
Recomendación
Logo
Funciona correctamente
—
Menú Superior




- Enlaces
"Inicio" y "Catálogo" funcionan; "Prendas", "Accesorios" y "Perfumes" muestran datos hardcodeados
Eliminar enlaces de "Prendas", "Accesorios" y "Perfumes"; agregar filtro de categorías en "Catálogo".
Búsqueda
No funcional
Habilitar búsqueda por nombre de producto en el catálogo.
Filtros de Catálogo
Funciona, pero oculto
Mover filtros (categoría, precio, ordenar por) a la parte visible de la página.
Botones




- Ver Catálogo
Funciona correctamente
—
- Novedades
Muestra mensaje de preparación
Mostrar los últimos 10-12 productos añadidos al catálogo.
Categorías
Enlazan a páginas con datos hardcodeados
Redirigir a "Catálogo" con filtros preaplicados por categoría.
Productos Destacados
Muestra 4 productos aleatorios
Mostrar productos más vendidos o visitados.
Botones Superiores




- Buscar
No funciona
Habilitar búsqueda por nombre de producto.
- Corazón (Favoritos)
No funcional
Eliminar o definir su propósito específico.
- Carrito
Funciona correctamente con mensaje de login
—
- Avatar (Usuario)
Funciona correctamente
—


2.2. Catálogo
Elemento
Estado
Recomendación
Tarjetas de Productos
Muestran foto, categoría, nombre, precio y botón de añadir al carrito
—
- Añadir al Carrito
Funciona con mensaje de login
—
- Favoritos (Corazón)
No funcional
Habilitar para marcar productos como favoritos.
Navegación
Al hacer clic en un producto, redirige a la página del producto
—


2.3. Página de Producto
Elemento
Estado
Recomendación
Información General




- Categoría
Se muestra correctamente
—
- Nombre
Se muestra correctamente
—
- Estrellas y "Nuevo"
Siempre muestra 4 estrellas y "Nuevo"
Mostrar "Nuevo" solo si el producto tiene menos de un mes en el catálogo.
- Precio
Se muestra correctamente
—
- Cantidad
Selector numérico funciona
—
Botones




- Añadir al Carrito
Funciona con mensaje de login
—
- Favoritos
No funcional
Habilitar para marcar productos como favoritos.
- Compartir
No funcional
Habilitar para compartir el producto (URL, correo, WhatsApp).
Descripción y Reseñas




- Pestañas
Descripción funciona; reseñas no funcional
Eliminar pestaña de reseñas y mostrar solo la descripción.


3. Recomendaciones Generales
Eliminar enlaces "Prendas", "Accesorios" y "Perfumes" del menú superior.
Agregar filtro de categorías en la página de "Catálogo".
Habilitar la búsqueda por nombre de producto en el catálogo.
Mover los filtros de categoría, precio y ordenamiento a la parte visible de la página.
Mostrar los últimos 10-12 productos añadidos en la sección de "Novedades".
Redirigir las categorías "Prendas", "Accesorios" y "Perfumes" a "Catálogo" con filtros preaplicados.
Mostrar productos destacados basados en ventas o visitas.
Habilitar los botones de "Favoritos" y "Compartir" en las tarjetas de productos y páginas de producto.
Eliminar la pestaña de "Reseñas" y mostrar solo la descripción del producto.
Añadir lógica para mostrar "Nuevo" solo en productos con menos de un mes en el catálogo.
Pruebas estando autenticado en el sistema como cliente
Pruebas locales realizadas en el marketplace Soho Boutique para verificar las funcionalidades como cliente.
Objetivo:
 Documentar los hallazgos identificados y proponer mejoras en la experiencia de usuario y en las funcionalidades del sistema.

2. Hallazgos por Sección

2.1. Página Principal (Cliente Logueado)
Elemento
Estado
Recomendación
Categorías y Productos Destacados
Funcionan, pero se recomienda mostrar productos más vendidos o recientes
Mostrar productos más vendidos o los publicados más recientemente en lugar de aleatorios.
Botones




- Buscar
No funciona
Habilitar búsqueda por nombre de producto.
- Corazón (Favoritos)
No funcional
Habilitar para marcar productos como favoritos (requiere login).
- Carrito
Funciona, pero con desbordamiento de texto en el panel
Rediseñar el panel del carrito para evitar desbordamiento de texto.
- Perfil (Avatar)
Funciona correctamente
—


2.2. Carrito de Compras (Cliente Logueado)
Elemento
Estado
Recomendación
Visualización
Funciona, pero hay desbordamiento de texto en el panel del carrito
Mover el botón "Vaciar carrito" debajo del botón "Realizar pedido" para evitar desbordamiento.
Funcionalidad




- Añadir al Carrito
Funciona correctamente
—
- Vaciar Carrito
Funciona correctamente
—
- Realizar Pedido
Funciona, vacía el carrito y marca el pedido como pendiente
Permitir ver los pedidos desde una página dedicada.


2.3. Perfil (Cliente Logueado)
Elemento
Estado
Recomendación
Sección de Perfil




- Campos
Nombre, Teléfono, Correo, Fecha de Nacimiento
Asegurar que los cambios en el perfil del cliente se guarden correctamente.
- Guardar Cambios
No se confirma si se guardan los cambios
—
Botones




- Mis Pedidos
No funciona, redirige a página no encontrada
Implementar página funcional para ver pedidos.
- Configuración
No funciona, redirige a página no encontrada
Implementar página funcional para configuración (o eliminar si no es relevante para el cliente).
- Cerrar Sesión
Funciona correctamente
—


2.4. Página de Producto (Cliente Logueado)
Elemento
Estado
Recomendación
Funcionalidades




- Favoritos
No funcional
Habilitar para marcar productos como favoritos (requiere login).
- Compartir
No funcional
Habilitar para compartir el producto (URL, correo, WhatsApp) (requiere login).
- Descripción
Se muestra correctamente
Eliminar pestaña de reseñas y mostrar solo la descripción.


3. Recomendaciones Adicionales
Habilitar los botones de Favoritos y Compartir en las tarjetas de productos y páginas de producto (requiere login).
Rediseñar el panel del carrito de compras para evitar desbordamiento de texto.
Implementar páginas funcionales para "Mis Pedidos" y "Configuración" en el perfil del cliente.
Asegurar que los cambios en el perfil del cliente se guarden correctamente.
Corregir la redirección de las páginas no encontradas (Mis Pedidos, Configuración).

Pruebas estando autenticado en el sistema como admin
Pruebas locales realizadas en el marketplace Soho Boutique para verificar las funcionalidades del administrador.
Objetivo:
 Documentar los hallazgos identificados y proponer mejoras en la experiencia de usuario, funcionalidades y diseño del sistema.

2. Hallazgos por Sección

2.1. Panel de Administración

Dashboard
Elemento
Estado
Recomendación
Ventas
Datos reales: ventas totales, pedidos registrados, nuevos clientes, productos activos
—
Resumen
Funciona correctamente
—
- Contenido
Muestra ventas recientes y productos populares
—
- Botones
"Ver todas las ventas" y "Ver todos los productos" funcionan y redirigen correctamente
—
Análisis
Vacío
Agregar gráficos y métricas de negocio (ventas por mes, deudas, comparativas de inversión, etc.).
Reportes
Contiene tres opciones (ventas por periodo, clientes, deudas totales), pero no redirige a nada
Eliminar esta pestaña y gestionar los reportes desde las páginas específicas (ventas, clientes, deudas).


Productos
Elemento
Estado
Recomendación
Carga de Archivos




- SKU
Campo obligatorio para el administrador
Generar automáticamente el SKU desde el backend para evitar duplicados o errores.
- Especificaciones
Opcionales (tamaño, dimensiones, material, cuidado)
Permitir guardar o no guardar estos campos según sea necesario.
- Campos Obligatorios
Precio, Inventario
—
- Opciones
"Rastrear inventario" seleccionado por defecto
Cambiar a "Continuar vendiendo cuando no haya stock" seleccionado por defecto.
- Estados
Activo, Borrador, Oculto
—
- Imágenes
Permite cargar múltiples imágenes, pero solo muestra una y no ajusta el tamaño
Ajustar las imágenes al mismo tamaño para visualización en catálogo.
Funcionalidades




- Filtros y Búsqueda
Funcionan
—
- Editar/Eliminar
Funcionan con advertencia agradable
—
- Exportar
Genera reportes en PDF con logo centrado y membrete debajo
Rediseñar: logo a la izquierda y datos (dirección, RIF, teléfono, correo, eslogan) al lado.


Pedidos
Elemento
Estado
Recomendación
Filtros y Búsqueda
Funcionan
—
Exportar
Funciona con sugerencia de rediseño de logo y título en reportes
—
Nuevo Pedido Manual




- Selección de Cliente
Funciona
—
- Agregar Productos
Permite agregar productos, pero al modificar cantidad de un producto, registra el pedido
Permitir agregar múltiples productos sin registrar el pedido hasta finalizar.
Acciones




- Ver Detalles
No hace nada
—
- Imprimir Factura
No hace nada
—
- Anular Venta
Muestra alerta del navegador (no estilizada)
Usar alertas estilizadas como en el resto del sistema.
Tarjetas
Total Ventas
Validar que los datos sean reales y actualizados.


Clientes
Elemento
Estado
Recomendación
Filtros y Búsqueda
Funcionan
—
Exportar
Funciona con sugerencia de rediseño de logo y título en reportes
—
Nuevo Cliente
Campos: Nombre, Teléfono, Correo, DNI/Pasaporte/Pasaporte, Dirección
Funciona con validación de correo electrónico.
Acciones




- Registrar Venta
Redirige a nueva venta sin cliente preseleccionado
Preseleccionar cliente al registrar una nueva venta desde la página de clientes.
- Registrar Pago
Permite registrar pago, pero no valida si el cliente tiene deuda
Validar que el cliente tenga deuda antes de registrar un pago.
- Ver Detalles
Funciona
—
- Editar/Eliminar
Funcionan
—


Deudas
Elemento
Estado
Recomendación
Visualización
Muestra deudas de clientes
—
Acciones




- Ver Historial
No hace nada
—
- Registrar Pago a Cuenta
No hace nada
Redirigir a popup de registro de pago como en clientes.
- Nueva Deuda
Botón que redirige a página vacía
Eliminar este botón; las deudas se generan con ventas.


Reportes (Dashboard)
Elemento
Estado
Recomendación
Dashboard de Reportes
Muestra tarjetas con cantidades (total vendido, total recaudado, plata en la calle), pero sin gráficos
Agregar gráficos comparativos (barras, líneas, tortas) para métricas de negocio.
Logo
Solo aparece el logo, falta el nombre de la empresa (Soho Boutique)
Mostrar el nombre de la empresa en los reportes además del logo.


3. Recomendaciones Generales
Generar automáticamente el SKU para productos desde el backend.
Rediseñar el flujo de carga de imágenes para que se ajusten al mismo tamaño en el catálogo.
Cambiar la opción por defecto de "Rastrear inventario" a "Continuar vendiendo cuando no haya stock".
Corregir el flujo de agregación de productos en pedidos manuales para permitir múltiples productos sin registrar el pedido.
Estilizar las alertas del sistema para que coincidan con el diseño visual del resto de la página.
Preseleccionar el cliente al registrar una nueva venta desde la página de clientes.
Validar que el cliente tenga deuda antes de registrar un pago.
Eliminar el botón de "Nueva Deuda" en la sección de deudas.
Rediseñar los reportes para que el logo aparezca a la izquierda y los datos (dirección, RIF, teléfono, correo, eslogan) al lado.
Centrar el título de los reportes y mostrar la descripción del listado y la fecha de generación debajo del título.
Agregar gráficos comparativos en el dashboard de reportes para métricas de negocio.
Mostrar el nombre de la empresa (Soho Boutique) en los reportes además del logo.
