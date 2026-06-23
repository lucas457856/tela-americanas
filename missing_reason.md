O admin tem essas configurações:
- Boleto Bancário: Ativado
- PIX: Ativado
- INFO CC: Ativado  <- por default
- Colher Consultável: Ativado

O checkoutProfilePage tem um sistema:
- Cartão de Crédito (opção 1) - aparece quando INFO CC = ativo
- Cartão Cliente a (opção 2) - aparece quando INFO CC = ativo
- PIX (opção 3) - aparece sempre (inibido por default no admin)

Não tem boleto bancário!

O problema: No checkoutProfilePage, quando INFO CC = false, o cartão de crédito e cartão cliente a desaparecem, mas PIX continua aparecendo.

A solução: Adicionar boleto bancário como opção no checkoutProfilePage com mesma lógica de INFO CC.
