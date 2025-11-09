# Convertidor de Criptomonedas

Una aplicación web estática y minimalista para convertir criptomonedas a diferentes monedas fiat en tiempo real.

## Características

- **12 Criptomonedas soportadas**: BTC, ETH, BNB, ADA, SOL, XRP, DOT, DOGE, AVAX, MATIC, LTC, LINK
- **7 Monedas fiat**: USD, EUR, GBP, JPY, CAD, AUD, CHF
- **Actualización automática** cada 30 segundos
- **Tema claro/oscuro** con persistencia en localStorage
- **Diseño responsivo** optimizado para móviles y desktop
- **Grid de criptomonedas** con información detallada:
  - Precio actual
  - Cambio en 24h
  - Market Cap
  - Volumen 24h
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
2. Selecciona la criptomoneda y la cantidad a convertir
3. Selecciona la moneda de destino
4. El resultado se actualizará automáticamente
5. Haz clic en las tarjetas de criptomonedas para seleccionarlas en el convertidor

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