const API_URL =
  'https://script.google.com/macros/s/AKfycbyhXosy5zH6MP3qjFeY6JWoteU93dsQdeWxayZ-O_J-mxHrn_hI7HLiCYsnSkcnc3SKLA/exec';


async function apiGet(parametros = {}) {

  const url = new URL(API_URL);

  Object.keys(parametros).forEach(function (clave) {
    url.searchParams.append(clave, parametros[clave]);
  });

  const respuesta = await fetch(url.toString(), {
    method: 'GET'
  });

  if (!respuesta.ok) {
    throw new Error(
      'Error HTTP: ' + respuesta.status
    );
  }

  return await respuesta.json();
}


async function apiPost(datos) {

  const respuesta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(datos)
  });

  if (!respuesta.ok) {
    throw new Error(
      'Error HTTP: ' + respuesta.status
    );
  }

  return await respuesta.json();
}
