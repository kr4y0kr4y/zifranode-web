# Tarjeta digital privada en Cloudflare Pages

La tarjeta está protegida mediante enlaces firmados de 90 días y revocables. Las rutas `/contacto/sebastian-pinto/` y sus activos devuelven `404` sin una cookie de sesión válida. El cliente solo recibe esa cookie después de abrir un enlace firmado.

## Configuración única en Cloudflare

1. Publica este repositorio como un proyecto **Cloudflare Pages**. Pages detecta las Functions dentro de `functions/` y `_routes.json` limita su ejecución a las rutas privadas.
2. Crea un namespace de **Workers KV** (por ejemplo, `zifranode-card-links`) y vincúlalo al proyecto Pages como `CARD_LINKS`.
3. En **Settings > Variables and Secrets**, crea como secretos cifrados:
   - `CARD_LINK_SECRET`: valor aleatorio de al menos 32 bytes.
   - `CARD_ADMIN_TOKEN`: segundo valor aleatorio e independiente, utilizado solo para crear enlaces.
4. En Cloudflare Zero Trust, protege `/admin/*` con una aplicación Access que solo permita tu correo. El token administrativo sigue siendo obligatorio como segunda capa.
5. Para una ruta de control de acceso, configura Pages Functions en modo **fail closed**.

No guardes estos valores en Git, en archivos del sitio ni en el código. `.dev.vars` y `.env` ya están ignorados.

## Crear un enlace para un cliente

Envía una solicitud POST al endpoint administrativo desde un equipo de confianza. Sustituye los valores entre corchetes; el token nunca debe incorporarse en una URL, QR o repositorio.

```sh
curl -X POST 'https://zifranode.cl/admin/crear-enlace-sebastian-pinto' \
  -H 'Authorization: Bearer [CARD_ADMIN_TOKEN]'
```

La respuesta contiene `url` y `expiresAt`. Comparte solamente `url` con el cliente o conviértela en QR. El cliente no verá formularios, contraseñas ni registro.

## Revocar un enlace antes de 90 días

En Workers KV, elimina la clave `sebastian-pinto:[id]`, donde `[id]` es el valor `id` del enlace emitido. Desde ese momento el enlace y su cookie asociada responderán `404`.

La URL firmada es una credencial: una persona que la reciba puede reenviarla mientras esté vigente. No se revela por el encabezado Referrer, no se almacena en caché y no se indexa, pero no existe una forma de impedir que un destinatario autorizado comparta una credencial sin añadir autenticación individual.

## Antes de publicar

`perfil2.jpeg` permanece en la raíz como archivo fuente que no utiliza la tarjeta. Si el proceso de publicación sincroniza todos los archivos del proyecto, elimínalo o exclúyelo antes de desplegar: de otro modo seguiría siendo un recurso público independiente.
