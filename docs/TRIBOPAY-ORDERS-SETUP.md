# TriboPay + pedidos persistentes

O checkout grava cada pedido no Supabase antes de solicitar o PIX. O UUID do pedido é enviado à TriboPay como \`externalId\`, e o ID do depósito retornado fica gravado no mesmo registro. Assim, os itens e as quantidades permanecem associados à cobrança sem criar ofertas novas.

## 1. Banco

Execute o SQL de \`supabase/migrations/20261104000000_create_orders.sql\` no SQL Editor do projeto Supabase.

## 2. Secrets do servidor

Configure no ambiente de execução do site:

- \`SUPABASE_URL\`: URL do projeto Supabase.
- \`SUPABASE_SERVICE_ROLE_KEY\`: chave service_role do projeto. Somente no servidor; nunca use prefixo \`VITE_\`.
- \`TRIBOPAY_API_TOKEN\`: token da Cash API TriboPay já utilizado para gerar PIX.

Não coloque esses valores no código-fonte nem em variáveis públicas do navegador.

## 3. Confirmação

A página consulta a Cash API no servidor a cada 5 segundos e atualiza o pedido com os estados documentados \`pending\`, \`paid\`, \`expired\` e \`cancelled\`. A consulta usa \`GET /deposits/{id}\`.

O webhook permanece desativado até recebermos a documentação oficial de assinatura/autenticação e formato do evento. Nenhuma notificação pública é considerada prova de pagamento.

## 4. Privacidade e segurança

O banco guarda o resumo dos produtos, quantidades, valores, dados básicos do comprador, ID do depósito e estado do pedido. O CPF não é persistido pelo aplicativo. A chave service_role e o token TriboPay são usados apenas em código de servidor.

## 5. Importante

Sem configurar os dois secrets do Supabase e executar a migration, o checkout não cria novas cobranças: isso evita gerar PIX sem um pedido persistido para vinculá-lo.
