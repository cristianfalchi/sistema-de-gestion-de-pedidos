SELECT * FROM discv.pedidosremotos 
select tipo, lista, condicion from pedidosremotos where cliente = ? order by fecha desc limit 1

select unidades, precio, internos from pedidosremotos where pedido =  cliente = 12103 order by fecha desc limit 1

SELECT distinct info FROM discv.pedidosremotos 

update pedidosremotos set estado = where pedido = 32280 and cliente = 12430

SELECT distinct producto FROM discv.pedidosremotos limit 0 , 300000

SELECT * FROM discv.pedidosremotos 

SELECT * FROM discv.pedidosremotos where pedido = 32330 and cliente = 13464
update pedidosremotos set ingresada = 0 where pedido = 30664 and cliente = 12103 and secuencia = 6


select pedido, cliente, cli_nom, vendedor, estado, ruta, fecha from pedidosremotos where pedido = 30664 group by pedido, cliente order by fecha desc

select  count(pedido) as cant_ped from (select pedido from pedidosremotos where estado = 'X' group by pedido, cliente ) as pedidos

select pedido, count(producto) as cant_item from pedidosremotos group by pedido order by cant_item

select pedido,producto, secuencia, ruta from pedidosremotos where secuencia = 0 order by pedido desc limit 0 , 99999

select pedido, cliente, ruta from pedidosremotos group by pedido order by ruta desc limit 0, 99999






