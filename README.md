# Entrega Fácil

Arquivos (todos na raiz): index.html, manifest.json, service-worker.js, 4 ícones PNG, firestore.rules.

## Atualizar (2 passos — sem mudar nada no Firebase desta vez)
1. (Só se ainda não fez) Firebase > Firestore > Regras: cole o conteúdo de firestore.rules e clique em Publicar. Esta versão NÃO alterou as regras. (Sem isso a Devolução é recusada pelo servidor e a nova Base de oficinas não grava nem exporta. As regras antigas foram mantidas sem alteração; só foram acrescentadas as coleções oficinas_inteligentes e oficinas_eventos.)
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

## Visual moderno e ditado por voz
- Novo visual: cabeçalho translúcido, barra inferior flutuante com ícones, cartões com cor por tipo, janelas que deslizam de baixo, tela de login com destaque azul e animações leves (respeita a opção "reduzir movimento" do celular).
- Microfone nos campos de texto (nome da entrega/coleta/devolução, vendedor, motivo/observações e busca do Histórico). Toque no microfone e fale; toque de novo para parar.
- Ao começar a falar, o nome automático ("Entrega 2") é substituído pelo que foi dito. Se a pessoa já tinha digitado algo, a fala é acrescentada ao final.
- Requisitos: Chrome/Edge (Android ou computador), internet e permissão do microfone. Onde o navegador não oferece ditado (ex.: Safari instalado na tela inicial do iPhone) o botão avisa para usar o microfone do teclado do celular.
- Extras: botão "Hoje" no calendário, resumo do dia por tipo, perfil com inicial em Ajustes, botão "Instalar aplicativo" (quando o navegador permite) e vibração curta ao salvar.
