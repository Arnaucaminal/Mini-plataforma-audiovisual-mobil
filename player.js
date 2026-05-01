// Selecció dels elements de la interfície
const video = document.getElementById("meu-video");
const btnPlay = document.getElementById("btn-play");
const btnVolume = document.getElementById("btn-volume");
const volSlider = document.getElementById("volume-slider");
const progressBar = document.getElementById("progress-bar");
const currTimeTxt = document.getElementById("current-time");
const totalTimeTxt = document.getElementById("total-time");
const playIcon = document.getElementById("play-icon");
const soundIcon = document.getElementById("sound-icon");

// Agafa l'ID del vídeo des de la query string per saber quin contingut carrega
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

// Carrega les dades basant-se en l'ID rebut i fa servir fetch per carregar el JSON extern
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    // Busca el vídeo especific dins l'array de continguts
    const item = data.continguts.find(v => v.id === id);
    if (item) {
      video.src = item.url_video;
      
      // Recupera el punt exacte on l'usuari va deixar el vídeo l'última vuegada (Ajuda de IA)
      // Fa servir una clau única per cada vídeo
      const tempsGuardat = localStorage.getItem(`temps_${id}`);
      if (tempsGuardat) {
        video.currentTime = parseFloat(tempsGuardat);
      }
    }
  });

// Canvia l'estat del vídeo i actualitza l'icona del botó
btnPlay.onclick = () => {
  if (video.paused) {
    video.play();
    playIcon.src = "img/icons/Pause.png";
  } else {
    video.pause();
    playIcon.src = "img/icons/Play.png";
  }
};

// Gestiona el silenciat i actualitza l'icona del so
btnVolume.onclick = () => {
  video.muted = !video.muted;
  if (video.muted) {
    soundIcon.src = "img/icons/Mute.png";
  } else {
    soundIcon.src = "img/icons/Sound.png";
  }
};

// Actualitza el volum del vídeo i sincronitza l'icona del so si arriba a 0
volSlider.oninput = () => {
  video.volume = volSlider.value;
  if (video.volume === 0) {
    soundIcon.src = "img/icons/Mute.png";
  } else {
    soundIcon.src = "img/icons/Sound.png";
    video.muted = false; // Desbloqueja el mute si l'usuari puja el volum manualment
  }
};

// L'esdeveniment timeupdate s'executa constantment mentre el vídeo es reprodueix
video.addEventListener("timeupdate", () => {
  // Càlcul del percentatge per a la barra de progrés visual
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.value = percent || 0;
  
  // Mostrar temps actual i total
  currTimeTxt.innerText = formatarTemps(video.currentTime);
  totalTimeTxt.innerText = formatarTemps(video.duration);

  // Guarda automàticament el progés al LocalStorage
  localStorage.setItem(`temps_${id}`, video.currentTime);
});

// Quan el vídeo s'acaba torna a posar la icona de Play
video.onended = () => {
    playIcon.src = "img/icons/Play.png";
};

// Permet saltar a qualsevol punt del vídeo movent l'imput range
progressBar.oninput = () => {
  const salt = (progressBar.value / 100) * video.duration;
  video.currentTime = salt;
};

// Converteix segons en format de rellotge mm:ss
function formatarTemps(segons) {
  if (isNaN(segons)) return "00:00";

  // Es crea una variable nova i es sumen els segons (multiplicats per 1000)
  const data = new Date(segons * 1000);

  // Utilitza la funció del navegador per extreure només minuts i segons amb format de 2 dígits
  return data.toLocaleTimeString('en-GB', { minute: '2-digit', second: '2-digit' });
}