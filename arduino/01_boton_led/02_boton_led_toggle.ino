/*
  Ejercicio 1 (variante) — Botón como interruptor con antirrebote

  Una pulsación enciende el LED, la siguiente lo apaga.
  Conexiones: Botón -> D4, LED -> D6 (Arduino Sensor Kit).
*/

const uint8_t PIN_BOTON = 4;
const uint8_t PIN_LED   = 6;

const unsigned long REBOTE_MS = 50;  // tiempo de antirrebote

bool          ledEncendido    = false;
bool          lecturaAnterior = LOW;
unsigned long ultimoCambio    = 0;

void setup() {
  pinMode(PIN_BOTON, INPUT);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
}

void loop() {
  bool lectura = digitalRead(PIN_BOTON);

  if (lectura != lecturaAnterior) {
    ultimoCambio = millis();          // hubo un cambio: arranca la ventana de rebote
    lecturaAnterior = lectura;
  }

  // Solo aceptamos el flanco de subida cuando la señal ya se estabilizó
  static bool estadoEstable = LOW;
  if (millis() - ultimoCambio > REBOTE_MS && lectura != estadoEstable) {
    estadoEstable = lectura;

    if (estadoEstable == HIGH) {      // flanco: suelto -> presionado
      ledEncendido = !ledEncendido;
      digitalWrite(PIN_LED, ledEncendido ? HIGH : LOW);
    }
  }
}
