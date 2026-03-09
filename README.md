# Viajes Altairis - Sistema de Gestión Hotelera B2B (MVP) de Alex

Este proyecto es el Producto Mínimo Viable (MVP) para **Viajes
Altairis**, una plataforma B2B diseñada para la gestión centralizada de
hoteles, tipos de habitaciones, inventario dinámico y reservas.

El sistema garantiza la integridad de los datos evitando el
*overbooking* (sobreventa) mediante un motor de inventario inteligente y
transaccional, y ofrece una experiencia segura a través de un **Control
de Acceso Basado en Roles (RBAC)**.

El objetivo del sistema es proporcionar una herramienta confiable para
agencias o personal administrativo que necesiten gestionar
disponibilidad hotelera en tiempo real sin comprometer la consistencia
del inventario.

------------------------------------------------------------------------

# Stack Tecnológico y Arquitectura

El proyecto está construido bajo una **Arquitectura N-Capas** (Domain,
Application, Infrastructure, Presentation) para el backend, garantizando
**alta cohesión, separación de responsabilidades y bajo acoplamiento**.

## Backend

-   Lenguaje: **C#**
-   Framework: **ASP.NET Core 8.0**
-   Estilo de API: **RESTful API**
-   ORM: **Entity Framework Core**

## Frontend

-   **React**
-   **Next.js 14 (App Router)**
-   **Tailwind CSS**

## Base de Datos

-   **PostgreSQL**
-   Acceso mediante **Entity Framework Core**

## Infraestructura

-   **Docker**
-   **Docker Compose**

El sistema se ejecuta completamente en contenedores para garantizar
**portabilidad, consistencia del entorno y facilidad de despliegue**.

------------------------------------------------------------------------

# Características Principales

## Motor de Inventario Inteligente

El sistema calcula la disponibilidad en tiempo real basándose en la
capacidad física de cada tipo de habitación (`TotalRooms`). Esto permite
que el inventario refleje siempre el número real de habitaciones
disponibles.

------------------------------------------------------------------------

## Prevención de Overbooking

Para evitar la sobreventa de habitaciones, el sistema implementa
validaciones de disponibilidad antes de confirmar una reserva.

El inventario se calcula considerando:

-   habitaciones totales
-   reservas activas
-   modificaciones o cancelaciones

Esto garantiza que el sistema **nunca venda más habitaciones de las
disponibles**.

------------------------------------------------------------------------

## Transacciones Seguras

Cuando una reserva es:

-   editada
-   acortada
-   cancelada

el sistema realiza automáticamente un **reembolso de disponibilidad** en
la base de datos.

Este proceso se ejecuta mediante **transacciones seguras**, evitando
inconsistencias en el inventario.

------------------------------------------------------------------------

## Control de Acceso Basado en Roles (RBAC)

El sistema utiliza autorización basada en roles para controlar el acceso
a las funcionalidades.

### Administrador

Acceso completo al sistema:

-   Gestión de usuarios
-   Creación y edición de hoteles
-   Creación de tipos de habitaciones
-   Ajustes manuales de inventario
-   Gestión completa de reservas

### Agente

Operación diaria del sistema:

-   Gestión de reservas
-   Consulta de disponibilidad en inventario

------------------------------------------------------------------------

## Auto Migración y Data Seed

Al iniciar el sistema por primera vez:

-   la base de datos se crea automáticamente
-   se ejecutan migraciones
-   se inserta un usuario administrador inicial

Esto permite levantar el sistema sin configuraciones adicionales.

------------------------------------------------------------------------

# Guía de Instalación y Despliegue

El proyecto está completamente containerizado.

No es necesario instalar manualmente:

-   .NET SDK
-   Node.js
-   PostgreSQL

Solo necesitas tener instalado **Docker Desktop**.

------------------------------------------------------------------------

# 1. Clonar el repositorio

Abre una terminal y ejecuta:

``` bash
git clone https://github.com/AlexSoul1903/Altaris.Backoffice-MVP.git
cd Altaris.Backoffice-MVP
```

------------------------------------------------------------------------

# 2. Levantar el ecosistema

Desde la raíz del proyecto ejecuta:

``` bash
docker-compose up --build -d
```

Este comando realizará automáticamente:

-   descarga de las imágenes necesarias
-   construcción del backend (.NET)
-   construcción del frontend (Next.js)
-   inicialización de PostgreSQL
-   creación automática de la base de datos
-   ejecución de migraciones

La primera ejecución puede tardar algunos minutos.

------------------------------------------------------------------------

# 3. Acceder a la aplicación

Una vez que los contenedores estén ejecutándose, la aplicación estará
disponible en las siguientes direcciones:

Frontend (Interfaz de Usuario)

http://localhost:3000

Backend (Documentación API - Swagger)

http://localhost:5150/swagger

------------------------------------------------------------------------

# Credenciales de Prueba

El sistema crea automáticamente un usuario administrador inicial.

Rol: Administrador

Email:

alex@gmail.com

Password:

Altairis

Actualmente **no se crea automáticamente un usuario agente**.

------------------------------------------------------------------------

# Detener la Aplicación

Para detener todos los contenedores ejecuta:

``` bash
docker-compose down
```

------------------------------------------------------------------------

# Reiniciar completamente el sistema

Si deseas eliminar también la base de datos y empezar desde cero:

``` bash
docker-compose down -v
```

Esto eliminará:

-   contenedores
-   volúmenes
-   base de datos

------------------------------------------------------------------------

# Autor

Alex Manuel Frías Molina 
