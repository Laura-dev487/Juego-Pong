// Variables de estado del juego
const estadoJuego = {
    juegoTerminado: false,
    juegoEnPausa: true, // Inicialmente en pausa
    mostrarCartel: false,
    textoCartel: ""
};

const maxVelocidadX = 8;
const maxVelocidadY = 6;

// Inicializa el juego llamando a gameLoop por primera vez
window.onload = function () {
    iniciarJuego();
};

function iniciarJuego() {
    estadoJuego.juegoEnPausa = false;   
    setInterval(aumentarVelocidadGradual, 5000);// Inicia el intervalo de aumento de velocidad gradual
    gameLoop();
}

function aumentarVelocidadGradual() {
    pelota.velocidadX *= 1.01; // Incremento de la velocidad
    pelota.velocidadY *= 1.01;
   
}

const INCREMENTO_VELOCIDAD_X = 1.02; // Un incremento menor para mantener la progresión gradual
// Función para aumentar gradualmente la velocidad de la pelota
function aumentarVelocidadPelota() {
    pelota.velocidadX *= 1.1; // Aumenta un 10% en X
    pelota.velocidadY *= 1.1; // Aumenta un 10% en Y
}

// Llama a esta función cada cierto tiempo (por ejemplo, cada 5 segundos)
setInterval(aumentarVelocidadGradual, 5000); // Aumenta la velocidad cada 5 segundos


// Configuración del canvas
const canvas = document.getElementById("pongCanvas");
const contexto = canvas.getContext("2d");

// Constantes para la configuración del juego
const RAQUETA_ANCHO = 10;
const RAQUETA_ALTO = 100;
const VELOCIDAD_RAQUETA_JUGADOR = 30;
const PUNTAJE_MAXIMO = 25;

// Sonidos del juego
const sonidoGol = new Audio("sonidos/gol.mp3");
const sonidoGolpes = new Audio("sonidos/golpes.wav");
const sonidoGameOver = new Audio("sonidos/game_over_mono.wav");
const sonidoGanaste = new Audio("sonidos/ganaste.mp3");

// Imágenes del juego
const imagenPelota = new Image();
const imagenRaquetaJugador = new Image();
const imagenRaquetaComputadora = new Image();
imagenPelota.src = "imagenes/bola.png";
imagenRaquetaJugador.src = "imagenes/barra1.png";
imagenRaquetaComputadora.src = "imagenes/barra2.png";

// Variable para controlar si las imágenes están cargadas
let imagesLoaded = false;

// Función que verifica si todas las imágenes se han cargado
function verificarCargaImagenes() {
    imagesLoaded = imagenPelota.complete && imagenRaquetaJugador.complete && imagenRaquetaComputadora.complete;
    if (imagesLoaded) iniciarJuego();
}

// Evento para verificar cuando cada imagen se ha cargado
imagenPelota.onload = verificarCargaImagenes;
imagenRaquetaJugador.onload = verificarCargaImagenes;
imagenRaquetaComputadora.onload = verificarCargaImagenes;

// Clase para las Raquetas
class Raqueta {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    mover(direccion) {
        this.y = Math.max(0, Math.min(this.y + direccion * this.speed, canvas.height - this.height));
    }
}

const jugador = new Raqueta(10, canvas.height / 2 - 50, RAQUETA_ANCHO, RAQUETA_ALTO, VELOCIDAD_RAQUETA_JUGADOR);
const computadora = new Raqueta(canvas.width - 20, canvas.height / 2 - 50, RAQUETA_ANCHO, RAQUETA_ALTO, 4);

// Variables para la pelota
const pelota = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radio: 10,
    velocidadX: 6,
    velocidadY: 4,
};

// Variables del puntaje
let puntajeJugador = 0;
let puntajeComputadora = 0;

// Funciones de eventos táctiles
canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);

function touchStartHandler(e) {
    handleTouch(e);
}

function touchMoveHandler(e) {
    handleTouch(e);
    e.preventDefault();
}

function handleTouch(e) {
    const touch = e.touches[0];
    let paddle; 
    if (touch.clientX < canvas.width / 2) {
        paddle = jugador;
    } else {
        paddle = computadora;
    }

        let newY = touch.clientY - paddle.height / 2;

    // Condicion para que la raqueta no se salga del canvas
    if (newY < 0) {
        newY = 0;
    } else if (newY + paddle.height > canvas.height) {
        newY = canvas.height - paddle.height;
    }

    paddle.y = newY;
}


// Clase para las Partículas
class Particula {
    constructor(x, y, velocidadX, velocidadY, tamaño, color, alpha) {
        this.x = x;
        this.y = y;
        this.velocidadX = velocidadX;
        this.velocidadY = velocidadY;
        this.tamaño = tamaño;
        this.color = color;
        this.alpha = alpha;
        this.tiempoDeVida = Math.random() * 100;
    }

    update() {
        this.x += this.velocidadX;
        this.y += this.velocidadY;
        this.tiempoDeVida--;
        this.alpha = Math.max(0, this.alpha - 0.02); // Disminuir la transparencia gradualmente
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamaño, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Array para almacenar las partículas
let particulas = [];

// Función para crear partículas en una colisión
function crearParticulas(x, y) {
    particulas.push(...Array.from({ length: 10 }, () => 
        new Particula(x, y, Math.random() * 10 - 5, Math.random() * -10, Math.random() * 2, 'rgba(255, 255, 255, 1)', 1)
    ));
}

// Función para dibujar y actualizar partículas
function actualizarParticulas() {
    particulas = particulas.filter(p => p.tiempoDeVida > 0); // Elimina partículas muertas
    particulas.forEach(p => {
        p.update();
        p.draw(contexto);
    });
}

// Función para reiniciar el estado de la pelota
function resetPelota() {
    pelota.x = canvas.width / 2;
    pelota.y = canvas.height / 2;
    pelota.velocidadX = 5 * (Math.random() < 0.5 ? 1 : -1); // Dirección aleatoria
    pelota.velocidadY = 3;
}

// Función para verificar si hay un ganador
function checkGameOver() {
    if (puntajeJugador >= PUNTAJE_MAXIMO || puntajeComputadora >= PUNTAJE_MAXIMO) {
        estadoJuego.juegoTerminado = true;
        estadoJuego.mostrarCartel = true;
        estadoJuego.textoCartel = puntajeJugador >= PUNTAJE_MAXIMO ? "Ganaste" : "Game Over";
        document.getElementById("startButton").textContent = "Comenzar";
        const sonido = puntajeJugador >= PUNTAJE_MAXIMO ? sonidoGanaste : sonidoGameOver;
        sonido.play();
    }
}


// Función para mover la pelota y manejar colisiones
function moverPelota() {
    if (estadoJuego.juegoEnPausa || estadoJuego.juegoTerminado) return;
    
    // Actualiza la posición de la pelota
    pelota.x += pelota.velocidadX;
    pelota.y += pelota.velocidadY;

    // Colisión con las paredes superior e inferior
    if (pelota.y + pelota.radio > canvas.height || pelota.y - pelota.radio < 0) {
        pelota.velocidadY = -pelota.velocidadY;
    }

    // Colisiones con las raquetas
    colisionRaqueta(jugador);
    colisionRaqueta(computadora);

    // Verifica si hay un punto anotado
    if (pelota.x + pelota.radio > canvas.width || pelota.x - pelota.radio < 0) {
        const esLadoJugador = pelota.x < canvas.width / 2;
        esLadoJugador ? puntajeComputadora++ : puntajeJugador++;
        
        sonidoGol.play();
        checkGameOver();
        
        if (!estadoJuego.juegoTerminado) {
            aumentarVelocidadPelota(); // Aumenta la velocidad después de un punto
            resetPelota(); // Reinicia la posición de la pelota en el centro
        }
    }
}


// Función para verificar colisiones con las raquetas
function colisionRaqueta(raqueta) {
    const maxVelocidadY = 6; // Límite de velocidad en Y, ajusta según tu preferencia

    if (
        pelota.x - pelota.radio < raqueta.x + raqueta.width &&
        pelota.x + pelota.radio > raqueta.x &&
        pelota.y - pelota.radio < raqueta.y + raqueta.height &&
        pelota.y + pelota.radio > raqueta.y
    ) {
        // Calcula el punto de impacto en la raqueta para ajustar el ángulo de rebote
        let puntoImpacto = (pelota.y - (raqueta.y + raqueta.height / 2)) / (raqueta.height / 2);

        // Cambia la dirección horizontal de la pelota
        pelota.velocidadX = -pelota.velocidadX * INCREMENTO_VELOCIDAD_X; // Aumenta la velocidad en X
        pelota.velocidadY = puntoImpacto * 5;

        // Limita la velocidad en Y
        pelota.velocidadY = Math.max(-maxVelocidadY, Math.min(pelota.velocidadY, maxVelocidadY));

        // Ajusta la posición de la pelota para que no se quede pegada en la raqueta
        if (pelota.x < canvas.width / 2) {
            pelota.x = raqueta.x + raqueta.width + pelota.radio;
        } else {
            pelota.x = raqueta.x - pelota.radio;
        }

        sonidoGolpes.play();
        crearParticulas(pelota.x, pelota.y);
    }
}


// Función para mover la raqueta de la computadora

function moverRaquetaComputadora() {
    const velocidadComputadora = 2; // Velocidad de movimiento más lenta para suavizar el seguimiento
    const distanciaMinima = 50; // Distancia mínima entre la pelota y la raqueta antes de moverse

    // La raqueta de la computadora solo sigue la pelota si está en su mitad de la cancha
    if (pelota.x > canvas.width / 2) {
        // Verifica la posición de la pelota en relación con la raqueta de la computadora
        if (pelota.y < computadora.y + computadora.height / 2 - distanciaMinima) {
            computadora.y -= velocidadComputadora; // Mueve hacia arriba
        } else if (pelota.y > computadora.y + computadora.height / 2 + distanciaMinima) {
            computadora.y += velocidadComputadora; // Mueve hacia abajo
        }

        // Limitar la posición para que la raqueta no se salga del canvas
        computadora.y = Math.max(0, Math.min(computadora.y, canvas.height - computadora.height));
    }
}

// Funciones para dibujar elementos del juego
function dibujar() {
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagenPelota, pelota.x - pelota.radio, pelota.y - pelota.radio, pelota.radio * 2, pelota.radio * 2);
    contexto.drawImage(imagenRaquetaJugador, jugador.x, jugador.y, jugador.width, jugador.height);
    contexto.drawImage(imagenRaquetaComputadora, computadora.x, computadora.y, computadora.width, computadora.height);
    contexto.fillStyle = "#fff";
    contexto.font = "32px Arial";
    contexto.fillText(puntajeJugador, canvas.width / 2 - 50, 40);
    contexto.fillText(puntajeComputadora, canvas.width / 2 + 50, 40);
    if (estadoJuego.mostrarCartel) {
        contexto.fillStyle = "rgba(0, 0, 0, 0.8)";
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.fillStyle = "#fff";
        contexto.font = "64px Arial";
        contexto.textAlign = "center";
        contexto.textBaseline = "middle";
        contexto.fillText(estadoJuego.textoCartel, canvas.width / 2, canvas.height / 2);
    }
    actualizarParticulas();
}


// Bucle de actualización del juego
function gameLoop() {
    // Solo ejecuta el bucle si el juego no está en pausa ni terminado
    if (!estadoJuego.juegoEnPausa && !estadoJuego.juegoTerminado) {
        moverPelota();              // Mueve la pelota y maneja colisiones
        moverRaquetaComputadora();  // Sigue la pelota en el lado de la computadora
    }
    
    // Dibuja el estado actual del juego en el canvas
    dibujar();
    
    // Llama de nuevo a gameLoop en el próximo frame
    requestAnimationFrame(gameLoop);
}




// Eventos de teclado y botón de inicio
document.addEventListener("keydown", (event) => {
    const direccion = event.keyCode === 38 ? -1 : event.keyCode === 40 ? 1 : 0;
    jugador.mover(direccion);
});

document.getElementById("startButton").addEventListener("click", () => {
    if (estadoJuego.juegoTerminado) {
        puntajeJugador = 0;
        puntajeComputadora = 0;
        estadoJuego.juegoTerminado = false;
        estadoJuego.mostrarCartel = false;
        resetPelota();
        document.getElementById("startButton").textContent = "Pausa";
        estadoJuego.juegoEnPausa = false;
    } else {
        estadoJuego.juegoEnPausa = !estadoJuego.juegoEnPausa;
        document.getElementById("startButton").textContent = estadoJuego.juegoEnPausa ? "Comenzar" : "Pausa";
    }
});

// Inicialización
window.onload = function () {
    let imagesLoaded = 0;
    const totalImages = 3;

    imagenPelota.onload = () => { if (++imagesLoaded === totalImages) iniciarJuego(); };
    imagenRaquetaJugador.onload = () => { if (++imagesLoaded === totalImages) iniciarJuego(); };
    imagenRaquetaComputadora.onload = () => { if (++imagesLoaded === totalImages) iniciarJuego(); };
}



