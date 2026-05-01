//Selecció d'elements del DOM on s'injectarà el contingut
const list = document.getElementById("llista-videos");
const cercador = document.getElementById("cercador");
const contingutUltim = document.getElementById("contingut-ultim");

// Es fa servir fetch per carregar el JSON extern
fetch('data.json')
  .then(response => response.json()) // Converteix la resposta a format objecte JS
  .then(data => {
    const videos = data.continguts; // Accedim a l'array de videos del JSON

    // Funció per renderitzar les targetes dels vídeos
    function pintarVideos(filtre = "") {
      list.innerHTML = ""; // Esborra el contingut actual per evitar duplicats al filtrar
      
      // Recupera l'objecte de visites del LocalStorage (o un buit si no existeix)
      const visites = JSON.parse(localStorage.getItem('visites')) || {};

      videos.forEach(video => {
        // Normlitza el text per fer una cerca que no distingeix entre majúscules i minúscules
        const textCerca = filtre.toLowerCase();

        //Comprova si el text coincideix amb el títol o amb algun personatge utilitzant .some
        const coincideix = video.titol.toLowerCase().includes(textCerca) || 
                          video.personatges.some(p => p.toLowerCase().includes(textCerca));

        if (coincideix) {
          const numVisites = visites[video.id] || 0;

          // Creació dinàmica de l'estructura HTML per a cada targeta de video
          const card = document.createElement("div");
          card.className = "video-card"; 
          card.innerHTML = `
            <a href="reproductor.html?id=${video.id}" style="text-decoration:none; color:inherit;">
              <img src="${video.miniatura}" alt="${video.titol}" style="width:100%; border-radius:8px;">
              <div style="padding:10px;">
                <h3 style="margin:5px 0;">${video.titol}</h3>
                <p style="font-size:0.8rem; margin:2px 0;"><b>Descripció:</b> ${video.descripcio}</p>
                <p style="font-size:0.8rem; margin:2px 0;"><b>Personatges:</b> ${video.personatges}</p>
                <p style="font-size:0.8rem; margin:2px 0;"><b>Data de Publicació:</b> ${video.data_publicació}</p>
                <p style="font-size:0.8rem; margin:2px 0;"><b>Categoria:</b> ${video.categoria}</p>
                <p style="font-size:0.8rem; margin:2px 0;"><b>Durada total:</b> ${video.durada_total}</p>
                <p style="font-size:0.8rem; color:red;">Vuegades vist: ${numVisites}</p>
              </div>
            </a>
          `;

          // Event listener per gestionar la persistència abans de canviar de pàguina
          // Guardem el comptador de clicks i marquem aquest vídeo com a últim vist
          card.querySelector('a').onclick = () => {
            visites[video.id] = numVisites + 1;
            localStorage.setItem('visites', JSON.stringify(visites));
            localStorage.setItem('ultim_id', video.id); // Guarda l'ID
          };

          list.appendChild(card); //Afegeix la targeta al contenidor principal
        }
      });
    }

    // Funció per recuperar i mostrar l'últim vídeo amb el que l'usuari ha interectuat
    // Consulta el LocalStorage per obtenir l'ID guardat. (Ajuda de IA)
    function mostrarUltimVist() {
      const ultimId = localStorage.getItem('ultim_id');
      if (ultimId) {
        // Busca l'objecte vídeo complet que coincideix amb l'ID guardat
        const ultimVideo = videos.find(v => v.id == ultimId);
        if (ultimVideo) {
          contingutUltim.innerHTML = `
            <div class="video-card" style="width: 50%; opacity: 0.8;">
              <a href="reproductor.html?id=${ultimVideo.id}" style="text-decoration:none; color:inherit;">
                <img src="${ultimVideo.miniatura}" style="width:100%; border-radius:8px;">
                <div style="padding:10px;">
                  <h4>${ultimVideo.titol}</h4>
                  <p style="font-size:0.7rem;">Prem per continuar veient</p>
                </div>
              </a>
            </div>
          `;
        }
      }
    }

    //Execució inicial al carregar la pàguina
    pintarVideos();
    mostrarUltimVist();

    // Event listener per cercar al buscador en temps real
    // S'executa cada vuegada que l'usuari escriu una lletra
    cercador.addEventListener("input", (e) => {
      pintarVideos(e.target.value);
    });
  })
  // Gestió d'errors en cas de que el fitxer JSON no estigui disponible o sigui corrupte
  .catch(error => console.error("Error carregant el JSON:", error));