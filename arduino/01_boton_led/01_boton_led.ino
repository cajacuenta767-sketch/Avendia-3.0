/*
  Ejercicio 1 — Botón enciende LED
  Hardware: Arduino Sensor Kit (Base) + Arduino UNO/Nano

  Conexiones (cable Grove de 4 hilos):
    Botón  -> puerto D4  del shield
    LED    -> puerto D6  del shield

  Comportamiento:
    Botón presionado  -> LED encendido
    Botón suelto      -> LED apagado

  Nota: el módulo de botón del kit es ACTIVO EN ALTO
  (entrega HIGH al presionar), por eso no se usa INPUT_PULLUP.
*/

const uint8_t PIN_BOTON = 4;   // cambia aquí si lo conectas a otro puerto digital
const uint8_t PIN_LED   = 6;

void setup() {
  pinMode(PIN_BOTON, INPUT);
  pinMode(PIN_LED, OUTPUT);

  digitalWrite(PIN_LED, LOW);  // arrancamos siempre en un estado conocido

  Serial.begin(9600);
  Serial.println(F("Ejercicio 1 listo: presiona el boton."));
}

void loop() {
  bool presionado = (digitalRead(PIN_BOTON) == HIGH);

  digitalWrite(PIN_LED, presionado ? HIGH : LOW);

  // Eco por Monitor Serie solo cuando cambia el estado (evita saturar el puerto)
  static bool anterior = false;
  if (presionado != anterior) {
    Serial.println(presionado ? F("Boton: PRESIONADO -> LED ON")
                              : F("Boton: SUELTO     -> LED OFF"));
    anterior = presionado;
  }
}
