# Cripto Converter

Una aplicación web estática y minimalista para convertir entre criptomonedas y divisas fiat en tiempo real, con soporte para conversiones bidireccionales entre todos los pares.

## Características

- **12 Criptomonedas soportadas**: BTC, ETH, BNB, ADA, SOL, XRP, DOT, DOGE, AVAX, MATIC, LTC, LINK
- **7 Monedas fiat**: USD, EUR, GBP, JPY, CAD, AUD, CHF
- **Conversión universal**: Convierte entre cualquier par de monedas:
  - Cripto ↔ Fiat
  - Cripto ↔ Cripto
  - Fiat ↔ Fiat
- **Factores de conversión en memoria**: Todos los pares se calculan y almacenan para conversiones instantáneas
- **Conversión bidireccional**: Edita cualquier campo (origen o destino) y el otro se actualiza automáticamente
- **Actualización automática** cada 30 segundos
- **Tema claro/oscuro** con persistencia en localStorage
- **Diseño responsivo** optimizado para móviles y desktop
- **Grid de criptomonedas** con información detallada:
  - Precio actual
  - Cambio en 24h
  - Market Cap
  - Volumen 24h
- **SEO optimizado**: Sitemap, robots.txt, meta tags, structured data
- **Sin dependencias**: HTML, CSS y JavaScript vanilla
- **API pública**: CoinGecko API (sin necesidad de API key)

## Estructura del Proyecto

```
cripto-price-frontend/
├── index.html       # Estructura HTML
├── styles.css       # Estilos CSS con temas claro/oscuro
├── app.js          # Lógica JavaScript
└── README.md       # Este archivo
```

## Uso

1. Abre `index.html` en tu navegador
2. Selecciona cualquier moneda de origen (cripto o fiat)
3. Ingresa la cantidad a convertir
4. Selecciona la moneda de destino
5. El resultado se actualiza automáticamente
6. Puedes editar el campo de destino para calcular en reversa
7. Usa el botón de intercambio para invertir las monedas
8. Haz clic en las tarjetas de criptomonedas para seleccionarlas en el convertidor

## Características Técnicas

### API
- **Endpoint**: CoinGecko API v3
- **Sin límites**: No requiere API key para uso básico
- **Datos en tiempo real**: Actualización cada 30 segundos

### Rendimiento
- **Carga rápida**: Sin frameworks pesados
- **Optimizado**: CSS moderno con variables
- **Responsive**: Mobile-first design

### Temas
- Detección automática del tema del sistema
- Cambio manual entre claro/oscuro
- Persistencia de preferencias

## Navegadores Soportados

- Chrome/Edge (últimas versiones)
- Firefox (últimas versiones)
- Safari (últimas versiones)

## Licencia

MIT