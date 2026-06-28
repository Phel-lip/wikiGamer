const API_KEY = "e4a75ba65d75420c9081d42ec1f36e35";

const container = document.getElementById("games-container");
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.getElementById("close-modal");

/* Helpers */

function mostrarMensagem(texto){
    container.innerHTML = `<p class="loading">${texto}</p>`;
}

function fecharModal(){
    modal.classList.add("hidden");
}

async function buscarAPI(url){

    const response = await fetch(url);

    return await response.json();
}

function criarGeneros(generos){

    return generos
        .slice(0, 2)
        .map(genero =>
            `<span class="genre-tag">${genero.name}</span>`
        )
        .join("");
}

/* Jogos */

async function buscarJogos(){

    try{

        mostrarMensagem("Carregando jogos...");

        const data = await buscarAPI(`https://api.rawg.io/api/games?key=${API_KEY}`);

        renderizarJogos(data.results);

    }catch(error){

        container.innerHTML = `<p>Erro ao carregar jogos.</p>`;

        console.log(error);
    }
}

async function pesquisarJogo(nome){

    try{

        mostrarMensagem("Pesquisando...");

        const data = await buscarAPI(
            `https://api.rawg.io/api/games?key=${API_KEY}&search=${nome}`
        );

        renderizarJogos(data.results);

    }catch(error){

        console.log(error);
    }
}

function renderizarJogos(jogos){

    container.innerHTML = jogos
        .map(jogo => `
            <article class="card" onclick="abrirDetalhes(${jogo.id})">

                <img src="${jogo.background_image}" alt="${jogo.name}">

                <div class="card-content">

                    <h2>${jogo.name}</h2>

                    <div class="genres">${criarGeneros(jogo.genres)}</div>

                    <p>⭐ ${jogo.rating}</p>

                    <p>📅 ${jogo.released}</p>

                </div>

            </article>
        `)
        .join("");
}

/* Modal */

async function abrirDetalhes(id){

    try{

        const jogo = await buscarAPI(
            `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
        );

        const relacionadosData = await buscarAPI(
            `https://api.rawg.io/api/games/${id}/game-series?key=${API_KEY}`
        );

        const jogosRelacionados =
            relacionadosData.results.length > 0
                ? relacionadosData.results
                    .slice(0, 3)
                    .map(jogo => `<li>${jogo.name}</li>`)
                    .join("")
                : "<li>Nenhum jogo semelhante encontrado.</li>";

        modalBody.innerHTML = `

            <img
                src="${jogo.background_image}" style="
                    width:100%;
                    border-radius:12px;
                    margin-bottom:20px;
                "
            >

            <h2>${jogo.name}</h2>

            <div class="game-info">

                <p>⭐ ${jogo.rating}</p>

                <p>🎯 ${jogo.metacritic || "N/A"}</p>

                <p>📅 ${jogo.released}</p>

                <p>⏱️ ${jogo.playtime || "N/A"} hours</p>

                <p>
                    🛠️ ${
                        jogo.developers
                            ?.map(dev => dev.name)
                            .join(", ") || "N/A"
                    }
                </p>

                <p>
                    🎮 ${
                        jogo.platforms
                            ?.map(platform => platform.platform.name)
                            .join(", ") || "N/A"
                    }
                </p>

            </div>

            <br>

            <h3>🎮 Similar Games</h3>

            <br>

            <ul>${jogosRelacionados}</ul>

            <br>

            <p>${jogo.description_raw}</p>

        `;

        modal.classList.remove("hidden");

    }catch(error){

        console.log(error);
    }
}

/* Eventos */

form.addEventListener("submit", event => {

    event.preventDefault();

    const nome = input.value.trim();

    if(nome){
        pesquisarJogo(nome);
    }else{
        buscarJogos();
    }
});

closeModalBtn.addEventListener("click", fecharModal);

/* Inicialização */

buscarJogos();
