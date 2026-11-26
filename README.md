# Portfólio

Portfólio estático bilíngue, com preferência de tema e idioma salva no navegador quando o armazenamento está disponível. Os estilos e fontes externos requerem internet.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://localhost:8000/>.

## Estrutura

`index.html`: conteúdo, estilos e scripts.

A CI valida o HTML e verifica arquivos e âncoras locais. Links e serviços externos não são consultados pela CI.
