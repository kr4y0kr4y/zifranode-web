# Tarjeta privada sin Cloudflare Access

La solución local no requiere Cloudflare Zero Trust, tarjeta de crédito ni suscripción. Los enlaces nuevos son códigos aleatorios de 128 bits que vencen a los 90 días. Solo se guardan en Workers KV; se pueden revocar eliminando su clave. La web pública no incluye un endpoint administrativo para crearlos. Los enlaces firmados anteriores siguen funcionando hasta su vencimiento y aún usan `CARD_LINK_SECRET`.

## Preparación de la versión

- Pages `zifranode-web` usa el build `python3 scripts/build_site.py && python3 scripts/check_site.py` y la salida `dist`. Los despliegues automáticos desde `main` están habilitados.
- Pages Functions está en **Fail closed**. `CARD_LINKS` está vinculado a KV. `CARD_LINK_SECRET` y `CARD_ADMIN_TOKEN` aparecen como secretos cifrados; sus valores no se leyeron ni verificaron.
- La regla de rate limiting está activa para `/admin/*`, `/t/*` y `/tarjeta/*`: 10 solicitudes por IP cada 10 segundos, bloqueo de 10 segundos. Tras publicar este código, `/admin/*` ya no tendrá Function.
- Cloudflare Access no se configuró. La nueva arquitectura no lo necesita porque no expone operaciones administrativas desde la web.
- Las vistas previas de Pages son públicas por defecto; se debe revisar su alcance antes de compartirlas.

## Publicación y verificación

Publicar exclusivamente `dist/`. El build permite solo los activos públicos; los originales de la tarjeta privada quedan fuera de `dist` y sus recursos se integran en la Function que exige una cookie válida. `_routes.json` solo invoca Functions en las rutas privadas. Antes de fusionar una versión, comprobar un build de vista previa, los bindings y el flujo completo. No se necesita activar Zero Trust.

`CARD_LINKS` debe seguir vinculado en producción. Mantén `CARD_LINK_SECRET` mientras existan enlaces firmados antiguos. `CARD_ADMIN_TOKEN` se puede eliminar de Pages después de publicar esta versión, pues ya no habrá endpoint administrativo.

## Crear un enlace sin pagar

En el equipo de confianza, desde este proyecto:

```sh
python3 scripts/issue_private_card.py issue
```

El comando genera una URL `https://zifranode.cl/t/[código]`, una clave `access:[código]`, un valor JSON y una expiración Unix. **El enlace no funcionará hasta guardar la clave en el namespace KV vinculado como `CARD_LINKS`.** Puedes agregarla manualmente en el panel Workers KV, con la expiración indicada. No compartas el código ni la salida antes de guardar la clave; la URL es una credencial.

Para automatizar la escritura, crea un API token limitado al permiso **Account → Workers KV Storage Write** para esta cuenta. Al usar `--write`, el script lee `CF_API_TOKEN`, `CF_ACCOUNT_ID` y `CF_KV_NAMESPACE_ID` del entorno y escribe la clave mediante la API oficial. No guardes el token en Git ni en archivos del sitio:

```sh
python3 scripts/issue_private_card.py issue --write
```

El script no intenta escribir ni borrar nada sin `--write`. El código aleatorio tiene 128 bits de entropía; el valor en KV caduca a los 90 días y la cookie también. Los recursos privados verifican KV en cada solicitud.

## Revocar

```sh
python3 scripts/issue_private_card.py revoke [código]
```

El comando muestra la clave `access:[código]` que debes borrar en Workers KV. Con `--write` la borra por API. Al propagarse la eliminación, la URL y la cookie dejan de autorizar la tarjeta. KV tiene consistencia eventual: la revocación puede tardar 60 segundos o más en algunas ubicaciones. Los enlaces anteriores se revocan eliminando `sebastian-pinto:[id]` en KV.

## Comprobación local

Ejecuta `python3 scripts/build_site.py && python3 scripts/check_site.py`. La salida excluye la tarjeta, su retrato, brochure, scripts de desarrollo y la Function administrativa. Para probar las Functions con KV local se necesita `wrangler pages dev dist --kv=CARD_LINKS`; nunca conectes el KV de producción a una prueba local.

El formulario público usa Web3Forms. Antes de publicar, revisa allí el filtrado de spam y los dominios permitidos. El honeypot y la validación de longitud del sitio son controles complementarios.
