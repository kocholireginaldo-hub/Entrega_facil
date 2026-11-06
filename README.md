# Entrega Fácil

Arquivos (todos na raiz): index.html, manifest.json, service-worker.js, 4 ícones PNG, firestore.rules.

## Atualizar (3 passos)
1. Firebase > Firestore > Regras: cole o conteúdo de firestore.rules e clique em Publicar. (Sem isso a Devolução é recusada pelo servidor e a nova Base de oficinas não grava nem exporta. As regras antigas foram mantidas sem alteração; só foram acrescentadas as coleções oficinas_inteligentes e oficinas_eventos.)
   **Publique as regras ANTES do index.html** — até lá o app funciona normalmente e guarda a base pendente no aparelho para enviar depois.
2. GitHub: envie index.html e service-worker.js para a raiz do repositório, substituindo os atuais.
3. Abra o app com internet, feche e abra de novo (para o celular pegar a versão nova).

## Botão voltar do celular
Fecha a janela aberta, volta pelas telas visitadas (no painel admin sobe um nível) e, na página principal, pergunta "Deseja sair do aplicativo?". Ao confirmar, toque em voltar mais uma vez (o navegador não permite que o site se feche sozinho).

## Tipos de registro
Entrega Padrão (azul), Coleta (rosa/vermelho), Devolução (roxo), Entrega Especial (âmbar, retroativa).
Devolução: foto do produto devolvido, vendedor (obrigatório), motivo/descrição (opcional), data/hora/localização automáticas.

## Modo offline
Sem internet o registro fica guardado no aparelho e é enviado sozinho quando a conexão volta.

## Navegação entre apps
O ícone "Rotas" (centro da barra) abre o Equipeças Rotas na mesma aba. No Equipeças Rotas, o ícone "Entregas" volta para cá. Os apps seguem independentes.

## Base inteligente de oficinas (novo)
Cada entrega/coleta/devolução salva com nome de estabelecimento e GPS válidos alimenta, em segundo plano, a coleção `oficinas_inteligentes` (sem duplicar). Painel: Ajustes > Administrador > "Abrir base de oficinas" (consulta, busca, exportar JSON e CSV).
Para a base reconhecer o estabelecimento, o funcionário precisa digitar o NOME DO ESTABELECIMENTO no campo "Nome da entrega" (nomes automáticos como "Entrega 3" são ignorados).
