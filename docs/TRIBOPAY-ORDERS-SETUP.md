# TriboPay Cash-In PIX com referência de produto

O checkout utiliza diretamente a Cash API da TriboPay para criar um PIX dinâmico. Não depende de Supabase nem de banco externo para gerar a cobrança.

O campo \`externalId\` recebe o código interno do produto (e da variação, quando existir), acompanhado de um sufixo curto e único para diferenciar compras do mesmo produto. Em carrinhos com mais de um produto, a referência começa com \`multi-\` e contém os códigos dos itens.

Exemplos de referência:
- \`chaleira-unitermi-atacama-a1b2c3d4\`
- \`jogo-toalhas-karsten:bosco-azul-a1b2c3d4\`
- \`multi-chaleira-unitermi-atacama+jogo-toalhas-karsten-a1b2c3d4\`

A cobrança continua sendo um único PIX dinâmico pelo total do carrinho. Não é criada oferta e não são enviados \`offer_hash\` ou \`product_hash\`.

## Configuração

Mantenha apenas o Secret de servidor:
- \`TRIBOPAY_API_TOKEN\`

Opcionalmente, \`TRIBOPAY_API_KEY\` é aceito como nome legado. Nunca coloque o token em variável \`VITE_\` nem no código do navegador.

## Confirmação

A página consulta \`GET /deposits/{hash}\` diretamente pela Cash API e atualiza o estado do PIX. A confirmação não depende de banco de pedidos.

O webhook permanece desativado até recebermos a documentação oficial de assinatura/autenticação e formato do evento.
