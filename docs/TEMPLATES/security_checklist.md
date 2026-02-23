# Security Checklist

Usar en cada proyecto antes de marcar como "entregable".

## Secretos y credenciales
- [ ] No hay API keys, passwords, o tokens en el código
- [ ] .gitignore incluye: .env, *.key, *.pem, service-account*.json
- [ ] Secretos están en Secret Manager o variables de entorno (no en código)
- [ ] Service accounts usan least privilege (solo roles necesarios)

## Autenticación y autorización
- [ ] Endpoints requieren autenticación (no hay endpoints abiertos sin intención)
- [ ] Roles y permisos están documentados
- [ ] Tokens tienen expiración razonable

## Input validation
- [ ] Todo input del usuario se valida (Pydantic, Zod, o manual)
- [ ] SQL queries usan parámetros (no string concatenation)
- [ ] File uploads validan tipo y tamaño

## Infraestructura
- [ ] HTTPS habilitado (no HTTP plano)
- [ ] CORS configurado correctamente (no wildcard * en producción)
- [ ] Firewall rules son específicas (no 0.0.0.0/0 para todo)
- [ ] Logging habilitado (sin loguear datos sensibles)

## Datos y privacidad
- [ ] PII (datos personales) identificada y documentada
- [ ] Datos en tránsito encriptados (TLS)
- [ ] Datos en reposo encriptados (default en GCP)
- [ ] Retención de datos definida (cuánto tiempo se guardan)

## Dependencias
- [ ] Dependencias están pinneadas (versiones exactas en lock file)
- [ ] No hay dependencias con vulnerabilidades conocidas (npm audit / pip audit)
- [ ] Dockerfile usa imagen base específica (no :latest)
