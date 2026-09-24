# Ejercicio 1 — Botón enciende LED

Kit: **Arduino Sensor Kit (Base)** sobre Arduino UNO/Nano.

## Conexiones

| Módulo | Puerto Grove del shield | Pin Arduino |
|--------|-------------------------|-------------|
| Button | `D4`                    | 4           |
| LED    | `D6`                    | 6           |

El cable Grove solo entra en una posición: no hay forma de invertirlo.

## Pasos en el Arduino IDE

1. Abre `01_boton_led.ino`.
2. **Herramientas → Placa**: selecciona tu placa (p. ej. *Arduino Uno*).
3. **Herramientas → Puerto**: selecciona el puerto COM/tty donde aparece la placa.
4. Pulsa **Subir** (flecha →).
5. Abre el **Monitor Serie** a **9600 baudios** para ver el estado del botón.

No hace falta instalar ninguna librería: el ejercicio usa solo `digitalRead` /
`digitalWrite`.

## Variante: modo interruptor (toggle)

`02_boton_led_toggle.ino` enciende el LED con una pulsación y lo apaga con la
siguiente, con antirrebote (*debounce*) por software.

## Si el LED no enciende

- Verifica que el LED está en **D6** y el botón en **D4** (los puertos vienen
  rotulados en el shield).
- Si tu módulo de botón fuera activo en bajo, invierte la comparación:
  `digitalRead(PIN_BOTON) == LOW`.
- Comprueba que el LED del módulo está bien insertado y con la polaridad
  correcta (pata larga = ánodo, hacia el símbolo `+`).
